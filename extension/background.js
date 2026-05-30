'use strict';

// ── Predefined rules ──────────────────────────────────────────────────────────

const PREDEFINED_RULES = [
  { id: 'youtube-shorts',    domain: 'youtube.com',    displayName: 'YouTube Shorts',          severity: 'high',
    selectors: ['ytd-shorts','#shorts-container','[is-shorts]','ytd-reel-shelf-renderer','[title="Shorts"]'],
    urlPatterns: ['*://*.youtube.com/shorts/*','*://*.youtube.com/hashtag/shorts*'],
    antiBypassSearchTerms: ['youtube shorts','yt shorts','shorts video'], antiBypassUrlPatterns: ['*/shorts/*'], enabled: false },
  { id: 'youtube-home',      domain: 'youtube.com',    displayName: 'YouTube Home Feed',        severity: 'medium',
    selectors: ['ytd-browse[page-subtype="home"] #contents'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'youtube-sidebar',   domain: 'youtube.com',    displayName: 'YouTube Recommended',      severity: 'medium',
    selectors: ['#related','ytd-watch-next-secondary-results-renderer'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'instagram-reels',   domain: 'instagram.com',  displayName: 'Instagram Reels',          severity: 'high',
    selectors: ['[href="/reels/"]','a[href*="/reel/"]','div[role="tablist"] a[href="/reels/"]'],
    urlPatterns: ['*://*.instagram.com/reels/*','*://*.instagram.com/reel/*'],
    antiBypassSearchTerms: ['instagram reels','ig reels'], antiBypassUrlPatterns: ['*/reels/*','*/reel/*'], enabled: false },
  { id: 'instagram-explore', domain: 'instagram.com',  displayName: 'Instagram Explore',        severity: 'medium',
    selectors: ['[href="/explore/"]','a[aria-label="Explore"]'], urlPatterns: ['*://*.instagram.com/explore/*'],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
  { id: 'tiktok-fyp',        domain: 'tiktok.com',     displayName: 'TikTok For You Page',      severity: 'high',
    selectors: ['[data-e2e="recommend-list"]','.tiktok-1g04lal-DivFeedContainer'],
    urlPatterns: ['*://*.tiktok.com/foryou*','*://*.tiktok.com/'],
    antiBypassSearchTerms: ['tiktok fyp','tiktok for you'], antiBypassUrlPatterns: [], enabled: false },
  { id: 'twitter-foryou',    domain: 'x.com',          displayName: 'X/Twitter "For You" Feed', severity: 'medium',
    selectors: ['[aria-label="Timeline: Trending now"]'],
    urlPatterns: ['*://x.com/explore*','*://twitter.com/explore*'],
    antiBypassSearchTerms: ['twitter trending','x trending'], antiBypassUrlPatterns: [], enabled: false },
  { id: 'reddit-all',        domain: 'reddit.com',     displayName: 'Reddit r/all & r/popular', severity: 'medium',
    selectors: ['a[href="/r/all/"]','a[href="/r/popular/"]'],
    urlPatterns: ['*://*.reddit.com/r/all/*','*://*.reddit.com/r/popular/*'],
    antiBypassSearchTerms: ['reddit front page','r/all'], antiBypassUrlPatterns: ['*/r/all/*','*/r/popular/*'], enabled: false },
  { id: 'facebook-reels',    domain: 'facebook.com',   displayName: 'Facebook Reels',           severity: 'high',
    selectors: ['[aria-label*="Reels"]','[href*="/reel/"]'],
    urlPatterns: ['*://*.facebook.com/reels*'],
    antiBypassSearchTerms: ['facebook reels'], antiBypassUrlPatterns: ['*/reels*'], enabled: false },
  { id: 'linkedin-feed',     domain: 'linkedin.com',   displayName: 'LinkedIn Feed',            severity: 'low',
    selectors: ['.scaffold-finite-scroll__content','.feed-shared-update-v2'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
];

// ── State — loaded from storage on boot, works without daemon ─────────────────

let rules          = [];
let bypassScores   = {};
let bypassAttempts = [];

// Daemon connection — purely optional, background-only
let daemonPort      = null;
let daemonConnected = false;
let lastSyncAt      = 0;
let lastDaemonError = '';

const MAX_ATTEMPTS = 200;
const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];

// ── Storage bootstrap — always loads locally first ────────────────────────────

async function bootstrap() {
  const d = await chrome.storage.local.get(['rules', 'daemonPort', 'bypassScores', 'bypassAttempts']);

  if (d.rules && d.rules.length > 0) {
    rules = d.rules;
  } else {
    // First install — seed with predefined rules, all disabled by default
    rules = PREDEFINED_RULES.map(r => ({ ...r }));
    await chrome.storage.local.set({ rules });
  }

  if (d.bypassScores)   bypassScores   = d.bypassScores;
  if (d.bypassAttempts) bypassAttempts = d.bypassAttempts;
  if (d.daemonPort)     daemonPort     = d.daemonPort;

  // Push rules to any tabs already open
  await pushRulesToTabs();

  // Try daemon in background — never blocks startup
  tryDaemonSync();
}

// ── Daemon sync — background only, never blocks popup responses ───────────────

async function tryDaemonSync() {
  const port = await discoverPort();
  if (!port) { daemonConnected = false; lastDaemonError = 'Daemon not found'; return; }

  try {
    const res = await fetch(`http://127.0.0.1:${port}/content-rules`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const fresh = data.rules || [];

    // Daemon rules replace local rules only if daemon has any configured
    if (fresh.length > 0 && JSON.stringify(fresh) !== JSON.stringify(rules)) {
      rules = fresh;
      await chrome.storage.local.set({ rules });
      await pushRulesToTabs();
    }

    daemonConnected = true;
    lastSyncAt = Date.now();
    lastDaemonError = '';
    await chrome.storage.local.set({ daemonConnected: true, lastSyncAt, daemonPort: port });

    fetch(`http://127.0.0.1:${port}/extension/heartbeat`, { method: 'POST', signal: AbortSignal.timeout(1000) }).catch(() => {});
  } catch (e) {
    daemonConnected = false;
    lastDaemonError = e.message || String(e);
    await chrome.storage.local.set({ daemonConnected: false });
  }
}

async function discoverPort() {
  // Try cached port first
  if (daemonPort && await pingPort(daemonPort)) return daemonPort;

  for (const p of DAEMON_PORTS) {
    if (await pingPort(p)) {
      daemonPort = p;
      await chrome.storage.local.set({ daemonPort: p });
      return p;
    }
  }
  daemonPort = null;
  await chrome.storage.local.remove('daemonPort');
  return null;
}

async function pingPort(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/ping`, { signal: AbortSignal.timeout(700) });
    if (!res.ok) return false;
    return (await res.json()).ok === true;
  } catch (_) { return false; }
}

// ── Tab push — re-injects content script if needed ───────────────────────────

async function pushRulesToTabs() {
  const enabled = rules.filter(r => r.enabled);
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id || tab.id <= 0) continue;
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://')) continue;

    chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }, () => {
      if (chrome.runtime.lastError) {
        // Content script not running — inject it
        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })
          .then(() => chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }).catch(() => {}))
          .catch(() => {});
      }
    });
  }
}

// ── Rule toggle ───────────────────────────────────────────────────────────────

async function toggleRule(ruleId, enabled) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  rules[idx] = { ...rules[idx], enabled };
  await chrome.storage.local.set({ rules });
  await pushRulesToTabs();

  // Optionally sync to daemon
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

  // Send to daemon if connected
  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/extension/bypass`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt), signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }

  const score = bypassScores[attempt.ruleId];
  const rule = rules.find(r => r.id === attempt.ruleId);
  if (!rule?.enabled || !daemonPort) return;

  if (score >= 10) escalate(rule, score, 'block_1h');
  else if (score >= 6) escalate(rule, score, 'block_5m');
  else if (score >= 3) {
    fetch(`http://127.0.0.1:${daemonPort}/extension/check-in`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruleId: rule.id, domain: rule.domain, score }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
}

function escalate(rule, score, action) {
  fetch(`http://127.0.0.1:${daemonPort}/extension/escalate`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ruleId: rule.id, domain: rule.domain, score, action }),
    signal: AbortSignal.timeout(2000),
  }).catch(() => {});
}

// ── URL interception ──────────────────────────────────────────────────────────

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
      if (urlL.includes(term.toLowerCase().replace(/ /g, '+')) ||
          urlL.includes(encodeURIComponent(term).toLowerCase())) {
        reportBypass({ ruleId: rule.id, method: 'search_query', url: details.url, searchTerm: term, timestamp: Date.now() });
        break;
      }
    }
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) reportBypass({ ruleId: 'incognito', method: 'incognito_window', url: tab.url || '', timestamp: Date.now() });
});

// ── Messages ──────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    case 'get:rules':
      sendResponse({ rules: rules.filter(r => r.enabled) });
      return true;

    case 'get:all-rules':
      // Respond immediately from memory — no async wait
      sendResponse({ rules, connected: daemonConnected, daemonPort });
      return true;

    case 'get:status':
      // Respond immediately with current state — sync happens in background
      chrome.storage.local.get(['bypassScores', 'elementStats']).then(d => {
        sendResponse({
          connected: daemonConnected,
          daemonPort,
          lastDaemonError,
          lastSyncAt,
          rules: rules.length,
          enabledRules: rules.filter(r => r.enabled).length,
          bypassScores: d.bypassScores || {},
          elementStats: d.elementStats || {},
        });
      });
      return true;

    case 'bypass:detected':
      reportBypass({ ...msg, tabId: sender.tab?.id });
      break;

    case 'element:blocked':
      chrome.storage.local.get('elementStats').then(d => {
        const s = d.elementStats || {};
        for (const id of (msg.ruleIds || [])) s[id] = (s[id] || 0) + (msg.count || 1);
        chrome.storage.local.set({ elementStats: s });
      });
      break;

    case 'toggle:rule':
      toggleRule(msg.ruleId, msg.enabled).then(ok => sendResponse({ ok }));
      return true;

    case 'force:sync':
      tryDaemonSync().then(() => sendResponse({ ok: true, connected: daemonConnected, daemonPort, lastDaemonError }));
      return true;

    case 'get:update-info':
      checkForUpdates(msg.force || false).then(info => sendResponse({ info }));
      return true;
  }
});

// ── Periodic daemon sync (background only) ────────────────────────────────────

chrome.alarms.create('daemonSync',   { periodInMinutes: 1 });
chrome.alarms.create('checkUpdate',  { periodInMinutes: 60 });

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
  const cached = await chrome.storage.local.get(['updateInfo', 'updateCheckedAt']);
  if (!force && cached.updateCheckedAt && Date.now() - cached.updateCheckedAt < UPDATE_TTL) return cached.updateInfo || null;
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

function isNewer(remote, current) {
  const r = remote.split('.').map(Number), c = current.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i]||0) > (c[i]||0)) return true;
    if ((r[i]||0) < (c[i]||0)) return false;
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
