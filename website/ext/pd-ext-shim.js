/* Attentify browser-extension demo shim.
 *
 * The real extension popup (popup.html / popup.js / popup.css) only depends on the
 * chrome.* APIs and on messages to the background service worker and content script.
 * This file fakes all of that with simulated data, so the actual popup runs as a live
 * demo in a normal browser. Loaded before popup.js. No network, no Chrome, no install. */
(function () {
  'use strict';

  // ── simulated state ───────────────────────────────────────────────────────────
  var rules = [
    { id: 'youtube-shorts',  domain: 'youtube.com',  displayName: 'YouTube Shorts',            severity: 'high',   enabled: true },
    { id: 'youtube-home',    domain: 'youtube.com',  displayName: 'YouTube Home Feed',         severity: 'medium', enabled: false },
    { id: 'instagram-reels', domain: 'instagram.com', displayName: 'Instagram Reels',          severity: 'high',   enabled: true },
    { id: 'tiktok-fyp',      domain: 'tiktok.com',   displayName: 'TikTok For You Page',       severity: 'high',   enabled: true },
    { id: 'twitter-foryou',  domain: 'x.com',        displayName: 'X / Twitter "For You" Feed', severity: 'medium', enabled: true },
    { id: 'reddit-all',      domain: 'reddit.com',   displayName: 'Reddit r/all & r/popular',  severity: 'medium', enabled: true },
    { id: 'facebook-reels',  domain: 'facebook.com', displayName: 'Facebook Reels',            severity: 'high',   enabled: true },
    { id: 'linkedin-feed',   domain: 'linkedin.com', displayName: 'LinkedIn Feed',             severity: 'low',    enabled: false },
  ];
  var titleBlocks = [], autoHideKeywords = [], autoBlock = true;
  var apiKey = null, cloudStatus = null, aiUsageUsd = 0.12;
  var elementStats = { 'youtube-shorts': 412, 'instagram-reels': 96 };
  var bypassScores = {};
  var activityLog = [
    { ts: Date.now() - 40000,  type: 'hidden',  msg: '5 elements hidden',  detail: 'YouTube Shorts' },
    { ts: Date.now() - 210000, type: 'toggle',  msg: 'Enabled "Reddit r/all & r/popular"', detail: 'reddit.com' },
    { ts: Date.now() - 600000, type: 'storage', msg: 'Loaded 8 rules', detail: '6 enabled' },
    { ts: Date.now() - 605000, type: 'boot',    msg: 'Extension started' },
  ];
  // 'pd-theme':'light' forces the popup into its light theme for the website demo.
  var local = { onboardedAt: Date.now() - 86400000, 'pd-theme': 'light' };

  // ── sample reasoning (drives the Logic tab's "why" showcase) ────────────────────
  var TAXONOMY = [
    { key: 'short-form', label: 'Short-form video feeds', weight: 0.75, examples: 'Shorts, Reels, TikTok FYP', why: 'Autoplaying, algorithm-picked clips with no endpoint — engineered so one more is always one swipe away.' },
    { key: 'algo-feed', label: 'Algorithmic home feeds', weight: 0.60, examples: 'X/Twitter, Facebook, Reddit, IG home', why: 'An endless, personalised stream with no goal state. You did not come for a specific thing, so there is no "done".' },
    { key: 'recommended', label: 'Recommendation rails', weight: 0.40, examples: 'YouTube "Up next", "Recommended for you"', why: 'Sidebars that hijack a purposeful visit into a chain of one-more-click suggestions.' },
  ];
  var RECENT = [
    { ts: Date.now() - 40000, domain: 'reddit.com', url: 'https://reddit.com/', intent: 'landed on the reddit.com home feed', p: 0.82, category: 'feed', source: 'ai', reason: 'Passively scrolling the home feed with no goal', factors: [
      { w: 0.60, label: 'Algorithmic feed or home', detail: 'reddit.com opens to an endless recommended stream' },
      { w: 0.15, label: 'Deep scrolling', detail: 'reached 78% down the page' },
      { w: 0.15, label: 'Clicked recommended items', detail: '2 clicks into suggested posts' } ] },
    { ts: Date.now() - 120000, domain: 'youtube.com', url: 'https://youtube.com/shorts/x', intent: 'opened the Shorts feed', p: 0.9, category: 'short-form', source: 'signals', reason: '', factors: [
      { w: 0.75, label: 'Short-form video feed', detail: 'autoplaying, algorithm-picked clips with no endpoint' },
      { w: 0.15, label: 'Deep scrolling', detail: 'swiped through 11 clips' } ] },
    { ts: Date.now() - 300000, domain: 'stackoverflow.com', url: 'https://stackoverflow.com/questions/1', intent: 'viewing a specific answer', p: 0.18, category: 'page', source: 'signals', reason: '', factors: [
      { w: 0.20, label: 'Viewing one chosen page', detail: '/questions/1' } ] },
    { ts: Date.now() - 520000, domain: 'google.com', url: 'https://google.com/search?q=css+grid', intent: 'searching "css grid"', p: 0.12, category: 'search', source: 'signals', reason: '', factors: [
      { w: 0.12, label: 'Searching something specific', detail: '“css grid”' } ] },
  ];
  function reasoning() {
    var recent = RECENT.map(function (e) { return e; });
    var byCat = {}; recent.forEach(function (e) { var c = e.category || 'other'; var a = byCat[c] || (byCat[c] = { category: c, n: 0, sum: 0 }); a.n++; a.sum += e.p; });
    var categories = Object.keys(byCat).map(function (k) { var a = byCat[k]; return { category: a.category, n: a.n, avg: a.sum / a.n }; }).sort(function (x, y) { return y.n - x.n; });
    var bands = { high: 0, mid: 0, low: 0 };
    recent.forEach(function (e) { bands[e.p >= 0.6 ? 'high' : e.p >= 0.35 ? 'mid' : 'low']++; });
    return { taxonomy: TAXONOMY, recent: recent, categories: categories, bands: bands,
      corrections: [{ domain: 'reddit.com', n: 2 }, { domain: 'youtube.com', n: 1 }], correctionTotal: 3,
      keywords: ['crypto', 'gym influencers', 'drama'], rulesActive: rules.filter(function (r) { return r.enabled; }).length, rulesTotal: rules.length, assessedTotal: 34 };
  }
  function insights() {
    return { today: { visits: 38, trackedMs: 4800000, focusedMs: 3050000, distractedMs: 1750000, focusRatio: 64, blocked: 21 },
      topSites: [ { domain: 'github.com', ms: 2100000, visits: 9, distraction: 0.12 }, { domain: 'reddit.com', ms: 1200000, visits: 8, distraction: 0.78 }, { domain: 'youtube.com', ms: 900000, visits: 6, distraction: 0.7 } ],
      week: [ { label: 'Mon', trackedMs: 4e6, focusRatio: 66 }, { label: 'Tue', trackedMs: 5e6, focusRatio: 52 }, { label: 'Wed', trackedMs: 3e6, focusRatio: 74 }, { label: 'Thu', trackedMs: 6e6, focusRatio: 58 }, { label: 'Fri', trackedMs: 5e6, focusRatio: 64 } ],
      trend: [42, 65, 33, 74, 90, 28, 55, 63].map(function (pct, i) { return { ts: Date.now() - i * 6e5, pct: pct, domain: 'reddit.com' }; }), connected: false };
  }
  function analyticsRaw() {
    var vs = {}; var days = ['2026-07-21', '2026-07-22', '2026-07-23'];
    vs[days[0]] = { 'github.com': { visits: 6, distractionSum: 0.7, ms: 1300000 }, 'reddit.com': { visits: 5, distractionSum: 3.8, ms: 800000 } };
    vs[days[1]] = { 'github.com': { visits: 4, distractionSum: 0.5, ms: 900000 }, 'youtube.com': { visits: 5, distractionSum: 3.6, ms: 700000 } };
    vs[days[2]] = { 'github.com': { visits: 7, distractionSum: 0.9, ms: 1500000 }, 'reddit.com': { visits: 4, distractionSum: 3.1, ms: 600000 } };
    return { visitStats: vs, categories: [] };
  }

  function usage() {
    var used = aiUsageUsd, lim = 1.0;
    return { usedUsd: used, limitUsd: lim, remainingUsd: Math.max(0, lim - used), hasOwnKey: !!apiKey, subscribed: false, exhausted: !apiKey && used >= lim };
  }
  function tabStatus() {
    return { domain: 'youtube.com', totalHidden: 6, elementCounts: { 'youtube-shorts': 5, 'facebook-reels': 1 }, activeRuleIds: rules.filter(function (r) { return r.enabled; }).map(function (r) { return r.id; }) };
  }
  function distractions() {
    return {
      autoBlock: autoBlock, userKeywords: autoHideKeywords,
      assessment: { intent: 'Watching a Rust tutorial you opened on purpose', distractionProbability: 0.18, reason: 'a specific video, not the feed', source: 'ai' },
      distractionProb: 0.18,
      autoHidden: [
        { label: 'Shorts shelf', signals: ['links to /shorts/', 'vertical video grid'], score: 92, confidence: 'high' },
        { label: '"Up next" autoplay rail', signals: ['recommended', 'autoplay queue'], score: 74, confidence: 'high' },
      ],
      candidates: [
        { label: 'Comments section', signals: ['high volume', 'off topic'], score: 46, confidence: 'medium', selector: '#comments' },
      ],
    };
  }

  function chatReply(text) {
    var t = (text || '').toLowerCase();
    if (/youtube|shorts|feed/.test(t) && /keep|but|subscrip|tutorial|only/.test(t))
      return "Done. I've hidden YouTube Shorts and the home feed, but left your subscriptions, search and any video you open. You keep the tutorials, you lose the rabbit hole.";
    if (/music video|reaction|rage|gym|influencer|politic|gossip|celebrit|drama/.test(t))
      return "Got it. I'll keep that kind of video out of your feed and pull any match before you click it. Tell me others whenever, in plain words.";
    if (/block|hide|kill|remove|stop|no more/.test(t))
      return "Done, I've set up a rule for that and it's live in your browser now. The useful parts of the site still work.";
    if (/distract|most|eating|focus|score|week/.test(t))
      return "This week, Reddit and X took the most off-task time, mostly in the evenings. Want me to clamp down on both after 8pm?";
    return "Tell me what to hide and I'll write the rule. For example: \"hide Shorts but keep my subscriptions\" or \"no music videos in my feed\".";
  }

  // ── message routers ───────────────────────────────────────────────────────────
  function handle(msg) {
    switch (msg && msg.type) {
      case 'get:reasoning':     return reasoning();
      case 'get:insights':      return insights();
      case 'get:analytics-raw': return analyticsRaw();
      case 'get:focus':         return { active: false, focusUntil: 0 };
      case 'get:suppressions':  return { autoHideSuppress: { 'reddit.com': [1, 2], 'youtube.com': [1] } };
      case 'get:all-rules':     return { rules: rules, connected: false, daemonPort: null };
      case 'get:status':        return { connected: false, daemonPort: null, lastDaemonError: '', lastSyncAt: 0, bootAt: Date.now() - 600000, rules: rules.length, enabledRules: rules.filter(function (r) { return r.enabled; }).length, bypassScores: bypassScores, elementStats: elementStats, activityLog: activityLog };
      case 'get:site-state':    return { domain: msg.domain, paused: false };
      case 'get:auto-block':    return { autoBlock: autoBlock, autoHideKeywords: autoHideKeywords, titleBlocks: titleBlocks };
      case 'get:title-blocks':  return { titleBlocks: titleBlocks };
      case 'get:cloud':         return { hasKey: false, cloudStatus: cloudStatus, api: '', usage: usage() };
      case 'get:context-state': return { assessment: distractions().assessment, feedbackCount: 0, hasGithubToken: false };
      case 'get:context-log':   return { contextLog: [
        { ts: Date.now() - 30000,  domain: 'youtube.com', intent: 'Rust tutorial you chose', distractionProbability: 0.18, goalAligned: true,  reason: 'a chosen video', source: 'ai', navType: 'load' },
        { ts: Date.now() - 300000, domain: 'reddit.com',  intent: 'scrolling r/all',          distractionProbability: 0.79, goalAligned: false, reason: 'algorithmic feed', source: 'ai', navType: 'load' },
      ] };
      case 'get:api-key':       return { key: apiKey };
      case 'get:github-token':  return { hasToken: false };
      case 'get:update-info':   return { info: null };
      case 'get:feedback-log':  return { feedbackLog: [], count: 0 };
      case 'toggle:rule':       { var r = rules.find(function (x) { return x.id === msg.ruleId; }); if (r) r.enabled = !!msg.enabled; return { ok: true }; }
      case 'set:api-key':       apiKey = msg.key; return { ok: true };
      case 'clear:api-key':     apiKey = null; return { ok: true };
      case 'set:auto-block':    autoBlock = !!msg.enabled; return { ok: true, autoBlock: autoBlock };
      case 'set:auto-hide-prefs': autoHideKeywords = msg.replace ? (msg.keywords || []) : autoHideKeywords.concat(msg.keywords || []); return { ok: true, autoHideKeywords: autoHideKeywords };
      case 'set:title-blocks':  titleBlocks = msg.replace ? (msg.keywords || []) : titleBlocks.concat(msg.keywords || []); return { ok: true, titleBlocks: titleBlocks };
      case 'set:site-pause':    return { ok: true, paused: msg.paused };
      case 'set:cloud-key':     cloudStatus = { status: /^pd_live_/.test(msg.key || '') ? 'active' : 'invalid', tier: 'cloud' }; return { ok: true, cloudStatus: cloudStatus };
      case 'clear:cloud-key':   cloudStatus = null; return { ok: true };
      case 'cloud:checkout':    return { ok: true, url: 'https://attentify.ai/#pricing' };
      case 'cloud:portal':      return { ok: false, error: 'demo' };
      case 'create:rule':       rules.push(Object.assign({ enabled: true }, msg.rule)); return { ok: true };
      case 'force:sync':        return { ok: true, connected: false, daemonPort: null };
      case 'report:bug':        return { ok: false, error: 'Demo mode: bug reports are turned off here.' };
      case 'report:feedback':   return { ok: true, queued: 1 };
      case 'set:github-token':  return { ok: true };
      case 'clear:github-token': return { ok: true };
      case 'daemon:open-rules': return { ok: false };
      case 'test:inject':       return { ok: false, error: 'Demo mode' };
      default:                  return { ok: true };
    }
  }
  function handleTab(msg) {
    if (!msg) return { ok: true };
    if (msg.type === 'get:tab-status') return tabStatus();
    if (msg.type === 'get:distractions' || msg.type === 'scan:page') return distractions();
    return { ok: true };
  }

  function subset(keys) {
    if (keys == null) return Object.assign({}, local);
    if (typeof keys === 'string') { var o = {}; o[keys] = local[keys]; return o; }
    if (Array.isArray(keys)) { var r = {}; keys.forEach(function (k) { r[k] = local[k]; }); return r; }
    var out = {}; Object.keys(keys).forEach(function (k) { out[k] = (k in local) ? local[k] : keys[k]; }); return out;
  }

  // ── the fake chrome global ──────────────────────────────────────────────────────
  window.chrome = {
    runtime: {
      lastError: null,
      getManifest: function () { return { version: '0.18.2' }; },
      getURL: function (p) { return p; },
      sendMessage: function (msg, cb) { var r; try { r = handle(msg); } catch (e) { r = { ok: false }; } if (typeof cb === 'function') setTimeout(function () { cb(r); }, 25); },
      connect: function () {
        var ml = [], dl = [];
        var port = {
          name: 'pd-chat',
          onMessage: { addListener: function (f) { ml.push(f); } },
          onDisconnect: { addListener: function (f) { dl.push(f); } },
          postMessage: function (m) {
            if (m && m.type === 'chat:start') {
              var reply = chatReply(m.text), i = 0;
              setTimeout(function step() {
                if (i < reply.length) { var n = 2 + Math.floor(Math.random() * 4); port._emit({ type: 'chunk', text: reply.slice(i, i + n) }); i += n; setTimeout(step, 16 + Math.random() * 24); }
                else port._emit({ type: 'done' });
              }, 260);
            }
          },
          disconnect: function () { dl.forEach(function (f) { try { f(); } catch (_) {} }); },
          _emit: function (m) { ml.forEach(function (f) { try { f(m); } catch (_) {} }); },
        };
        return port;
      },
    },
    storage: {
      local: {
        get: function (keys, cb) { var out = subset(keys); if (typeof cb === 'function') cb(out); return Promise.resolve(out); },
        set: function (o, cb) { Object.assign(local, o || {}); if (typeof cb === 'function') cb(); return Promise.resolve(); },
        remove: function (k, cb) { (Array.isArray(k) ? k : [k]).forEach(function (x) { delete local[x]; }); if (typeof cb === 'function') cb(); return Promise.resolve(); },
      },
      sync: {
        get: function (keys, cb) { if (typeof cb === 'function') cb({}); return Promise.resolve({}); },
        set: function (o, cb) { if (typeof cb === 'function') cb(); return Promise.resolve(); },
        remove: function (k, cb) { if (typeof cb === 'function') cb(); return Promise.resolve(); },
      },
      onChanged: { addListener: function () {} },
    },
    tabs: {
      query: function (opts, cb) { var tabs = [{ id: 1, url: 'https://www.reddit.com/', active: true, title: 'reddit' }]; if (typeof cb === 'function') cb(tabs); return Promise.resolve(tabs); },
      sendMessage: function (id, msg, cb) { var r; try { r = handleTab(msg); } catch (e) { r = { ok: true }; } if (typeof cb === 'function') setTimeout(function () { cb(r); }, 25); },
      create: function (o) { try { window.open(o && o.url, '_blank', 'noopener'); } catch (_) {} },
      onActivated: { addListener: function () {} },
      onUpdated: { addListener: function () {} },
    },
    windows: { onFocusChanged: { addListener: function () {} } },
  };

  // ── auto-play: cycle tabs so the preview shows the real popup reasoning + blocking on
  //    its own. Home (this page blocked) → Logic (the "why", which animates in) → Insights,
  //    looping. Pauses if the viewer interacts, so it never fights a real click.
  function autoplay() {
    var order = ['logic', 'insights', 'home'];
    var i = -1, paused = false, timer = null;
    function clickTab(name) {
      var b = document.querySelector('.tab[data-tab="' + name + '"]');
      if (b) b.click();
    }
    function step() {
      if (paused) return;
      i = (i + 1) % order.length;
      clickTab(order[i]);
      timer = setTimeout(step, order[i] === 'logic' ? 6000 : 4500);
    }
    // Pause on any genuine interaction with the panel; resume after a lull.
    var resume = null;
    document.addEventListener('pointerdown', function () {
      paused = true; clearTimeout(timer); clearTimeout(resume);
      resume = setTimeout(function () { paused = false; step(); }, 12000);
    }, true);
    // Kick off shortly after the popup has rendered Home.
    setTimeout(step, 3200);
  }
  if (document.readyState === 'complete') autoplay();
  else window.addEventListener('load', autoplay);
})();
