// Productivity Daemon — Content Script v0.2.0
// Injects CSS, watches DOM mutations, detects SPA nav, reports bypasses.
// Also handles get:tab-status so the popup can see exactly what's being hidden.
(function () {
  'use strict';

  // Guard against double-injection (scripting API can inject into tabs that
  // already have the content_scripts version running)
  if (window.__pdInjected) return;
  window.__pdInjected = true;

  let activeRules = [];
  const STYLE_ID = 'pd-element-blocker';
  const HIDE = '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;}';

  function getDomain() {
    return location.hostname.replace(/^www\./, '');
  }

  function rulesForPage() {
    const d = getDomain();
    return activeRules.filter(
      r => r.enabled && (r.domain === d || d.endsWith('.' + r.domain))
    );
  }

  // ── CSS injection ─────────────────────────────────────────────────────────────

  function injectStyles(rules) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (rules.length === 0) { el.textContent = ''; return 0; }

    el.textContent = rules.flatMap(r => r.selectors.map(s => s + ' ' + HIDE)).join('\n');

    let total = 0;
    const ruleIds = [];
    for (const rule of rules) {
      let n = countElements(rule.selectors);
      if (n > 0) { total += n; ruleIds.push(rule.id); }
    }
    if (total > 0) send({ type: 'element:blocked', ruleIds, count: total });
    return total;
  }

  function countElements(selectors) {
    let n = 0;
    for (const sel of selectors) {
      try { n += document.querySelectorAll(sel).length; } catch (_) {}
    }
    return n;
  }

  function applyRules() {
    return injectStyles(rulesForPage());
  }

  // ── MutationObserver ──────────────────────────────────────────────────────────

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

  // ── SPA URL detection ─────────────────────────────────────────────────────────

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href !== lastUrl) {
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

  // ── Messaging ─────────────────────────────────────────────────────────────────

  function send(msg) {
    try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {}
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.type === 'rules:update') {
      activeRules = msg.rules || [];
      applyRules();
      if (activeRules.length > 0) ensureObserver();
      return;
    }

    if (msg.type === 'get:tab-status') {
      const pageRules = rulesForPage();
      const elementCounts = {};
      let totalHidden = 0;
      for (const rule of pageRules) {
        const n = countElements(rule.selectors);
        elementCounts[rule.id] = n;
        totalHidden += n;
      }
      sendResponse({
        domain: getDomain(),
        activeRuleIds: pageRules.map(r => r.id),
        elementCounts,
        totalHidden,
        styleInjected: !!document.getElementById(STYLE_ID),
        rulesLoaded: activeRules.length,
      });
      return true; // keep channel open for async response
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────────

  function init() {
    try {
      chrome.runtime.sendMessage({ type: 'get:rules' }, res => {
        if (chrome.runtime.lastError || !res) return;
        activeRules = res.rules || [];
        applyRules();
        if (activeRules.length > 0) ensureObserver();
        // Check for mobile/iframe bypass only after rules are loaded
        checkSpecialCaseBypasses();
      });
    } catch (_) {}
  }

  function checkSpecialCaseBypasses() {
    if (location.hostname === 'm.youtube.com') {
      send({ type: 'bypass:detected', ruleId: 'youtube-shorts', method: 'mobile_redirect', url: location.href, timestamp: Date.now() });
    }
    if (window !== window.top) {
      const d = getDomain();
      const matched = activeRules.filter(r => r.enabled && (r.domain === d || d.endsWith('.' + r.domain)));
      if (matched.length > 0) {
        send({ type: 'bypass:detected', ruleId: matched[0].id, method: 'iframe_embed', url: location.href, timestamp: Date.now() });
      }
    }
  }

  function matchPattern(url, pattern) {
    const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
  }

  init();
  document.addEventListener('DOMContentLoaded', () => { applyRules(); ensureObserver(); });
})();
