'use strict';

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
      // Shorts shelf on home/subscriptions page
      'ytd-reel-shelf-renderer',
      // Left nav "Shorts" item (desktop)
      'ytd-guide-entry-renderer:has(a[href="/shorts"])',
      'ytd-mini-guide-entry-renderer:has(a[href="/shorts"])',
      // Chip/tab "Shorts" filters in search
      'yt-chip-cloud-chip-renderer:has([title="Shorts"])',
      // Any anchor pointing to /shorts
      'a.yt-simple-endpoint[href="/shorts"]',
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
      '*://www.tiktok.com/',
    ],
    antiBypassSearchTerms: ['tiktok fyp', 'tiktok for you'],
    antiBypassUrlPatterns: [],
  },
  {
    id: 'twitter-foryou',
    domain: 'x.com',
    displayName: 'X/Twitter "For You" Feed',
    severity: 'medium',
    enabled: false,
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
    enabled: false,
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

const RULES_VERSION = 2; // bump when predefined rules change significantly

let rules = [], bypassScores = {}, bypassAttempts = [], elementStats = {};
let daemonPort = null, daemonConnected = false, lastSyncAt = 0, lastDaemonError = '';
let bootAt = Date.now();
const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];

// ── Bootstrap ─────────────────────────────────────────────────────────────────

async function bootstrap() {
  addLog('boot', 'Extension started');
  const d = await chrome.storage.local.get(['rules', 'rulesVersion', 'daemonPort', 'bypassScores', 'bypassAttempts', 'elementStats']);

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
    addLog('storage', `First run — ${rules.length} rules installed`, `${enabledCount} enabled by default (YouTube Shorts, Instagram Reels, TikTok FYP, Facebook Reels)`);
  }

  if (d.bypassScores)   bypassScores   = d.bypassScores;
  if (d.bypassAttempts) bypassAttempts = d.bypassAttempts;
  if (d.elementStats)   elementStats   = d.elementStats;
  if (d.daemonPort)     daemonPort     = d.daemonPort;

  const pushed = await pushRulesToTabs();
  addLog('tabs', `Rules pushed to ${pushed} tab(s)`);
  tryDaemonSync();
}

// ── Push rules to tabs — injects content script if missing ───────────────────

async function pushRulesToTabs() {
  const enabled = rules.filter(r => r.enabled);
  const tabs = await chrome.tabs.query({});
  let count = 0;
  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;
    const url = tab.url;
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://')) continue;
    count++;
    chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }, () => {
      if (chrome.runtime.lastError) {
        chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] })
          .then(() => {
            chrome.tabs.sendMessage(tab.id, { type: 'rules:update', rules: enabled }).catch(() => {});
            addLog('inject', `Injected into tab`, url.slice(0, 60));
          })
          .catch(e => addLog('error', `Inject failed`, e.message));
      }
    });
  }
  return count;
}

// Re-inject when tab finishes loading
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.status !== 'complete' || !tab.url) return;
  const url = tab.url;
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

// ── Daemon sync ───────────────────────────────────────────────────────────────

async function tryDaemonSync() {
  const port = await discoverPort();
  if (!port) {
    daemonConnected = false;
    lastDaemonError = `Not found on ports ${DAEMON_PORTS.join(', ')}`;
    addLog('daemon', 'Running standalone — daemon not found');
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
      addLog('daemon', `Synced ${fresh.length} rules from daemon`, `${fresh.filter(r=>r.enabled).length} enabled`);
    } else {
      addLog('daemon', `Connected to daemon on :${port}`);
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

// ── AI chat — streaming via chrome.runtime.connect port ──────────────────────

const CHAT_SYSTEM = `You are the Productivity Daemon browser extension assistant. You help users block distracting UI elements on websites.

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

    // Route: daemon proxy → direct API
    if (daemonConnected && daemonPort && !useOrProxy) {
      await chatViaDaemon(text, port);
      return;
    }

    if (!apiKey) {
      port.postMessage({ type: 'error', message: 'no_key' });
      return;
    }

    await chatDirect(messages, systemWithCtx, apiKey, port);
  });
});

async function chatViaDaemon(text, port) {
  try {
    port.postMessage({ type: 'chunk', text: '*(via daemon)* ' });
    const res = await fetch(`http://127.0.0.1:${daemonPort}/inject/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    port.postMessage({ type: 'chunk', text: data.content || '' });
    port.postMessage({ type: 'done' });
  } catch (e) {
    addLog('error', `Daemon chat failed, falling back`, e.message);
    port.postMessage({ type: 'error', message: 'daemon_fail' });
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
      'HTTP-Referer': 'https://productivitydaemon.app',
      'X-Title': 'Productivity Daemon',
    };

    const body = JSON.stringify({
      model: 'anthropic/claude-haiku-4-5',
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
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            port.postMessage({ type: 'chunk', text: evt.delta.text });
          }
        } catch (_) {}
      }
    }
    port.postMessage({ type: 'done' });
  } catch (e) {
    addLog('error', `Direct chat error`, e.message);
    port.postMessage({ type: 'error', message: e.message });
  }
}

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
          connected: daemonConnected, daemonPort, lastDaemonError, lastSyncAt, bootAt,
          rules: rules.length, enabledRules: rules.filter(r => r.enabled).length,
          bypassScores: d.bypassScores || bypassScores,
          elementStats: d.elementStats || elementStats,
          activityLog: activityLog.slice(0, 25),
        });
      });
      return true;

    case 'get:api-key':
      chrome.storage.local.get('anthropicKey').then(d => sendResponse({ key: d.anthropicKey || null }));
      return true;

    case 'set:api-key':
      chrome.storage.local.set({ anthropicKey: msg.key }).then(() => sendResponse({ ok: true }));
      return true;

    case 'toggle:rule':
      toggleRule(msg.ruleId, msg.enabled).then(ok => sendResponse({ ok }));
      return true;

    case 'create:rule':
      createRule(msg.rule).then(ok => sendResponse({ ok }));
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
  if (alarm.name === 'daemonSync')  tryDaemonSync().catch(() => {});
  if (alarm.name === 'checkUpdate') checkForUpdates().catch(() => {});
});

// ── Update checker ────────────────────────────────────────────────────────────

const GH_MANIFEST = 'https://raw.githubusercontent.com/lucadominguez/Browser-Daemon/master/extension/manifest.json';
const GH_ZIP      = 'https://github.com/lucadominguez/Browser-Daemon/archive/refs/heads/master.zip';
const GH_RELEASES = 'https://github.com/lucadominguez/Browser-Daemon/releases/latest';
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

bootstrap();
checkForUpdates().catch(() => {});
