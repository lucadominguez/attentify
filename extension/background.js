'use strict';

// Load the bundled provider key from a gitignored config file (config.js) so the
// live key is never committed to this public repo. importScripts runs synchronously
// in the service-worker global scope, exposing self.ATTENTIFY_BUNDLED_OPENROUTER_KEY.
// If config.js is absent (fresh clone), the AI simply requires the user's own key.
try { importScripts('config.js'); } catch (_) { /* no bundled key — own key required */ }

// ── Predefined rules — high-severity ENABLED by default ───────────────────────
//
// Selector strategy (most → least stable):
//   1. URL intercept via urlPatterns (webNavigation) — always works
//   2. Custom element names (ytd-*, yt-*) — YouTube's own, very stable
//   3. Semantic attributes: [href="/path"], [aria-label="..."] — stable
//   4. data-e2e / data-testid — moderately stable
//   Avoid random class names — they change every deploy

const PREDEFINED_RULES = [
  {
    id: 'youtube-shorts',
    domain: 'youtube.com',
    displayName: 'YouTube Shorts',
    severity: 'high',
    enabled: true,   // ← ON by default
    selectors: [
      // Shorts player page itself
      'ytd-shorts',
      // Home Shorts shelf — modern (is-shorts) + legacy (reel) shelf elements
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      // Deploy-proof: any home shelf/section whose tiles link to /shorts/<id>.
      // YouTube renames its custom elements often, but Shorts thumbnails always
      // point at /shorts/ — :has() catches the shelf no matter what it's called.
      'ytd-rich-section-renderer:has(a[href^="/shorts/"])',
      'ytd-rich-shelf-renderer:has(a[href^="/shorts/"])',
      'grid-shelf-view-model:has(a[href^="/shorts/"])',
      // Individual Shorts tiles that leak into the normal video grid
      'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
      'ytd-video-renderer:has(a[href^="/shorts/"])',
      // Left nav "Shorts" item (desktop)
      'ytd-guide-entry-renderer:has(a[href="/shorts"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
      // Chip/tab "Shorts" filters in search/home
      'yt-chip-cloud-chip-renderer:has([title="Shorts"])',
      // Any anchor pointing to /shorts (nav, links)
      'a.yt-simple-endpoint[href="/shorts"]',
      'a[title="Shorts"]',
    ],
    urlPatterns: ['*://*.youtube.com/shorts/*', '*://*.youtube.com/hashtag/shorts*'],
    antiBypassSearchTerms: ['youtube shorts', 'yt shorts'],
    antiBypassUrlPatterns: ['*/shorts/*'],
  },
  {
    id: 'youtube-sidebar',
    domain: 'youtube.com',
    displayName: 'YouTube Recommended Sidebar',
    severity: 'medium',
    enabled: false,
    selectors: [
      '#related',
      'ytd-watch-next-secondary-results-renderer',
    ],
    urlPatterns: [],
    antiBypassSearchTerms: [],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'youtube-home',
    domain: 'youtube.com',
    displayName: 'YouTube Home Feed',
    severity: 'medium',
    enabled: false,
    selectors: [
      'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
    ],
    urlPatterns: [],
    antiBypassSearchTerms: [],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'instagram-reels',
    domain: 'instagram.com',
    displayName: 'Instagram Reels',
    severity: 'high',
    enabled: true,
    selectors: [
      // Nav bar Reels icon/link
      'a[href="/reels/"]',
      // Reels tab in profile
      'a[href*="/reels"] [data-testid]',
    ],
    urlPatterns: [
      '*://*.instagram.com/reels/*',
      '*://*.instagram.com/reel/*',
    ],
    antiBypassSearchTerms: ['instagram reels', 'ig reels'],
    antiBypassUrlPatterns: ['*/reels/*', '*/reel/*'],
  },
  {
    id: 'instagram-explore',
    domain: 'instagram.com',
    displayName: 'Instagram Explore',
    severity: 'medium',
    enabled: false,
    selectors: ['a[href="/explore/"]'],
    urlPatterns: ['*://*.instagram.com/explore/*'],
    antiBypassSearchTerms: [],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'tiktok-fyp',
    domain: 'tiktok.com',
    displayName: 'TikTok For You Page',
    severity: 'high',
    enabled: true,
    selectors: [
      // FYP tab
      '[data-e2e="recommend-list-item-container"]',
      // Desktop feed wrapper
      '[class*="DivFeedContainer"]',
      // For You tab button
      '[data-e2e="for-you-tab"]',
    ],
    urlPatterns: [
      '*://*.tiktok.com/foryou*',
    ],
    antiBypassSearchTerms: ['tiktok fyp', 'tiktok for you'],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'twitter-foryou',
    domain: 'x.com',
    displayName: 'X/Twitter "For You" Feed',
    severity: 'medium',
    enabled: true,   // ← ON by default
    selectors: [
      // Trending sidebar
      '[aria-label="Timeline: Trending now"]',
      // Explore / trending link in nav
      'a[href="/explore"]',
    ],
    urlPatterns: ['*://x.com/explore*', '*://twitter.com/explore*'],
    antiBypassSearchTerms: ['twitter trending'],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'reddit-all',
    domain: 'reddit.com',
    displayName: 'Reddit r/all & r/popular',
    severity: 'medium',
    enabled: true,   // ← ON by default
    selectors: [
      'a[href="/r/all/"]',
      'a[href="/r/popular/"]',
      'a[href^="/r/all"]',
    ],
    urlPatterns: [
      '*://*.reddit.com/r/all/*',
      '*://*.reddit.com/r/popular/*',
    ],
    antiBypassSearchTerms: ['r/all', 'reddit popular'],
    antiBypassUrlPatterns: ['*/r/all/*', '*/r/popular/*'],
  },
  {
    id: 'facebook-reels',
    domain: 'facebook.com',
    displayName: 'Facebook Reels',
    severity: 'high',
    enabled: true,
    selectors: [
      '[aria-label="Reels"]',
      '[href*="/reel/"]',
      'a[aria-label="Reels"]',
    ],
    urlPatterns: ['*://*.facebook.com/reels*', '*://*.facebook.com/reel/*'],
    antiBypassSearchTerms: ['facebook reels'],
    antiBypassUrlPatterns: ['*/reels*'],
  },
  {
    id: 'linkedin-feed',
    domain: 'linkedin.com',
    displayName: 'LinkedIn Feed',
    severity: 'low',
    enabled: false,
    selectors: [
      '.scaffold-finite-scroll__content',
      '.feed-shared-update-v2',
    ],
    urlPatterns: [],
    antiBypassSearchTerms: [],
    antiBypassUrlPatterns: [],
  },
];

// ── Activity log ──────────────────────────────────────────────────────────────

const activityLog = [];
function addLog(type, msg, detail = '') {
  activityLog.unshift({ ts: Date.now(), type, msg, detail });
  if (activityLog.length > 40) activityLog.pop();
}

// ── State ─────────────────────────────────────────────────────────────────────

const RULES_VERSION = 4; // bump when predefined rules change significantly (4: Reddit + Twitter/X feeds ON by default)

let rules = [], bypassScores = {}, bypassAttempts = [], elementStats = {};
let pausedSites = {};   // { 'youtube.com': true } — domains the user paused blocking on
let autoBlock = true;   // auto-hide high-confidence detected distractions (the scanner)
let autoHideKeywords = []; // topics the user told the assistant to hide — feeds the scanner
let titleBlocks = [];   // lowercase title substrings — videos whose TITLE matches are blocked
let autoHideSuppress = {}; // { domain: [{selector,label,ts}] } — elements the user flagged "not a distraction"; the scanner must never auto-hide these again (client-side retraining)
let visitStats = {};    // { 'YYYY-MM-DD': { domain: { visits, distractionSum, ms } } } — the extension's OWN analytics DB, so Insights/Timesheets work standalone (no daemon needed, Mac included)
let focusUntil = 0;     // epoch ms until which a focus session is active (aggressive auto-hide)
let lastAssessment = null; // most recent per-navigation context read (shown in the panel)
let contextLog = [];    // chronological history of context reads — powers the flow view
let cloudStatus = null; // { tier, status, aiRemaining, ... } from the cloud backend, or null
let cloudEvents = [];   // analytics queued for the cloud (flushed on alarm, cloud tier only)
// Cloud backend base URL. Override per-deployment via storage key `cloudApiBase`.
const CLOUD_API_DEFAULT = 'https://attentify-cloud.ludomi2502.workers.dev';
let cloudApi = CLOUD_API_DEFAULT;

// ── Bundled AI + free-usage metering ──────────────────────────────────────────
// The extension ships with an OpenRouter key so the AI assistant + context engine
// work out of the box. Spend against it is metered in estimated USD; each install
// gets FREE_USAGE_LIMIT_USD of free AI. Past that — with no own key and no Cloud
// subscription — AI is gated and the popup prompts the user to subscribe ($5/mo).
const BUNDLED_OPENROUTER_KEY = (typeof self !== 'undefined' && self.ATTENTIFY_BUNDLED_OPENROUTER_KEY) || '';
const FREE_USAGE_LIMIT_USD = 1.0;
// model → [input, output] USD per 1M tokens
const MODEL_PRICING = { 'anthropic/claude-haiku-4.5': [1, 5], 'anthropic/claude-haiku-4-5': [1, 5] };
const DEFAULT_PRICING = [1, 5];
let aiUsageUsd = 0;   // estimated USD spent against the bundled key
function estimateCostUsd(model, inTok, outTok) {
  const [ip, op] = MODEL_PRICING[model] || DEFAULT_PRICING;
  return (inTok / 1e6) * ip + (outTok / 1e6) * op;
}
let feedbackLog = [];   // mispredictions + bug reports queued for the future backend
const contextCache = new Map();   // normUrl -> { at, val } — short-lived dedupe of LLM calls
const CONTEXT_TTL = 5 * 60 * 1000;
let daemonPort = null, daemonConnected = false, lastSyncAt = 0, lastDaemonError = '';
let bootAt = Date.now();
const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {
  addLog('boot', 'Extension started');
  const d = await chrome.storage.local.get(['rules', 'rulesVersion', 'daemonPort', 'bypassScores', 'bypassAttempts', 'elementStats', 'pausedSites', 'autoBlock', 'autoHideKeywords', 'titleBlocks', 'autoHideSuppress', 'visitStats', 'focusUntil', 'feedbackLog', 'lastAssessment', 'contextLog']);

  if (d.rules && d.rules.length > 0) {
    rules = d.rules;

    // Migration: if rules are from an older version, update selectors and
    // enable high-severity predefined rules that are still at the old default (off)
    if ((d.rulesVersion || 0) < RULES_VERSION) {
      const predefinedById = Object.fromEntries(PREDEFINED_RULES.map(r => [r.id, r]));
      rules = rules.map(r => {
        const fresh = predefinedById[r.id];
        if (!fresh) return r;
        return {
          ...r,
          selectors:              fresh.selectors,            // always update selectors
          urlPatterns:            fresh.urlPatterns,
          antiBypassSearchTerms:  fresh.antiBypassSearchTerms,
          // Enable if predefined says it should be ON and user hasn't explicitly enabled it
          enabled: r.enabled || fresh.enabled,
        };
      });
      await chrome.storage.local.set({ rules, rulesVersion: RULES_VERSION });
      const nowOn = rules.filter(r => r.enabled).length;
      addLog('storage', `Migrated to rules v${RULES_VERSION}`, `${nowOn} rules now enabled`);
    } else {
      addLog('storage', `Loaded ${rules.length} rules`, `${rules.filter(r=>r.enabled).length} enabled`);
    }
  } else {
    rules = PREDEFINED_RULES.map(r => ({ ...r }));
    await chrome.storage.local.set({ rules, rulesVersion: RULES_VERSION });
    const enabledCount = rules.filter(r => r.enabled).length;
    addLog('storage', `First run: ${rules.length} rules installed`, `${enabledCount} enabled by default (YouTube Shorts, Instagram Reels, TikTok FYP, Facebook Reels, Reddit, Twitter/X)`);
  }

  if (d.bypassScores)   bypassScores   = d.bypassScores;
  if (d.bypassAttempts) bypassAttempts = d.bypassAttempts;
  if (d.elementStats)   elementStats   = d.elementStats;
  if (d.daemonPort)     daemonPort     = d.daemonPort;
  if (d.pausedSites)    pausedSites    = d.pausedSites;
  if (typeof d.autoBlock === 'boolean') autoBlock = d.autoBlock;
  if (Array.isArray(d.autoHideKeywords)) autoHideKeywords = d.autoHideKeywords;
  if (Array.isArray(d.titleBlocks)) titleBlocks = d.titleBlocks;
  if (d.autoHideSuppress && typeof d.autoHideSuppress === 'object') autoHideSuppress = d.autoHideSuppress;
  if (d.visitStats && typeof d.visitStats === 'object') visitStats = d.visitStats;
  if (typeof d.focusUntil === 'number') focusUntil = d.focusUntil;
  if (Array.isArray(d.feedbackLog)) feedbackLog = d.feedbackLog;
  if (Array.isArray(d.contextLog)) contextLog = d.contextLog;
  if (d.lastAssessment) lastAssessment = d.lastAssessment;

  const cfg = await chrome.storage.local.get(['cloudApiBase', 'cloudStatus', 'aiUsageUsd']);
  if (cfg.cloudApiBase) cloudApi = cfg.cloudApiBase;
  if (cfg.cloudStatus) cloudStatus = cfg.cloudStatus;
  if (typeof cfg.aiUsageUsd === 'number') aiUsageUsd = cfg.aiUsageUsd;
  refreshCloudStatus().catch(() => {});   // validate the license + pull tier/quota

  const pushed = await pushRulesToTabs();
  addLog('tabs', `Rules pushed to ${pushed} tab(s)`);
  tryDaemonSync();
}

// ── Readiness gate ──────────────────────────────────────────────────────────────
// In MV3 the service worker is torn down when idle and revived by events. On revival
// the whole script re-runs but `rules` starts empty until bootstrap() finishes reading
// storage. Event handlers must await this gate so they never act on an empty rule set
// (which is what used to leave a freshly-focused tab unblocked until a manual reload).
let readyPromise = null;
function ensureReady() {
  if (!readyPromise) readyPromise = bootstrap().catch(e => { addLog('error', 'Bootstrap failed', e.message); });
  return readyPromise;
}

// ── Push rules to tabs — injects content script if missing ───────────────────

async function pushRulesToTabs() {
  const tabs = await chrome.tabs.query({});
  let count = 0;
  for (const tab of tabs) {
    if (!tab.id || SKIP_URL(tab.url)) continue;
    count++;
    pushRulesToTab(tab.id, tab.url);   // per-tab, honours per-site pause
  }
  return count;
}

// Re-assert blocking on a single tab: message the content script with the current
// rules, and inject the script first if it isn't there yet. CSS injection is
// idempotent (the content script dedupes), so calling this on every tab/window
// switch is cheap and never flickers.
const SKIP_URL = url => !url || url.startsWith('chrome://') || url.startsWith('chrome-extension://')
  || url.startsWith('about:') || url.startsWith('edge://') || url.startsWith('view-source:');

function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (_) { return null; } }

// Rules that should apply to a given tab's domain: none if the user paused that site,
// otherwise all enabled rules (the content script does the final domain match).
function rulesForTab(domain) {
  if (domain && pausedSites[domain]) return [];
  return rules.filter(r => r.enabled);
}

function pushRulesToTab(tabId, url) {
  if (SKIP_URL(url)) return;
  const forTab = rulesForTab(domainOf(url));
  // Always tell an existing content script the current set (an empty set clears the
  // CSS when a site is paused). Only spin up a fresh content script when there's
  // something to deliver — no point injecting just to send "nothing".
  const payload = { type: 'rules:update', rules: forTab, autoBlock, userKeywords: autoHideKeywords, titleBlocks };
  chrome.tabs.sendMessage(tabId, payload, () => {
    if (chrome.runtime.lastError && forTab.length) {
      chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
        .then(() => chrome.tabs.sendMessage(tabId, payload).catch(() => {}))
        .catch(() => {});
    }
  });
}

// Toggle the auto-distraction-blocker, persist it, and tell every open tab so the
// content-script scanner starts/stops auto-hiding immediately.
async function setAutoBlock(enabled) {
  autoBlock = enabled;
  await chrome.storage.local.set({ autoBlock });
  addLog('toggle', `Auto-block distractions ${enabled ? 'ON' : 'OFF'}`);
  broadcastSettings();
}

// Merge (or replace) the topic keywords the user wants auto-hidden, learned from chat.
async function mergeAutoHideKeywords(keywords, replace = false) {
  const incoming = (Array.isArray(keywords) ? keywords : [])
    .map(k => String(k || '').trim().toLowerCase()).filter(Boolean);
  const set = new Set(replace ? [] : autoHideKeywords);
  for (const k of incoming) set.add(k);
  autoHideKeywords = [...set].slice(0, 40);
  await chrome.storage.local.set({ autoHideKeywords });
  if (incoming.length) addLog('toggle', `Learned auto-hide topics`, incoming.join(', '));
  broadcastSettings();
}

// Merge (or replace) the title substrings used to block videos by name. Matched
// against YouTube feed-tile titles and the watch-page title.
async function mergeTitleBlocks(keywords, replace = false) {
  const incoming = (Array.isArray(keywords) ? keywords : [])
    .map(k => String(k || '').trim().toLowerCase()).filter(k => k.length >= 2);
  const set = new Set(replace ? [] : titleBlocks);
  for (const k of incoming) set.add(k);
  titleBlocks = [...set].slice(0, 80);
  await chrome.storage.local.set({ titleBlocks });
  if (incoming.length || replace) addLog('toggle', `Updated blocked video titles`, titleBlocks.join(', ').slice(0, 80));
  broadcastSettings();
}

function broadcastSettings() {
  chrome.tabs.query({}).then(tabs => {
    for (const t of tabs) {
      if (t.id && !SKIP_URL(t.url))
        chrome.tabs.sendMessage(t.id, { type: 'settings:update', autoBlock, userKeywords: autoHideKeywords, titleBlocks }, () => void chrome.runtime.lastError);
    }
  });
}

// Pause/resume blocking on a whole domain, then re-assert on every open tab there.
async function setSitePause(domain, paused) {
  if (!domain) return;
  if (paused) pausedSites[domain] = true; else delete pausedSites[domain];
  await chrome.storage.local.set({ pausedSites });
  addLog('toggle', `${paused ? 'Paused' : 'Resumed'} blocking on ${domain}`);
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) {
    if (t.id && domainOf(t.url) === domain) pushRulesToTab(t.id, t.url);
  }
}

// Re-inject when a tab finishes loading…
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete' || !tab.url) return;
  ensureReady().then(() => pushRulesToTab(tabId, tab.url));
});

// …when the user switches to another tab (the page may have loaded while the
// service worker was asleep, or before the extension was installed)…
chrome.tabs.onActivated.addListener(({ tabId }) => {
  ensureReady().then(() => chrome.tabs.get(tabId, tab => {
    if (chrome.runtime.lastError || !tab) return;
    pushRulesToTab(tabId, tab.url);
  }));
});

// …and when the user switches to another window.
chrome.windows.onFocusChanged.addListener(winId => {
  if (winId === chrome.windows.WINDOW_ID_NONE) return;
  ensureReady().then(() => chrome.tabs.query({ active: true, windowId: winId }, tabs => {
    const tab = tabs[0];
    if (tab && tab.id) pushRulesToTab(tab.id, tab.url);
  }));
});

// ── Daemon sync ───────────────────────────────────────────────────────────────

async function tryDaemonSync() {
  const port = await discoverPort();
  if (!port) {
    daemonConnected = false;
    lastDaemonError = `Not found on ports ${DAEMON_PORTS.join(', ')}`;
    addLog('daemon', 'Running standalone. Attentify app not found');
    await chrome.storage.local.set({ daemonConnected: false });
    return;
  }
  try {
    const res = await fetch(`http://127.0.0.1:${port}/content-rules`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const fresh = data.rules || [];
    if (fresh.length > 0 && JSON.stringify(fresh) !== JSON.stringify(rules)) {
      rules = fresh;
      await chrome.storage.local.set({ rules });
      await pushRulesToTabs();
      addLog('daemon', `Synced ${fresh.length} rules from the Attentify app`, `${fresh.filter(r=>r.enabled).length} enabled`);
    } else {
      addLog('daemon', `Connected to the Attentify app on :${port}`);
    }
    daemonPort = port; daemonConnected = true; lastSyncAt = Date.now(); lastDaemonError = '';
    await chrome.storage.local.set({ daemonConnected: true, lastSyncAt, daemonPort: port });
    fetch(`http://127.0.0.1:${port}/extension/heartbeat`, { method: 'POST', signal: AbortSignal.timeout(1000) }).catch(() => {});
  } catch (e) {
    daemonConnected = false; lastDaemonError = e.message;
    addLog('error', `Daemon sync failed`, e.message);
    await chrome.storage.local.set({ daemonConnected: false });
  }
}

async function discoverPort() {
  if (daemonPort && await pingPort(daemonPort)) return daemonPort;
  for (const p of DAEMON_PORTS) { if (await pingPort(p)) return p; }
  return null;
}

async function pingPort(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/ping`, { signal: AbortSignal.timeout(700) });
    return res.ok && (await res.json()).ok === true;
  } catch (_) { return false; }
}

// ── Toggle rule ───────────────────────────────────────────────────────────────

async function toggleRule(ruleId, enabled) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  rules[idx] = { ...rules[idx], enabled };
  await chrome.storage.local.set({ rules });
  addLog('toggle', `${enabled ? 'Enabled' : 'Disabled'} "${rules[idx].displayName}"`, rules[idx].domain);
  await pushRulesToTabs();
  if (daemonPort) fetch(`http://127.0.0.1:${daemonPort}/content-rules/${ruleId}/toggle`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }), signal: AbortSignal.timeout(2000),
  }).catch(() => {});
  return true;
}

// ── Create rule ───────────────────────────────────────────────────────────────

async function createRule(rule) {
  const existing = rules.findIndex(r => r.id === rule.id);
  if (existing !== -1) { rules[existing] = { ...rules[existing], ...rule }; }
  else { rules.push({ ...rule, enabled: true }); }
  await chrome.storage.local.set({ rules });
  addLog('toggle', `Created rule "${rule.displayName}"`, rule.domain);
  await pushRulesToTabs();
  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/content-rules`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule), signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
  return true;
}

async function deleteRule(ruleId) {
  const idx = rules.findIndex(r => r.id === ruleId);
  if (idx === -1) return false;
  const deleted = rules.splice(idx, 1)[0];
  await chrome.storage.local.set({ rules });
  addLog('toggle', `Deleted rule "${deleted.displayName}"`, deleted.domain);
  await pushRulesToTabs();
  if (daemonPort) {
    fetch(`http://127.0.0.1:${daemonPort}/content-rules/${ruleId}`, {
      method: 'DELETE', signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
  return true;
}

// ── Bypass reporting ──────────────────────────────────────────────────────────

async function reportBypass(attempt) {
  attempt.timestamp = attempt.timestamp || Date.now();
  bypassAttempts.unshift(attempt);
  if (bypassAttempts.length > 200) bypassAttempts.pop();
  bypassScores[attempt.ruleId] = (bypassScores[attempt.ruleId] || 0) + 1;
  await chrome.storage.local.set({ bypassAttempts, bypassScores });
  addLog('bypass', `Bypass: ${attempt.method}`, attempt.url.slice(0, 60));
  if (daemonPort) fetch(`http://127.0.0.1:${daemonPort}/extension/bypass`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(attempt), signal: AbortSignal.timeout(2000),
  }).catch(() => {});
}

// ── Authoritative activity sensor ─────────────────────────────────────────────
// The desktop app scrapes the browser address bar via PowerShell when the extension is
// absent, which is flaky. When we ARE installed we send the real navigation here, and the
// app treats it as the authoritative sensor (and stands the poller down). Only real http(s)
// top-level pages; never file:// or chrome:// or internal URLs.
let lastActivityUrl = '';
function reportActivity(url, title) {
  if (!daemonPort || !url || !/^https?:\/\//i.test(url)) return;
  if (url === lastActivityUrl) return;
  lastActivityUrl = url;
  fetch(`http://127.0.0.1:${daemonPort}/extension/activity`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, title: title || '', ts: Date.now() }),
    signal: AbortSignal.timeout(1500),
  }).catch(() => {});
}

// ── Web navigation hooks ──────────────────────────────────────────────────────

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
        addLog('hidden', `Redirected ${rule.displayName} URL`, details.url.slice(0, 60));
        return;
      }
    }
  }
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.frameId !== 0) return;
  reportActivity(details.url, details.title);
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

// Single-page-app navigations don't fire onCommitted; history updates catch them.
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.frameId !== 0) return;
  reportActivity(details.url, details.title);
});

// Switching tabs is also a "what am I looking at now" change.
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => { if (!chrome.runtime.lastError && tab) reportActivity(tab.url, tab.title); });
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.incognito) reportBypass({ ruleId: 'incognito', method: 'incognito_window', url: tab.url || '', timestamp: Date.now() });
});

// ── AI chat — streaming via chrome.runtime.connect port ──────────────────────

const CHAT_SYSTEM = `You are the Attentify browser extension assistant. You help users block distracting UI elements on websites.

When a user asks you to block something, respond helpfully AND include a rule block at the end:

<rule>
{
  "id": "unique-kebab-id",
  "domain": "example.com",
  "displayName": "What it blocks",
  "severity": "high",
  "selectors": ["css-selector-1", "css-selector-2"],
  "urlPatterns": ["*://*.example.com/bad-path/*"],
  "antiBypassSearchTerms": []
}
</rule>

Selector guidelines:
- YouTube: use custom element names like ytd-shorts, ytd-reel-shelf-renderer (very stable)
- Use [href="/path"] and [aria-label="..."] over class names (class names change every deploy)
- Use :has() for parent matching: ytd-guide-entry-renderer:has(a[href="/shorts"])
- Provide 2-4 selectors covering different DOM contexts (nav, feed, player)
- For SPAs, URL patterns in urlPatterns are most reliable (they redirect before page loads)

When the user expresses a general TOPIC or KIND of content they want gone everywhere
(e.g. "I don't want to see anything political", "hide sports stuff", "no celebrity gossip"),
that's a preference for the auto-hider, not a single element. In that case ALSO append a
preference block with the lowercase keywords/phrases to watch for across all sites:

<pref>
{ "keywords": ["politics", "election", "congress"] }
</pref>

The auto-hider scores every page region and automatically hides ones matching these topics.
Emit <pref> for topic/subject preferences; emit <rule> for specific UI elements. You may emit both.

When the user wants to block whole VIDEOS by what they are — a category of video or a word in
the title (e.g. "hide music videos", "block edits/AMVs", "no reaction videos", "don't show videos
with 'tier list' in the title") — emit a title-block list. Expand vague categories into concrete,
lowercase substrings that reliably appear in such video TITLES:

<titleblock>
{ "keywords": ["official video", "official music video", "official audio", "lyric video", "lyrics", "vevo", "m/v", " mv", "ft.", "feat.", "edit", "amv", "fancam", "[edit]"] }
</titleblock>

The extension instantly hides any YouTube feed tile or watch page whose title contains one of these
substrings — both before the user clicks (in the feed) and the moment a matching video opens. Prefer
distinctive substrings to avoid false matches (e.g. "official music video" not just "music"). Emit
<titleblock> for "block this kind of video / this word in titles"; emit <pref> for on-page topic
regions. You may emit several block types together.

Be direct and specific. If the user describes a problem (e.g. "shorts keep appearing"), diagnose it.`;

chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'pd-chat') return;

  port.onMessage.addListener(async msg => {
    if (msg.type !== 'chat:start') return;

    const { text, history, apiKey, useOrProxy } = msg;

    // Build messages array
    const messages = [
      ...(history || []).filter(m => m.role === 'user' || m.role === 'assistant').slice(-10),
      { role: 'user', content: text },
    ];

    // Add current rules context as first user message
    const rulesCtx = rules.filter(r => r.enabled).map(r => `- ${r.displayName} (${r.domain}): ${r.enabled ? 'ON' : 'OFF'}`).join('\n') || 'none';
    const systemWithCtx = CHAT_SYSTEM + `\n\nCurrently enabled rules:\n${rulesCtx}`;

    // Route: daemon proxy → cloud (managed AI) → direct OpenRouter
    if (daemonConnected && daemonPort && !useOrProxy) {
      const ok = await chatViaDaemon(messages, systemWithCtx, port);
      if (ok) return;   // else fall through to cloud / own key
    }

    if (cloudAiReady() && !useOrProxy) {
      const okStream = await chatViaCloud(messages, systemWithCtx, port);
      if (okStream) return;   // else fall through to a user key if they have one
    }

    // Direct path — the user's own key, if they pasted one (never metered).
    const key = apiKey || await getEffectiveKey();
    if (key) {
      await chatDirect(messages, systemWithCtx, key, port);
      return;
    }

    // No own key and the managed AI isn't available: either out of credit, or not signed in.
    port.postMessage({ type: 'error', message: cloudOutOfCredit() ? 'out_of_credit' : (isSignedInCloud() ? 'cloud_unavailable' : 'signin_required') });
  });
});

// Stream the managed-AI chat through the cloud proxy (paid tier, no user key needed).
async function chatViaCloud(messages, system, port) {
  try {
    const res = await cloudFetch('/v1/ai/chat', { method: 'POST', body: JSON.stringify({ system, messages }) }, 45000);
    if (!res.ok || !res.body) throw new Error(`cloud ${res.status}`);
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n'); buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') port.postMessage({ type: 'chunk', text: evt.delta.text });
        } catch (_) {}
      }
    }
    port.postMessage({ type: 'done' });
    refreshCloudStatus().catch(() => {});   // quota moved — refresh
    return true;
  } catch (e) {
    addLog('error', 'Cloud chat failed', e.message);
    return false;
  }
}

// Use the daemon purely as a free AI PROVIDER (its raw /ai/chat proxy), with the
// EXTENSION's own system prompt — NOT /inject/chat, which runs the daemon's generic
// desktop agent and therefore can't emit the extension's <rule>/<pref>/<titleblock>
// blocking DSL (that's why "via daemon" used to refuse to block music videos, edits,
// etc.). Now the assistant has the same blocking abilities regardless of AI source.
async function chatViaDaemon(messages, system, port) {
  try {
    const input = (messages || [])
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');
    const res = await fetch(`http://127.0.0.1:${daemonPort}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ system, input, max_tokens: 800 }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    const text = data.content || data.text || '';
    if (!text) throw new Error('empty response');
    port.postMessage({ type: 'chunk', text });   // single full reply (not deltas)
    port.postMessage({ type: 'done' });
    return true;
  } catch (e) {
    addLog('error', 'Daemon chat failed, falling back', e.message);
    return false;   // let the caller try cloud / own key instead of dead-ending
  }
}

async function chatDirect(messages, system, apiKey, port) {
  try {
    // Always use OpenRouter — simpler, one API key, free tier available
    const url = 'https://openrouter.ai/api/v1/messages';
    const headers = {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://attentify.ai',
      'X-Title': 'Attentify',
    };

    const body = JSON.stringify({
      model: 'anthropic/claude-haiku-4.5',   // OpenRouter slug uses a dot, not a dash
      max_tokens: 1024,
      stream: true,
      system,
      messages,
    });

    const res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(30000) });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${res.status}: ${err.slice(0, 100)}`);
    }

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let inTok = 0, outTok = 0;   // captured from the SSE usage fields to meter spend

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const evt = JSON.parse(data);
          if (evt.type === 'message_start' && evt.message?.usage) {
            inTok = evt.message.usage.input_tokens || inTok;
            outTok = evt.message.usage.output_tokens || outTok;
          }
          if (evt.type === 'message_delta' && evt.usage) outTok = evt.usage.output_tokens || outTok;
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            port.postMessage({ type: 'chunk', text: evt.delta.text });
          }
        } catch (_) {}
      }
    }
    await recordUsage('anthropic/claude-haiku-4.5', inTok, outTok);
    port.postMessage({ type: 'done', usage: await freeUsageState() });
  } catch (e) {
    addLog('error', `Direct chat error`, e.message);
    port.postMessage({ type: 'error', message: e.message });
  }
}

// ══ Context engine — assess intent + distraction on every navigation ═══════════
// Honours the "live AI every navigation" choice: each top-frame navigation asks the
// model to read intent and estimate a 0..1 distraction probability, which the content
// script uses to tune how aggressively it hides. Results are cached per-URL for a few
// minutes so SPA re-navigation / tab re-activation don't re-bill. With no API key or
// daemon we fall back to a local heuristic so the feature still works offline.

const CONTEXT_SYSTEM = `You analyze browsing context for a focus tool. Given where a user navigated and how they're behaving, judge whether they are likely being distracted from a purposeful goal versus acting intentionally.
Reply with ONLY compact JSON, no prose:
{"intent":"<short why they're here>","goalAligned":<true|false>,"distractionProbability":<number 0..1>,"reason":"<=12 words"}
distractionProbability is HIGH (>0.7) for passively scrolling an algorithmic feed / shorts / reels / homepage with no specific goal — especially with deep scroll, long dwell, and clicks on recommended items. It is LOW (<0.3) for searching something specific, reading an article, watching a chosen video, or using tools/forms.`;

const clamp01 = n => Math.max(0, Math.min(1, Number(n) || 0));
function normUrl(u) {
  try { const x = new URL(u); const q = x.searchParams.get('search_query') || x.searchParams.get('q') || ''; return x.origin + x.pathname + (q ? '?q=' + q : ''); }
  catch (_) { return u; }
}
function extractJson(s) { const i = s.indexOf('{'), j = s.lastIndexOf('}'); return (i >= 0 && j > i) ? s.slice(i, j + 1) : s; }

// Local fallback — coarse but useful when the model is unreachable.
const FEED_DOMAINS = ['youtube.com', 'tiktok.com', 'instagram.com', 'facebook.com', 'x.com', 'twitter.com', 'reddit.com'];
function heuristicAssess(info) {
  const d = info.domain || '';
  const feedy = FEED_DOMAINS.some(f => d === f || d.endsWith('.' + f));
  let p = 0;
  if (info.searchQuery) p = 0.12;
  else if (/\/(watch|video|status|comments|p|article|wiki)\b/.test(info.url || '')) p = 0.2;
  else if (feedy) p = 0.6;
  const b = info.behavior || {};
  if (b.maxScroll > 0.6) p += 0.15;
  if (b.recoClicks > 0)  p += 0.15;
  if ((b.dwellMs || 0) > 120000 && feedy) p += 0.1;
  return { intent: info.intentText || `on ${d}`, goalAligned: p < 0.5, distractionProbability: clamp01(p), reason: 'local heuristic' };
}

// ══ Attentify Cloud ══════════════════════════════════════════════════
// The paid tier: a license key (pasted by the user) unlocks the managed AI proxy —
// the model works with no OpenRouter key of their own — plus managed auto-blocking
// rules and analytics. The license key is stored durably like the API key.
const CLOUD_KEY_FIELD = 'cloudKey';

async function getCloudKey() {
  let k = null;
  try { const s = await chrome.storage.sync.get(CLOUD_KEY_FIELD); k = s[CLOUD_KEY_FIELD] || null; } catch (_) {}
  if (!k) { const l = await chrome.storage.local.get(CLOUD_KEY_FIELD); k = l[CLOUD_KEY_FIELD] || null; if (k) { try { await chrome.storage.sync.set({ [CLOUD_KEY_FIELD]: k }); } catch (_) {} } }
  return k;
}
async function setCloudKey(k) {
  await chrome.storage.local.set({ [CLOUD_KEY_FIELD]: k });
  try { await chrome.storage.sync.set({ [CLOUD_KEY_FIELD]: k }); } catch (_) {}
}
async function clearCloudKey() {
  await chrome.storage.local.remove(CLOUD_KEY_FIELD);
  try { await chrome.storage.sync.remove(CLOUD_KEY_FIELD); } catch (_) {}
  cloudStatus = null; await chrome.storage.local.set({ cloudStatus: null });
}

// A stable-ish per-device fingerprint from navigator signals, so the backend grants the
// free trial credit at most once per device (the extension half of the anti-abuse gate).
async function deviceFingerprintExt() {
  const n = navigator;
  const basis = [n.userAgent, n.platform, n.language, n.hardwareConcurrency, n.deviceMemory].join('|');
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(basis));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// Create / sign in to an Attentify account straight from the extension (no license paste).
// The returned session token becomes the cloud credential; a new account gets trial credit.
async function authCloud(path, body) {
  try {
    const fp = await deviceFingerprintExt();
    const r = await fetch(cloudApi.replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Attentify-Client': 'ext' },
      body: JSON.stringify({ ...body, fingerprint: fp }),
      signal: AbortSignal.timeout(12000),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok || !data.token) return { ok: false, error: data.error || `Request failed (${r.status})` };
    await setCloudKey(data.token);
    cloudStatus = data.user || null;
    if (cloudStatus) cloudStatus.checkedAt = Date.now();
    await chrome.storage.local.set({ cloudStatus });
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: String(e).includes('timeout') ? 'Could not reach the server.' : 'Something went wrong.' };
  }
}
const signupCloud = (email, password) => authCloud('/v1/auth/signup', { email, password });
const loginCloud = (email, password) => authCloud('/v1/auth/login', { email, password });

// Start a one-time credit-pack checkout ('5' | '10' | '20'); returns the hosted Stripe URL.
async function buyCreditsCloud(pack) {
  try {
    const r = await cloudFetch('/v1/billing/credits', { method: 'POST', body: JSON.stringify({ pack }) }, 15000);
    const data = await r.json().catch(() => ({}));
    return { url: data.url, error: data.error };
  } catch (e) { return { error: String(e) }; }
}

async function cloudFetch(path, opts = {}, ms = 20000) {
  const key = await getCloudKey();
  if (!key) throw new Error('no_cloud_key');
  return fetch(cloudApi.replace(/\/$/, '') + path, {
    ...opts,
    // X-Attentify-Client picks the extension provider key + spend attribution on the backend.
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'X-Attentify-Client': 'ext', ...(opts.headers || {}) },
    signal: AbortSignal.timeout(ms),
  });
}

// Is the cloud AI usable right now? True for a subscriber OR a signed-in account with
// credit left — the backend computes this and returns it as `canUseAi` on /v1/me.
const cloudAiReady = () => !!cloudStatus && cloudStatus.canUseAi === true;
const cloudOutOfCredit = () => !!cloudStatus && cloudStatus.outOfCredit === true;
const isSignedInCloud = () => !!(cloudStatus && cloudStatus.email);

async function refreshCloudStatus() {
  const key = await getCloudKey();
  if (!key) { cloudStatus = null; await chrome.storage.local.set({ cloudStatus: null }); return null; }
  try {
    const r = await cloudFetch('/v1/me', { method: 'GET' }, 8000);
    if (!r.ok) { cloudStatus = { status: r.status === 401 ? 'invalid' : 'error' }; }
    else { cloudStatus = (await r.json()).user || null; if (cloudStatus) cloudStatus.checkedAt = Date.now(); }
  } catch (_) { /* keep last known status offline */ }
  await chrome.storage.local.set({ cloudStatus });
  if (cloudStatus?.tier === 'cloud') { tryCloudRules().catch(() => {}); flushCloudEvents().catch(() => {}); }
  return cloudStatus;
}

// Pull managed auto-blocking rules and merge them into the local rule set.
async function tryCloudRules() {
  try {
    const r = await cloudFetch('/v1/rules', { method: 'GET' }, 8000);
    if (!r.ok) return;
    const incoming = (await r.json()).rules || [];
    let changed = false;
    for (const raw of incoming) {
      const rule = { ...raw, enabled: raw.enabled !== false, managed: true };
      const idx = rules.findIndex(x => x.id === rule.id);
      if (idx === -1) { rules.push(rule); changed = true; }
      else if (JSON.stringify(rules[idx].selectors) !== JSON.stringify(rule.selectors)) { rules[idx] = { ...rules[idx], ...rule }; changed = true; }
    }
    if (changed) { await chrome.storage.local.set({ rules }); await pushRulesToTabs(); addLog('daemon', `Synced ${incoming.length} cloud rules`); }
  } catch (_) {}
}

function queueCloudEvent(e) {
  if (!cloudStatus || cloudStatus.tier !== 'cloud') return;
  cloudEvents.push({ ts: Date.now(), ...e });
  if (cloudEvents.length > 400) cloudEvents.shift();
}
async function flushCloudEvents() {
  if (!cloudEvents.length || cloudStatus?.tier !== 'cloud') return;
  const batch = cloudEvents.splice(0, 200);
  try {
    const r = await cloudFetch('/v1/analytics', { method: 'POST', body: JSON.stringify({ events: batch }) });
    if (!r.ok) cloudEvents.unshift(...batch);   // requeue on failure
  } catch (_) { cloudEvents.unshift(...batch); }
}

// Managed-AI non-streaming call through the cloud proxy → raw text (or throws).
async function cloudJson(system, userText) {
  const r = await cloudFetch('/v1/ai/json', { method: 'POST', body: JSON.stringify({ system, input: userText }) });
  if (!r.ok) throw new Error(`cloud ${r.status}`);
  return (await r.json()).text || '';
}

// Non-streaming single-shot LLM call → raw text. Cloud → daemon → OpenRouter.
async function llmJson(system, userText) {
  if (cloudAiReady()) {
    try { return await cloudJson(system, userText); } catch (_) { /* fall through */ }
  }
  if (daemonConnected && daemonPort) {
    try {
      // Use the raw AI proxy — NOT /inject/chat, which persists to the app's chat
      // history and runs the tool loop (this is an internal classifier call).
      const r = await fetch(`http://127.0.0.1:${daemonPort}/ai/json`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, input: userText }),
        signal: AbortSignal.timeout(15000),
      });
      if (r.ok) return (await r.json()).text || '';
    } catch (_) {}
  }
  // Falls back to the bundled free key when the user hasn't set one — but only while
  // free credit remains, so the context engine quietly drops to its local heuristic
  // (assessContext catches 'no_key') once the allowance is spent.
  const usage = await freeUsageState();
  if (usage.exhausted) throw new Error('no_key');
  const key = await getEffectiveKey();
  if (!key) throw new Error('no_key');
  const res = await fetch('https://openrouter.ai/api/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'anthropic-version': '2023-06-01', 'Authorization': `Bearer ${key}`, 'HTTP-Referer': 'https://attentify.ai', 'X-Title': 'Attentify' },
    body: JSON.stringify({ model: 'anthropic/claude-haiku-4.5', max_tokens: 300, system, messages: [{ role: 'user', content: userText }] }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  if (data.usage) await recordUsage('anthropic/claude-haiku-4.5', data.usage.input_tokens, data.usage.output_tokens);
  return (data.content?.map(b => b.text).join('')) || data.choices?.[0]?.message?.content || '';
}

async function assessContext(info) {
  const key = normUrl(info.url);
  const cached = contextCache.get(key);
  if (cached && Date.now() - cached.at < CONTEXT_TTL) return cached.val;

  let val;
  try {
    const txt = await llmJson(CONTEXT_SYSTEM, JSON.stringify({
      url: info.url, domain: info.domain, referrer: info.referrer, pageTitle: info.pageTitle,
      intentGuess: info.intentText, searchQuery: info.searchQuery, behavior: info.behavior,
    }));
    const p = JSON.parse(extractJson(txt));
    val = {
      intent: String(p.intent || info.intentText || '').slice(0, 140),
      goalAligned: !!p.goalAligned,
      distractionProbability: clamp01(p.distractionProbability),
      reason: String(p.reason || '').slice(0, 160), source: 'ai',
    };
  } catch (e) {
    val = { ...heuristicAssess(info), source: 'heuristic' };
    if (e.message !== 'no_key') addLog('error', 'Context assess failed (used heuristic)', e.message);
  }
  contextCache.set(key, { at: Date.now(), val });
  if (contextCache.size > 60) contextCache.delete(contextCache.keys().next().value);
  lastAssessment = { ...val, url: info.url, domain: info.domain, at: Date.now() };
  await chrome.storage.local.set({ lastAssessment });
  return val;
}

// Record each navigation's context read as a chronological flow entry. Collapses
// rapid duplicate fires for the same URL (load + immediate spa-nav) so the flow reads
// as distinct destinations, not noise.
async function logContext(info, val) {
  const last = contextLog[0];
  const sameSpot = last && last.url === info.url && (Date.now() - last.ts) < 8000;
  if (sameSpot) return;
  const now = Date.now();
  // Feed the standalone analytics DB: attribute dwell to the page we're leaving, and
  // count this visit + its distraction for the page we're arriving at.
  if (last && last.domain) trackVisit(last.domain, null, Math.min(now - last.ts, 5 * 60 * 1000), last.ts);
  trackVisit(info.domain, clamp01(val.distractionProbability), 0, now);
  contextLog.unshift({
    ts: now, url: info.url, domain: info.domain,
    intent: val.intent, distractionProbability: val.distractionProbability,
    goalAligned: val.goalAligned, reason: val.reason, source: val.source,
    navType: (info.behavior && info.behavior.navType) || 'load',
    searchQuery: info.searchQuery || '',
  });
  if (contextLog.length > 100) contextLog.pop();
  await chrome.storage.local.set({ contextLog, visitStats });
}

// ── Standalone analytics DB (chrome.storage) ────────────────────────────────────
// The extension's own attention record, so Insights/Timesheets/Activity work with no
// desktop app. Per-day, per-domain visits + summed distraction + dwell ms; 14-day window.
function dayKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function trackVisit(domain, distraction, dwellMs, ts) {
  if (!domain) return;
  const day = dayKey(ts || Date.now());
  const d = visitStats[day] || (visitStats[day] = {});
  const s = d[domain] || (d[domain] = { visits: 0, distractionSum: 0, ms: 0 });
  if (distraction != null) { s.visits += 1; s.distractionSum += distraction; }
  if (dwellMs) s.ms += dwellMs;
  // Retention: keep the most recent 14 day-buckets.
  const days = Object.keys(visitStats).sort();
  while (days.length > 14) delete visitStats[days.shift()];
}

// Aggregate the analytics DB + live counters into everything the popup tabs render.
function buildInsights() {
  const days = Object.keys(visitStats).sort();          // ascending
  const today = dayKey(Date.now());
  const last7 = days.slice(-7);
  const sumDay = (day) => {
    const dd = visitStats[day] || {};
    let visits = 0, distractionSum = 0, ms = 0;
    for (const dom in dd) { visits += dd[dom].visits; distractionSum += dd[dom].distractionSum; ms += dd[dom].ms; }
    const avg = visits ? distractionSum / visits : 0;
    return { visits, ms, avg, focusedMs: Math.round(ms * (1 - avg)), distractedMs: Math.round(ms * avg) };
  };
  const t = sumDay(today);
  const blocked = Object.values(elementStats || {}).reduce((a, b) => a + (b || 0), 0);

  // Top sites over the last 7 days by time.
  const agg = {};
  for (const day of last7) {
    const dd = visitStats[day] || {};
    for (const dom in dd) {
      const a = agg[dom] || (agg[dom] = { domain: dom, ms: 0, visits: 0, distractionSum: 0 });
      a.ms += dd[dom].ms; a.visits += dd[dom].visits; a.distractionSum += dd[dom].distractionSum;
    }
  }
  const topSites = Object.values(agg)
    .map(a => ({ domain: a.domain, ms: a.ms, visits: a.visits, distraction: a.visits ? a.distractionSum / a.visits : 0 }))
    .sort((a, b) => b.ms - a.ms).slice(0, 8);

  const week = last7.map(day => {
    const s = sumDay(day);
    return { day, label: new Date(day).toLocaleDateString([], { weekday: 'short' }), trackedMs: s.ms, focusRatio: s.ms ? Math.round((s.focusedMs / s.ms) * 100) : 0 };
  });

  // Recent distraction trend from the flow log (oldest → newest).
  const trend = contextLog.slice(0, 24).reverse().map(e => ({ ts: e.ts, pct: Math.round((e.distractionProbability || 0) * 100), domain: e.domain }));

  return {
    today: { visits: t.visits, trackedMs: t.ms, focusedMs: t.focusedMs, distractedMs: t.distractedMs, focusRatio: t.ms ? Math.round((t.focusedMs / t.ms) * 100) : 0, blocked },
    topSites, week, trend,
    connected: daemonConnected,
  };
}

// ── Focus session ───────────────────────────────────────────────────────────────
// Client-side: force aggressive auto-hide for a set duration. Standalone-friendly.
let focusPrevAuto = null;
async function setFocusSession(minutes) {
  const mins = Math.max(0, Math.min(240, minutes));
  if (mins > 0) {
    if (focusPrevAuto === null) focusPrevAuto = autoBlock;
    focusUntil = Date.now() + mins * 60000;
    if (!autoBlock) await setAutoBlock(true);
  } else {
    focusUntil = 0;
    if (focusPrevAuto !== null) { await setAutoBlock(focusPrevAuto); focusPrevAuto = null; }
  }
  await chrome.storage.local.set({ focusUntil });
}

// ── Feedback log — mispredictions + bug reports, queued for the future backend ──

async function queueFeedback(entry) {
  feedbackLog.unshift({ ts: Date.now(), ...entry });
  if (feedbackLog.length > 300) feedbackLog.pop();
  await chrome.storage.local.set({ feedbackLog });
  return feedbackLog.length;
}

// Retrain the client-side scanner from an explicit correction: when the user says an
// auto-hidden element "isn't a distraction", persist its selector so the scanner never
// auto-hides (or even re-surfaces) that element on this domain again. The content script
// reads autoHideSuppress from storage and watches it, so this takes effect immediately on
// the live tab and on every future page load.
async function suppressAutoHide(entry) {
  const domain = entry?.domain || domainOf(entry?.url);
  const selector = entry?.selector;
  if (!domain || !selector) return;
  const list = Array.isArray(autoHideSuppress[domain]) ? autoHideSuppress[domain] : [];
  if (!list.some(x => (x && x.selector) === selector)) {
    list.push({ selector, label: entry?.label || '', ts: Date.now() });
    autoHideSuppress[domain] = list.slice(-200);   // bound per-domain memory
    await chrome.storage.local.set({ autoHideSuppress });
    addLog('storage', `Learned: don't auto-hide on ${domain}`, entry?.label || selector);
  }
}

// ── GitHub token + bug reporting ────────────────────────────────────────────────
// Same durable storage strategy as the API key: sync (cross-device) + local mirror.

const GH_TOKEN_FIELD = 'githubToken';
const GH_REPO = 'lucadominguez/Browser-Daemon';

async function getGithubToken() {
  let t = null;
  try { const s = await chrome.storage.sync.get(GH_TOKEN_FIELD); t = s[GH_TOKEN_FIELD] || null; } catch (_) {}
  if (!t) { const l = await chrome.storage.local.get(GH_TOKEN_FIELD); t = l[GH_TOKEN_FIELD] || null; if (t) { try { await chrome.storage.sync.set({ [GH_TOKEN_FIELD]: t }); } catch (_) {} } }
  return t;
}
async function setGithubToken(t) {
  await chrome.storage.local.set({ [GH_TOKEN_FIELD]: t });
  try { await chrome.storage.sync.set({ [GH_TOKEN_FIELD]: t }); } catch (_) {}
}
async function clearGithubToken() {
  await chrome.storage.local.remove(GH_TOKEN_FIELD);
  try { await chrome.storage.sync.remove(GH_TOKEN_FIELD); } catch (_) {}
}

async function reportBug(report) {
  const title = String(report.title || 'Bug report from extension').slice(0, 120);
  const body  = String(report.body || '');
  await queueFeedback({ kind: 'bug', title, body });   // keep a copy regardless of delivery
  const token = await getGithubToken();
  if (!token) return { ok: false, error: 'no_token' };
  try {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/issues`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ title, body, labels: Array.isArray(report.labels) ? report.labels : ['bug', 'from-extension'] }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) { const t = await res.text(); return { ok: false, error: `GitHub ${res.status}: ${t.slice(0, 160)}` }; }
    const data = await res.json();
    addLog('toggle', 'Bug report filed', `#${data.number}`);
    return { ok: true, url: data.html_url, number: data.number };
  } catch (e) { return { ok: false, error: e.message }; }
}

// ── API key storage ────────────────────────────────────────────────────────────
// The OpenRouter key is persisted in chrome.storage.sync so it survives extension
// reinstalls / fresh profiles and follows the user across devices, AND mirrored to
// storage.local so it keeps working when Chrome sync is disabled. Reads prefer sync,
// fall back to local, and back-fill whichever store is missing the value — so a key
// saved by any older build (local-only) is migrated up and never silently forgotten.
const API_KEY_FIELD = 'anthropicKey';

async function getApiKey() {
  let key = null;
  try {
    const s = await chrome.storage.sync.get(API_KEY_FIELD);
    key = s[API_KEY_FIELD] || null;
  } catch (_) { /* sync may be unavailable (disabled / over quota) */ }

  if (!key) {
    const l = await chrome.storage.local.get(API_KEY_FIELD);
    key = l[API_KEY_FIELD] || null;
    if (key) { try { await chrome.storage.sync.set({ [API_KEY_FIELD]: key }); } catch (_) {} } // migrate up
  } else {
    const l = await chrome.storage.local.get(API_KEY_FIELD);
    if (l[API_KEY_FIELD] !== key) { try { await chrome.storage.local.set({ [API_KEY_FIELD]: key }); } catch (_) {} } // mirror down
  }
  return key;
}

async function setApiKey(key) {
  await chrome.storage.local.set({ [API_KEY_FIELD]: key });   // local always works
  try { await chrome.storage.sync.set({ [API_KEY_FIELD]: key }); } catch (_) {} // sync = durable + cross-device
}

async function clearApiKey() {
  await chrome.storage.local.remove(API_KEY_FIELD);
  try { await chrome.storage.sync.remove(API_KEY_FIELD); } catch (_) {}
}

// The key AI calls actually use: the user's own if set, otherwise the bundled one.
async function getEffectiveKey() {
  return (await getApiKey()) || BUNDLED_OPENROUTER_KEY;
}

// Free-usage state. Cloud subscribers route through the managed proxy (server-metered,
// so cloudAiReady() short-circuits everything below); a user's own key is never metered.
async function freeUsageState() {
  const hasOwn = !!(await getApiKey());
  const subscribed = cloudAiReady();
  return {
    usedUsd: aiUsageUsd,
    limitUsd: FREE_USAGE_LIMIT_USD,
    remainingUsd: Math.max(0, FREE_USAGE_LIMIT_USD - aiUsageUsd),
    hasOwnKey: hasOwn,
    subscribed,
    exhausted: !hasOwn && !subscribed && aiUsageUsd >= FREE_USAGE_LIMIT_USD,
  };
}

// Add the estimated cost of a completed call — only the bundled free key is metered.
async function recordUsage(model, inTok, outTok) {
  if (cloudAiReady()) return;
  if (await getApiKey()) return;            // own key → not metered
  const cost = estimateCostUsd(model, inTok || 0, outTok || 0);
  if (cost <= 0) return;
  aiUsageUsd += cost;
  await chrome.storage.local.set({ aiUsageUsd });
}

// ── Messages ──────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'get:rules':
      ensureReady().then(() => sendResponse({ rules: rulesForTab(domainOf(sender?.tab?.url)), autoBlock, userKeywords: autoHideKeywords, titleBlocks }));
      return true;

    case 'get:auto-block':
      ensureReady().then(() => sendResponse({ autoBlock, autoHideKeywords, titleBlocks }));
      return true;

    // ── Standalone data for the popup's Insights/Activity/Logic/Actions/Focus tabs ──
    // Everything here is browser-native (chrome.storage), so the whole multi-view popup
    // works with no desktop app — the extension is a complete product on its own (Mac too).
    case 'get:insights':
      ensureReady().then(() => sendResponse(buildInsights()));
      return true;

    case 'get:suppressions':
      sendResponse({ autoHideSuppress });
      return true;

    case 'get:focus':
      sendResponse({ focusUntil, active: focusUntil > Date.now() });
      return true;

    case 'set:focus':
      setFocusSession(Number(msg.minutes) || 0).then(() => sendResponse({ ok: true, focusUntil, active: focusUntil > Date.now() }));
      return true;

    case 'get:title-blocks':
      ensureReady().then(() => sendResponse({ titleBlocks }));
      return true;

    case 'set:title-blocks':
      mergeTitleBlocks(msg.keywords, msg.replace).then(() => sendResponse({ ok: true, titleBlocks }));
      return true;

    case 'set:auto-block':
      setAutoBlock(!!msg.enabled).then(() => sendResponse({ ok: true, autoBlock }));
      return true;

    case 'set:auto-hide-prefs':   // merge topics the assistant learned from the user
      mergeAutoHideKeywords(msg.keywords, msg.replace).then(() => sendResponse({ ok: true, autoHideKeywords }));
      return true;

    case 'get:site-state':
      ensureReady().then(() => sendResponse({ domain: msg.domain, paused: !!pausedSites[msg.domain] }));
      return true;

    case 'set:site-pause':
      setSitePause(msg.domain, msg.paused).then(() => sendResponse({ ok: true, paused: msg.paused }));
      return true;

    case 'get:all-rules':
      sendResponse({ rules, connected: daemonConnected, daemonPort });
      return true;

    case 'get:status':
      chrome.storage.local.get(['bypassScores', 'elementStats']).then(d => {
        sendResponse({
          connected: daemonConnected, daemonPort, lastDaemonError, lastSyncAt, bootAt,
          rules: rules.length, enabledRules: rules.filter(r => r.enabled).length,
          bypassScores: d.bypassScores || bypassScores,
          elementStats: d.elementStats || elementStats,
          activityLog: activityLog.slice(0, 25),
        });
      });
      return true;

    case 'get:api-key':
      getApiKey().then(key => sendResponse({ key }));
      return true;

    case 'set:api-key':
      setApiKey(msg.key).then(() => sendResponse({ ok: true }));
      return true;

    case 'clear:api-key':
      clearApiKey().then(() => sendResponse({ ok: true }));
      return true;

    case 'toggle:rule':
      toggleRule(msg.ruleId, msg.enabled).then(ok => sendResponse({ ok }));
      return true;

    case 'create:rule':
      createRule(msg.rule).then(ok => sendResponse({ ok }));
      return true;

    case 'delete:rule':
      deleteRule(msg.ruleId).then(ok => sendResponse({ ok }));
      return true;

    case 'force:sync':
      tryDaemonSync().then(() => sendResponse({ ok: true, connected: daemonConnected, daemonPort, lastDaemonError }));
      return true;

    case 'daemon:open-rules':
      if (daemonPort) {
        fetch(`http://127.0.0.1:${daemonPort}/daemon/focus-rules`, { method: 'POST', signal: AbortSignal.timeout(2000) }).catch(() => {});
      }
      sendResponse({ ok: !!daemonPort, daemonPort });
      return true;

    case 'context:navigated': {
      // Live read on every navigation: ask the model (or heuristic), push the verdict
      // back to the tab so the scanner can adjust its aggressiveness.
      const tabId = sender.tab?.id;
      if (tabId) {
        ensureReady().then(() => assessContext(msg)).then(val => {
          logContext(msg, val);
          queueCloudEvent({ type: 'distraction', domain: msg.domain, value: val.distractionProbability, label: val.intent });
          chrome.tabs.sendMessage(tabId, { type: 'context:assessment', assessment: val }, () => void chrome.runtime.lastError);
          if (val.distractionProbability >= 0.7) addLog('bypass', `Likely distracted on ${msg.domain}`, val.intent);
        }).catch(() => {});
      }
      break;
    }

    case 'get:context-log':
      sendResponse({ contextLog: contextLog.slice(0, 60) });
      return true;

    case 'get:context-state':
      getGithubToken().then(token => sendResponse({ assessment: lastAssessment, feedbackCount: feedbackLog.length, hasGithubToken: !!token }));
      return true;

    case 'report:feedback':
      queueFeedback({ kind: 'misprediction', ...(msg.entry || {}) }).then(n => sendResponse({ ok: true, queued: n }));
      queueCloudEvent({ type: 'misprediction', domain: msg.entry?.domain, label: msg.entry?.label, meta: { selector: msg.entry?.selector, score: msg.entry?.score } });
      // Retrain the local scanner so it never auto-hides this element again.
      if (msg.entry?.verdict === 'wrong-hide') suppressAutoHide(msg.entry);
      // Mirror a "not a distraction" verdict into the daemon's self-evaluation ledger so the
      // error detector sees auto-hide mistakes (it otherwise only watches the daemon's own
      // classifier). Best-effort; the local queue above is the source of truth.
      if (daemonPort && msg.entry?.verdict === 'wrong-hide') {
        fetch(`http://127.0.0.1:${daemonPort}/extension/feedback`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            verdict: 'wrong-hide', domain: msg.entry.domain, url: msg.entry.url,
            label: msg.entry.label, score: msg.entry.score, selector: msg.entry.selector,
            signals: msg.entry.signals, confidence: msg.entry.confidence,
          }),
          signal: AbortSignal.timeout(1500),
        }).catch(() => {});
      }
      return true;

    case 'get:feedback-log':
      sendResponse({ feedbackLog: feedbackLog.slice(0, 60), count: feedbackLog.length });
      return true;

    case 'report:bug':
      reportBug(msg.report || {}).then(r => sendResponse(r));
      return true;

    case 'get:github-token':
      getGithubToken().then(token => sendResponse({ hasToken: !!token }));
      return true;

    case 'set:github-token':
      setGithubToken(String(msg.token || '')).then(() => sendResponse({ ok: true }));
      return true;

    case 'clear:github-token':
      clearGithubToken().then(() => sendResponse({ ok: true }));
      return true;

    case 'get:cloud':
      ensureReady().then(async () => {
        const hasKey = !!(await getCloudKey());
        sendResponse({ hasKey, cloudStatus, api: cloudApi, usage: await freeUsageState() });
        if (hasKey) refreshCloudStatus().catch(() => {});   // refresh in the background
      });
      return true;

    case 'get:usage':
      ensureReady().then(async () => sendResponse(await freeUsageState()));
      return true;

    case 'set:cloud-key':
      setCloudKey(String(msg.key || '').trim())
        .then(() => refreshCloudStatus())
        .then(() => sendResponse({ ok: true, cloudStatus }));
      return true;

    case 'clear:cloud-key':
      clearCloudKey().then(() => sendResponse({ ok: true }));
      return true;

    case 'set:cloud-api':
      cloudApi = String(msg.api || CLOUD_API_DEFAULT).trim() || CLOUD_API_DEFAULT;
      chrome.storage.local.set({ cloudApiBase: cloudApi }).then(() => refreshCloudStatus()).then(() => sendResponse({ ok: true, api: cloudApi }));
      return true;

    case 'cloud:checkout':   // get a Stripe subscription checkout URL to open
      fetch(cloudApi.replace(/\/$/, '') + '/v1/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: msg.email || cloudStatus?.email || undefined }), signal: AbortSignal.timeout(15000),
      }).then(r => r.json()).then(d => sendResponse({ ok: !!d.url, url: d.url, error: d.error }))
        .catch(e => sendResponse({ ok: false, error: e.message }));
      return true;

    case 'cloud:signup':     // create an account from the extension (grants trial credit)
      signupCloud(msg.email || '', msg.password || '').then(r => sendResponse({ ...r, cloudStatus })).catch(e => sendResponse({ ok: false, error: String(e) }));
      return true;

    case 'cloud:login':      // sign in to an existing account
      loginCloud(msg.email || '', msg.password || '').then(r => sendResponse({ ...r, cloudStatus })).catch(e => sendResponse({ ok: false, error: String(e) }));
      return true;

    case 'cloud:logout':
      clearCloudKey().then(() => sendResponse({ ok: true }));
      return true;

    case 'cloud:buy-credits': // one-time credit-pack checkout URL ('5'|'10'|'20')
      buyCreditsCloud(String(msg.pack || '')).then(d => sendResponse({ ok: !!d.url, url: d.url, error: d.error })).catch(e => sendResponse({ ok: false, error: String(e) }));
      return true;

    case 'cloud:portal':     // manage/cancel via Stripe billing portal
      cloudFetch('/v1/billing/portal', { method: 'POST', body: '{}' })
        .then(r => r.json()).then(d => sendResponse({ ok: !!d.url, url: d.url, error: d.error }))
        .catch(e => sendResponse({ ok: false, error: e.message }));
      return true;

    case 'bypass:detected':
      reportBypass({ ...msg, tabId: sender.tab?.id });
      break;

    case 'element:blocked':
      chrome.storage.local.get('elementStats').then(d => {
        const s = d.elementStats || {};
        for (const id of (msg.ruleIds || [])) { s[id] = (s[id] || 0) + (msg.count || 1); elementStats[id] = s[id]; }
        chrome.storage.local.set({ elementStats: s });
        const name = rules.find(r => msg.ruleIds?.includes(r.id))?.displayName || '?';
        addLog('hidden', `${msg.count} element${msg.count!==1?'s':''} hidden`, name);
      });
      queueCloudEvent({ type: 'block', domain: domainOf(sender?.tab?.url), value: msg.count || 1 });
      break;

    case 'content:ready':
      addLog('inject', 'Content script confirmed', (sender.tab?.url || '').slice(0, 50));
      break;

    case 'test:inject': {
      const tabId = msg.tabId;
      if (!tabId) { sendResponse({ ok: false, error: 'No tabId' }); return true; }
      chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] })
        .then(() => {
          addLog('inject', 'Manual inject succeeded');
          const enabled = rules.filter(r => r.enabled);
          chrome.tabs.sendMessage(tabId, { type: 'rules:update', rules: enabled }, res => {
            sendResponse({ ok: true, rulesDelivered: enabled.length, tabResponse: res || null });
          });
        })
        .catch(e => { addLog('error', `Manual inject failed`, e.message); sendResponse({ ok: false, error: e.message }); });
      return true;
    }

    case 'get:update-info':
      checkForUpdates(msg.force || false).then(info => sendResponse({ info }));
      return true;
  }
});

// ── Alarms ────────────────────────────────────────────────────────────────────

chrome.alarms.create('daemonSync',  { periodInMinutes: 1 });
chrome.alarms.create('checkUpdate', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'daemonSync') ensureReady().then(() => { tryDaemonSync(); refreshCloudStatus().catch(() => {}); flushCloudEvents().catch(() => {}); }).catch(() => {});
  if (alarm.name === 'checkUpdate') checkForUpdates().catch(() => {});
});

// ── Update checker ────────────────────────────────────────────────────────────

// Update metadata is served from the public website (the GitHub repos are private,
// so the old raw.githubusercontent URLs 404'd and the auto-update reported failure).
// Update feed points at the LIVE deployment. attentify.ai/.ca is not on Cloudflare yet,
// so the site is served from the Pages domain; the updater must target where the zip
// actually lives or the "check for updates" silently fails. Move these to the custom
// domain once it's live on Cloudflare.
const GH_MANIFEST = 'https://productivity-daemon.pages.dev/ext/manifest.json';
const GH_ZIP      = 'https://productivity-daemon.pages.dev/ext/attentify-extension.zip';
const GH_RELEASES = 'https://productivity-daemon.pages.dev/#download';
const UPDATE_TTL  = 60 * 60 * 1000;

async function checkForUpdates(force = false) {
  const c = await chrome.storage.local.get(['updateInfo','updateCheckedAt']);
  if (!force && c.updateCheckedAt && Date.now()-c.updateCheckedAt < UPDATE_TTL) return c.updateInfo||null;
  try {
    const res = await fetch(GH_MANIFEST, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const remote = await res.json();
    const cur = chrome.runtime.getManifest().version;
    const info = { currentVersion: cur, latestVersion: remote.version, updateAvailable: isNewer(remote.version, cur), downloadUrl: GH_ZIP, releasesUrl: GH_RELEASES };
    await chrome.storage.local.set({ updateInfo: info, updateCheckedAt: Date.now() });
    return info;
  } catch (_) { return null; }
}

function isNewer(r, c) {
  const rv = r.split('.').map(Number), cv = c.split('.').map(Number);
  for (let i = 0; i < 3; i++) { if ((rv[i]||0) > (cv[i]||0)) return true; if ((rv[i]||0) < (cv[i]||0)) return false; }
  return false;
}

function matchPattern(url, pattern) {
  const re = pattern.replace(/[.+^${}()|[\]\\]/g,'\\$&').replace(/\*/g,'.*');
  try { return new RegExp('^'+re+'$','i').test(url); } catch(_){return false;}
}

// ── Boot ──────────────────────────────────────────────────────────────────────

// Boot on browser start and on install/update so rules are loaded and pushed to all
// open tabs without waiting for the first user interaction.
chrome.runtime.onStartup.addListener(() => ensureReady());
chrome.runtime.onInstalled.addListener(() => ensureReady());

// Clicking the toolbar icon opens the Side Panel (it stays open as you switch tabs
// and windows, unlike a popup which closes the moment it loses focus).
if (chrome.sidePanel?.setPanelBehavior) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

ensureReady();
checkForUpdates().catch(() => {});
