// Productivity Daemon — Content Script
// Runs at document_start on every page. Injects CSS to hide matching elements,
// watches for dynamically loaded content, detects SPA URL changes, and reports
// bypass attempts to the background worker.
(function () {
  'use strict';

  let activeRules = [];
  const STYLE_ID = 'pd-element-blocker';
  const HIDE = '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;}';

  function getDomain() {
    return location.hostname.replace(/^www\./, '');
  }

  function rulesForPage() {
    const d = getDomain();
    return activeRules.filter(
      (r) => r.enabled && (r.domain === d || d.endsWith('.' + r.domain))
    );
  }

  // ── CSS injection ────────────────────────────────────────────────────────────

  function injectStyles(rules) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (rules.length === 0) { el.textContent = ''; return; }

    el.textContent = rules.flatMap((r) => r.selectors.map((s) => s + ' ' + HIDE)).join('\n');

    // Report element-block stats to background
    let count = 0;
    const ruleIds = [];
    for (const rule of rules) {
      let n = 0;
      for (const sel of rule.selectors) {
        try { n += document.querySelectorAll(sel).length; } catch (_) {}
      }
      if (n > 0) { count += n; ruleIds.push(rule.id); }
    }
    if (count > 0) send({ type: 'element:blocked', ruleIds, count });
  }

  function applyRules() {
    injectStyles(rulesForPage());
  }

  // ── MutationObserver (SPA / infinite-scroll content) ────────────────────────

  let observer = null;
  let throttled = false;

  function ensureObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (throttled) return;
      throttled = true;
      requestAnimationFrame(() => { applyRules(); throttled = false; });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // ── SPA URL-change detection ─────────────────────────────────────────────────

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
      const prev = lastUrl;
      lastUrl = location.href;
      applyRules();
      checkUrlBypass(location.href);
    }
  }, 500);

  function checkUrlBypass(url) {
    for (const rule of rulesForPage()) {
      for (const pattern of (rule.urlPatterns || [])) {
        if (matchPattern(url, pattern)) {
          send({ type: 'bypass:detected', ruleId: rule.id, method: 'url_navigation', url, timestamp: Date.now() });
        }
      }
    }
  }

  // ── Special-case bypass detectors ───────────────────────────────────────────

  // Mobile YouTube — user navigated to m.youtube.com to avoid desktop selectors
  if (location.hostname === 'm.youtube.com') {
    send({ type: 'bypass:detected', ruleId: 'youtube-shorts', method: 'mobile_redirect', url: location.href, timestamp: Date.now() });
  }

  // Iframe embed — blocked content loaded inside an iframe on another page
  if (window !== window.top) {
    const domain = getDomain();
    const matched = activeRules.filter((r) => r.enabled && (r.domain === domain || domain.endsWith('.' + r.domain)));
    if (matched.length > 0) {
      send({ type: 'bypass:detected', ruleId: matched[0].id, method: 'iframe_embed', url: location.href, timestamp: Date.now() });
    }
  }

  // ── Messaging ────────────────────────────────────────────────────────────────

  function send(msg) {
    try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {}
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'rules:update') {
      activeRules = msg.rules || [];
      applyRules();
      if (activeRules.length > 0) ensureObserver();
    }
  });

  // ── Init ─────────────────────────────────────────────────────────────────────

  function init() {
    try {
      chrome.runtime.sendMessage({ type: 'get:rules' }, (res) => {
        if (chrome.runtime.lastError || !res) return;
        activeRules = res.rules || [];
        applyRules();
        if (activeRules.length > 0) ensureObserver();
      });
    } catch (_) {}
  }

  function matchPattern(url, pattern) {
    const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
  }

  init();
  document.addEventListener('DOMContentLoaded', () => { applyRules(); ensureObserver(); });
})();
