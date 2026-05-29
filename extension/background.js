'use strict';

// ── Predefined rules (bundled) ────────────────────────────────────────────────

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
    antiBypassSearchTerms: ['instagram explore'], antiBypassUrlPatterns: [], enabled: false },
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
    urlPatterns: ['*://*.facebook.com/reels*','*://*.facebook.com/watch*'],
    antiBypassSearchTerms: ['facebook reels'], antiBypassUrlPatterns: ['*/reels*'], enabled: false },
  { id: 'linkedin-feed',     domain: 'linkedin.com',   displayName: 'LinkedIn Feed',            severity: 'low',
    selectors: ['.scaffold-finite-scroll__content','.feed-shared-update-v2'], urlPatterns: [],
    antiBypassSearchTerms: [], antiBypassUrlPatterns: [], enabled: false },
];

// ── State ─────────────────────────────────────────────────────────────────────

let rules = [];
let daemonPort = null;
let daemonConnected = false;
let lastSyncAt = 0;
let lastError = '';
let bypassScores = {};
let bypassAttempts = [];

const MAX_ATTEMPTS = 200;
const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];
const SYNC_STALE_MS = 30_000; // re-sync if last sync was >30s ago

// ── Port discovery — persists to storage so SW restarts don't re-scan ─────────

async function discoverPort() {
  // Try last-known port first (fast path)
  const cached = await chrome.storage.local.get('daemonPort');
  if (cached.daemonPort) {
    if (await pingPort(cached.daemonPort)) {
      daemonPort = cached.daemonPort;
      return daemonPort;
    }
  }
  // Scan all ports
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
    const res = await fetch(`http://127.0.0.1:${port}/ping`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!res.ok) return false;
    const d = await res.json();
    return d.ok === true;
  } catch (_) {
    return false;
  }
}

// ── Rule sync ─────────────────────────────────────────────────────────────────

async function syncRules() {
  if (!daemonPort) await discoverPort();

  if (!daemonPort) {
    daemonConnected = false;
    lastError = 'Daemon not found on ports 9119–9123. Is the app running?';
    await loadRulesFromStorage();
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:${daemonPort}/content-rules`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const fresh = data.rules || [];

    if (JSON.stringify(fresh) !== JSON.stringify(rules)) {
      rules = fresh;
      await chrome.storage.local.set({ rules });
      await pushRulesToTabs();
    }

    daemonConnected = true;
    lastSyncAt = Date.now();
    lastError = '';
    await chrome.storage.local.set({ daemonConnected: true, lastSyncAt });

    // Heartbeat
    fetch(`http://127.0.0.1:${daemonPort}/extension/heartbeat`, {
      method: 'POST',
      signal: AbortSignal.timeout(1000),
    }).catch(() => {});

  } catch (e) {
    daemonConnected = false;
    lastError = `Sync failed: ${e.message || e}`;
    daemonPort = null;
    await chrome.storage.local.set({ daemonConnected: false, daemonPort: null });
    await loadRulesFromStorage();
  }
}

async function loadRulesFromStorage() {
  const d = await chrome.storage.local.get('rules');
  if (d.rules && d.rules.length > 0) {
    rules = d.rules;
  } else {
    rules = PREDEFINED_RULES.map(r => ({ ...r }));
    await chrome.storage.local.set({ rules });
  }
}

async function pushRulesToTabs() {
  const enabled = rules.filter(r => r.enabled);
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id > 0) {
      chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }).catch(() => {});
    }
  }
}

// ── Sync on demand — called when popup opens ──────────────────────────────────

async function syncIfStale() {
  const stale = Date.now() - lastSyncAt > SYNC_STALE_MS;
  if (stale || !daemonConnected) {
    await syncRules();
  }
}

// ── Bypass reporting ──────────────────────────────────────────────────────────

async function reportBypass(attempt) {
  attempt.timestamp = attempt.timestamp || Date.now();
  bypassAttempts.unshift(attempt);
  if (bypassAttempts.length > MAX_ATTEMPTS) bypassAttempts.pop();
  bypassScores[attempt.ruleId] = (bypassScores[attempt.ruleId] || 0) + 1;
  const score = bypassScores[attempt.ruleId];
  await chrome.storage.local.set({ bypassAttempts, bypassScores });

  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/extension/bypass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  }

  const rule = rules.find(r => r.id === attempt.ruleId);
  if (!rule || !rule.enabled) return;

  if (score >= 10)     escalate(rule, score, 'block_1h');
  else if (score >= 6) escalate(rule, score, 'block_5m');
  else if (score >= 3 && daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/extension/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ruleId: rule.id, domain: rule.domain, score }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  }
}

function escalate(rule, score, action) {
  if (!daemonPort) return;
  fetch(`http://127.0.0.1:${daemonPort}/extension/escalate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ruleId: rule.id, domain: rule.domain, score, action }),
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
}

// ── Rule toggle ───────────────────────────────────────────────────────────────

async function toggleRule(ruleId, enabled) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  rules[idx] = { ...rules[idx], enabled };
  await chrome.storage.local.set({ rules });
  await pushRulesToTabs();
  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/content-rules/${ruleId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => {});
  }
  return true;
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

// ── Search query bypass detection ─────────────────────────────────────────────

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

// ── Incognito detection ────────────────────────────────────────────────────────

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) {
    reportBypass({ ruleId: 'incognito', method: 'incognito_window', url: tab.url || '', timestamp: Date.now() });
  }
});

// ── Messages ──────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {

    case 'get:rules':
      sendResponse({ rules: rules.filter(r => r.enabled) });
      return true;

    case 'get:all-rules':
      // Restore in-memory state from storage if SW was restarted
      chrome.storage.local.get(['rules', 'daemonPort', 'daemonConnected', 'lastSyncAt']).then(d => {
        if (d.rules) rules = d.rules;
        if (d.daemonPort) daemonPort = d.daemonPort;
        if (d.daemonConnected !== undefined) daemonConnected = d.daemonConnected;
        if (d.lastSyncAt) lastSyncAt = d.lastSyncAt;
        sendResponse({ rules, connected: daemonConnected, daemonPort, lastError });
      });
      return true;

    case 'get:status':
      // Trigger a sync if stale, then return status
      syncIfStale().then(() => {
        chrome.storage.local.get(['bypassAttempts', 'bypassScores', 'elementStats']).then(d => {
          sendResponse({
            connected: daemonConnected,
            daemonPort,
            lastError,
            lastSyncAt,
            rules: rules.length,
            enabledRules: rules.filter(r => r.enabled).length,
            bypassScores: d.bypassScores || {},
            elementStats: d.elementStats || {},
            recentAttempts: (d.bypassAttempts || []).slice(0, 10),
          });
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
      daemonPort = null;
      lastSyncAt = 0;
      syncRules().then(() => sendResponse({ ok: true, connected: daemonConnected, daemonPort, lastError }));
      return true;
  }
});

// ── Periodic sync via alarms (keeps SW alive, handles reconnect) ──────────────

chrome.alarms.create('syncRules', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncRules') syncRules().catch(() => {});
});

// ── Utility ───────────────────────────────────────────────────────────────────

function matchPattern(url, pattern) {
  const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
}

// ── Boot — restore state from storage then attempt sync ───────────────────────

chrome.storage.local.get(['rules', 'daemonPort', 'bypassScores', 'bypassAttempts']).then(d => {
  if (d.rules)          rules         = d.rules;
  if (d.daemonPort)     daemonPort    = d.daemonPort;
  if (d.bypassScores)   bypassScores  = d.bypassScores;
  if (d.bypassAttempts) bypassAttempts = d.bypassAttempts;
  syncRules().catch(() => loadRulesFromStorage());
});
