'use strict';

// ── Predefined rules ──────────────────────────────────────────────────────────

const PREDEFINED_RULES = [
  { id: 'youtube-shorts',    domain: 'youtube.com',    displayName: 'YouTube Shorts',          severity: 'high',
    selectors: ['ytd-shorts','#shorts-container','[is-shorts]','ytd-reel-shelf-renderer','[title="Shorts"]'],
    urlPatterns: ['*://*.youtube.com/shorts/*'],
    antiBypassSearchTerms: ['youtube shorts','yt shorts'], antiBypassUrlPatterns: ['*/shorts/*'], enabled: false },
  { id: 'youtube-home',      domain: 'youtube.com',    displayName: 'YouTube Home Feed',        severity: 'medium',
    selectors: ['ytd-browse[page-subtype="home"] #contents'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'youtube-sidebar',   domain: 'youtube.com',    displayName: 'YouTube Recommended',      severity: 'medium',
    selectors: ['#related','ytd-watch-next-secondary-results-renderer'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'instagram-reels',   domain: 'instagram.com',  displayName: 'Instagram Reels',          severity: 'high',
    selectors: ['[href="/reels/"]','a[href*="/reel/"]'],
    urlPatterns: ['*://*.instagram.com/reels/*','*://*.instagram.com/reel/*'],
    antiBypassSearchTerms: ['instagram reels'], antiBypassUrlPatterns: ['*/reels/*'], enabled: false },
  { id: 'tiktok-fyp',        domain: 'tiktok.com',     displayName: 'TikTok For You Page',      severity: 'high',
    selectors: ['[data-e2e="recommend-list"]','.tiktok-1g04lal-DivFeedContainer'],
    urlPatterns: ['*://*.tiktok.com/foryou*'],
    antiBypassSearchTerms: ['tiktok fyp'], antiBypassUrlPatterns: [], enabled: false },
  { id: 'twitter-foryou',    domain: 'x.com',          displayName: 'X/Twitter "For You" Feed', severity: 'medium',
    selectors: ['[aria-label="Timeline: Trending now"]'],
    urlPatterns: ['*://x.com/explore*','*://twitter.com/explore*'],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'reddit-all',        domain: 'reddit.com',     displayName: 'Reddit r/all & r/popular', severity: 'medium',
    selectors: ['a[href="/r/all/"]','a[href="/r/popular/"]'],
    urlPatterns: ['*://*.reddit.com/r/all/*','*://*.reddit.com/r/popular/*'],
    antiBypassSearchTerms: ['r/all'], antiBypassUrlPatterns: ['*/r/all/*'], enabled: false },
  { id: 'facebook-reels',    domain: 'facebook.com',   displayName: 'Facebook Reels',           severity: 'high',
    selectors: ['[aria-label*="Reels"]','[href*="/reel/"]'],
    urlPatterns: ['*://*.facebook.com/reels*'],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'instagram-explore', domain: 'instagram.com',  displayName: 'Instagram Explore',        severity: 'medium',
    selectors: ['[href="/explore/"]'], urlPatterns: ['*://*.instagram.com/explore/*'],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'linkedin-feed',     domain: 'linkedin.com',   displayName: 'LinkedIn Feed',            severity: 'low',
    selectors: ['.scaffold-finite-scroll__content'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
];

// ── Activity log — shown in popup so user can see what's happening ─────────────

const activityLog = [];

function addLog(type, msg, detail = '') {
  activityLog.unshift({ ts: Date.now(), type, msg, detail });
  if (activityLog.length > 40) activityLog.pop();
}

// ── State ─────────────────────────────────────────────────────────────────────

let rules          = [];
let bypassScores   = {};
let bypassAttempts = [];
let tabInjected    = {};   // tabId -> true  (content script confirmed running)
let elementStats   = {};   // ruleId -> count

let daemonPort      = null;
let daemonConnected = false;
let lastSyncAt      = 0;
let lastDaemonError = '';
let bootAt          = Date.now();

const MAX_ATTEMPTS = 200;
const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];

// ── Bootstrap — loads from storage and starts working immediately ─────────────

async function bootstrap() {
  addLog('boot', 'Extension started');

  const d = await chrome.storage.local.get(['rules', 'daemonPort', 'bypassScores', 'bypassAttempts', 'elementStats']);

  if (d.rules && d.rules.length > 0) {
    rules = d.rules;
    addLog('storage', `Loaded ${rules.length} rules from storage`, `${rules.filter(r=>r.enabled).length} enabled`);
  } else {
    rules = PREDEFINED_RULES.map(r => ({ ...r }));
    await chrome.storage.local.set({ rules });
    addLog('storage', `First run — seeded ${rules.length} predefined rules`, 'all disabled by default');
  }

  if (d.bypassScores)  bypassScores  = d.bypassScores;
  if (d.bypassAttempts) bypassAttempts = d.bypassAttempts;
  if (d.elementStats)  elementStats  = d.elementStats;
  if (d.daemonPort)    daemonPort    = d.daemonPort;

  const pushed = await pushRulesToTabs();
  addLog('tabs', `Pushed rules to ${pushed} tab(s)`);

  // Daemon sync runs in background — never blocks
  tryDaemonSync();
}

// ── Push rules to all open tabs, inject content script if missing ─────────────

async function pushRulesToTabs() {
  const enabled = rules.filter(r => r.enabled);
  const tabs = await chrome.tabs.query({});
  let count = 0;

  for (const tab of tabs) {
    if (!tab.id || tab.id <= 0) continue;
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://') || url === '') continue;

    count++;
    chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }, (res) => {
      if (chrome.runtime.lastError) {
        // Content script not in this tab — inject it then send rules
        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })
          .then(() => {
            tabInjected[tab.id] = true;
            addLog('inject', `Injected content script`, url.slice(0, 60));
            chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }).catch(() => {});
          })
          .catch(e => addLog('error', `Inject failed: ${e.message}`, url.slice(0, 50)));
      } else {
        tabInjected[tab.id] = true;
        if (res && res.hidden !== undefined) {
          addLog('css', `Applied rules to tab`, `${res.hidden} elements hidden`);
        }
      }
    });
  }
  return count;
}

// ── Daemon sync — background only, never blocks popup ────────────────────────

async function tryDaemonSync() {
  addLog('daemon', 'Looking for daemon…');
  const port = await discoverPort();

  if (!port) {
    daemonConnected = false;
    lastDaemonError = `Not found on ports ${DAEMON_PORTS.join(', ')}`;
    addLog('daemon', 'Daemon not found — running standalone', lastDaemonError);
    await chrome.storage.local.set({ daemonConnected: false });
    return;
  }

  try {
    addLog('daemon', `Found daemon on :${port} — fetching rules…`);
    const res = await fetch(`http://127.0.0.1:${port}/content-rules`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const fresh = data.rules || [];

    if (fresh.length > 0 && JSON.stringify(fresh) !== JSON.stringify(rules)) {
      rules = fresh;
      await chrome.storage.local.set({ rules });
      await pushRulesToTabs();
      addLog('daemon', `Synced ${fresh.length} rules from daemon`, `${fresh.filter(r=>r.enabled).length} enabled`);
    } else {
      addLog('daemon', `Connected to :${port}`, 'rules unchanged');
    }

    daemonPort = port;
    daemonConnected = true;
    lastSyncAt = Date.now();
    lastDaemonError = '';
    await chrome.storage.local.set({ daemonConnected: true, lastSyncAt, daemonPort: port });
    fetch(`http://127.0.0.1:${port}/extension/heartbeat`, { method: 'POST', signal: AbortSignal.timeout(1000) }).catch(() => {});
  } catch (e) {
    daemonConnected = false;
    lastDaemonError = e.message || String(e);
    addLog('error', `Daemon sync failed: ${lastDaemonError}`);
    await chrome.storage.local.set({ daemonConnected: false });
  }
}

async function discoverPort() {
  if (daemonPort && await pingPort(daemonPort)) return daemonPort;
  for (const p of DAEMON_PORTS) {
    if (await pingPort(p)) return p;
  }
  return null;
}

async function pingPort(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/ping`, { signal: AbortSignal.timeout(700) });
    if (!res.ok) return false;
    return (await res.json()).ok === true;
  } catch (_) { return false; }
}

// ── Toggle rule ───────────────────────────────────────────────────────────────

async function toggleRule(ruleId, enabled) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  const rule = rules[idx];
  rules[idx] = { ...rule, enabled };
  await chrome.storage.local.set({ rules });
  addLog('toggle', `${enabled ? 'Enabled' : 'Disabled'} "${rule.displayName}"`, rule.domain);
  await pushRulesToTabs();
  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/content-rules/${ruleId}/toggle`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }), signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
  return true;
}

// ── Bypass reporting ──────────────────────────────────────────────────────────

async function reportBypass(attempt) {
  attempt.timestamp = attempt.timestamp || Date.now();
  bypassAttempts.unshift(attempt);
  if (bypassAttempts.length > MAX_ATTEMPTS) bypassAttempts.pop();
  bypassScores[attempt.ruleId] = (bypassScores[attempt.ruleId] || 0) + 1;
  await chrome.storage.local.set({ bypassAttempts, bypassScores });
  addLog('bypass', `Bypass: ${attempt.method}`, attempt.url.slice(0, 60));

  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/extension/bypass`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt), signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
}

// ── Webnavigation hooks ───────────────────────────────────────────────────────

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  if (details.frameId !== 0) return;
  for (const rule of rules.filter(r => r.enabled)) {
    for (const pattern of (rule.urlPatterns || [])) {
      if (matchPattern(details.url, pattern)) {
        reportBypass({ ruleId: rule.id, method: 'url_navigation', url: details.url, timestamp: Date.now() });
        try {
          const origin = new URL(details.url).origin;
          chrome.tabs.update(details.tabId, { url: origin + '/' }).catch(() => {});
        } catch (_) {}
        return;
      }
    }
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  const urlL = details.url.toLowerCase();
  for (const rule of rules.filter(r => r.enabled)) {
    for (const term of (rule.antiBypassSearchTerms || [])) {
      if (urlL.includes(term.toLowerCase().replace(/ /g, '+')) || urlL.includes(encodeURIComponent(term).toLowerCase())) {
        reportBypass({ ruleId: rule.id, method: 'search_query', url: details.url, searchTerm: term, timestamp: Date.now() });
        break;
      }
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) reportBypass({ ruleId: 'incognito', method: 'incognito_window', url: tab.url || '', timestamp: Date.now() });
});

// When a tab finishes loading, push rules into it
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete') return;
  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:')) return;
  const enabled = rules.filter(r => r.enabled);
  if (enabled.length === 0) return;
  chrome.tabs.sendMessage(tabId, { type: 'rules:update', rules: enabled }, () => {
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
        .then(() => chrome.tabs.sendMessage(tabId, { type: 'rules:update', rules: enabled }).catch(() => {}))
        .catch(() => {});
    }
  });
});

// ── Messages ──────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    case 'get:rules':
      sendResponse({ rules: rules.filter(r => r.enabled) });
      return true;

    case 'get:all-rules':
      sendResponse({ rules, connected: daemonConnected, daemonPort });
      return true;

    case 'get:status':
      chrome.storage.local.get(['bypassScores', 'elementStats']).then(d => {
        sendResponse({
          connected: daemonConnected,
          daemonPort,
          lastDaemonError,
          lastSyncAt,
          bootAt,
          rules: rules.length,
          enabledRules: rules.filter(r => r.enabled).length,
          bypassScores: d.bypassScores || bypassScores,
          elementStats: d.elementStats || elementStats,
          activityLog: activityLog.slice(0, 20),
        });
      });
      return true;

    case 'bypass:detected':
      reportBypass({ ...msg, tabId: sender.tab?.id });
      break;

    case 'element:blocked':
      if (sender.tab?.id) tabInjected[sender.tab.id] = true;
      chrome.storage.local.get('elementStats').then(d => {
        const s = d.elementStats || {};
        for (const id of (msg.ruleIds || [])) {
          s[id] = (s[id] || 0) + (msg.count || 1);
          elementStats[id] = s[id];
        }
        chrome.storage.local.set({ elementStats: s });
        const ruleName = rules.find(r => msg.ruleIds?.includes(r.id))?.displayName || msg.ruleIds?.[0] || '?';
        addLog('hidden', `${msg.count} element${msg.count !== 1 ? 's' : ''} hidden`, ruleName);
      });
      break;

    case 'content:ready':
      // Content script signals it loaded and has rules
      if (sender.tab?.id) tabInjected[sender.tab.id] = true;
      addLog('inject', `Content script confirmed`, (sender.tab?.url || '').slice(0, 50));
      break;

    case 'toggle:rule':
      toggleRule(msg.ruleId, msg.enabled).then(ok => sendResponse({ ok }));
      return true;

    case 'force:sync':
      tryDaemonSync().then(() => sendResponse({
        ok: true, connected: daemonConnected, daemonPort, lastDaemonError,
      }));
      return true;

    case 'get:update-info':
      checkForUpdates(msg.force || false).then(info => sendResponse({ info }));
      return true;

    case 'test:inject': {
      // Force-inject content script into active tab and report result
      const tabId = msg.tabId;
      if (!tabId) { sendResponse({ ok: false, error: 'No tabId' }); return true; }
      chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
        .then(() => {
          tabInjected[tabId] = true;
          addLog('inject', 'Manual inject succeeded');
          const enabled = rules.filter(r => r.enabled);
          chrome.tabs.sendMessage(tabId, { type: 'rules:update', rules: enabled }, (res) => {
            sendResponse({ ok: true, rulesDelivered: enabled.length, tabResponse: res || null });
          });
        })
        .catch(e => { addLog('error', `Manual inject failed: ${e.message}`); sendResponse({ ok: false, error: e.message }); });
      return true;
    }
  }
});

// ── Alarms ────────────────────────────────────────────────────────────────────

chrome.alarms.create('daemonSync',  { periodInMinutes: 1 });
chrome.alarms.create('checkUpdate', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daemonSync')  tryDaemonSync().catch(() => {});
  if (alarm.name === 'checkUpdate') checkForUpdates().catch(() => {});
});

// ── Update checker ────────────────────────────────────────────────────────────

const GITHUB_MANIFEST_URL = 'https://raw.githubusercontent.com/lucadominguez/Browser-Daemon/master/extension/manifest.json';
const GITHUB_ZIP_URL      = 'https://github.com/lucadominguez/Browser-Daemon/archive/refs/heads/master.zip';
const GITHUB_RELEASES_URL = 'https://github.com/lucadominguez/Browser-Daemon/releases/latest';
const UPDATE_TTL          = 60 * 60 * 1000;

async function checkForUpdates(force = false) {
  const c = await chrome.storage.local.get(['updateInfo', 'updateCheckedAt']);
  if (!force && c.updateCheckedAt && Date.now() - c.updateCheckedAt < UPDATE_TTL) return c.updateInfo || null;
  try {
    const res = await fetch(GITHUB_MANIFEST_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const remote = await res.json();
    const current = chrome.runtime.getManifest().version;
    const info = { currentVersion: current, latestVersion: remote.version, updateAvailable: isNewer(remote.version, current), downloadUrl: GITHUB_ZIP_URL, releasesUrl: GITHUB_RELEASES_URL };
    await chrome.storage.local.set({ updateInfo: info, updateCheckedAt: Date.now() });
    return info;
  } catch (_) { return null; }
}

function isNewer(r, c) {
  const rv = r.split('.').map(Number), cv = c.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((rv[i]||0) > (cv[i]||0)) return true;
    if ((rv[i]||0) < (cv[i]||0)) return false;
  }
  return false;
}

// ── Utility ───────────────────────────────────────────────────────────────────

function matchPattern(url, pattern) {
  const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

bootstrap();
checkForUpdates().catch(() => {});
