// Productivity Daemon — Content Script v0.5.0
(function () {
  'use strict';
  if (window.__pdInjected) return;
  window.__pdInjected = true;

  let activeRules = [];
  const STYLE_ID = 'pd-element-blocker';
  const HIDE = '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;max-height:0!important;}';

  function getDomain() { return location.hostname.replace(/^www\./, ''); }

  function rulesForPage() {
    const d = getDomain();
    return activeRules.filter(r => r.enabled && (r.domain === d || d.endsWith('.' + r.domain)));
  }

  // ── CSS injection ─────────────────────────────────────────────────────────────

  function injectStyles(rules) {
    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    if (rules.length === 0) { el.textContent = ''; return; }
    el.textContent = rules.flatMap(r => r.selectors.map(s => `${s} ${HIDE}`)).join('\n');

    let total = 0; const ruleIds = [];
    for (const rule of rules) {
      const n = countEls(rule.selectors);
      if (n > 0) { total += n; ruleIds.push(rule.id); }
    }
    if (total > 0) send({ type: 'element:blocked', ruleIds, count: total });
  }

  function countEls(selectors) {
    let n = 0;
    for (const s of selectors) { try { n += document.querySelectorAll(s).length; } catch (_) {} }
    return n;
  }

  function applyRules() { injectStyles(rulesForPage()); }

  // ── MutationObserver + periodic re-apply (catches SPA re-renders) ─────────────

  let observer = null, throttled = false;

  function ensureObserver() {
    if (observer) return;
    observer = new MutationObserver(() => {
      if (throttled) return;
      throttled = true;
      requestAnimationFrame(() => { applyRules(); throttled = false; });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }

  // Periodic safety net — SPAs sometimes batch-render outside MutationObserver timing
  setInterval(applyRules, 3000);

  // ── SPA URL detection ─────────────────────────────────────────────────────────

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    applyRules();
    checkUrlBypass(location.href);
  }, 500);

  function checkUrlBypass(url) {
    for (const rule of rulesForPage()) {
      for (const p of (rule.urlPatterns || [])) {
        if (matchPattern(url, p)) send({ type: 'bypass:detected', ruleId: rule.id, method: 'url_navigation', url, timestamp: Date.now() });
      }
    }
  }

  // ── Messages ──────────────────────────────────────────────────────────────────

  function send(msg) { try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {} }

  chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
    if (msg.type === 'rules:update') {
      activeRules = msg.rules || [];
      applyRules();
      if (activeRules.length > 0) ensureObserver();
    }
    if (msg.type === 'get:tab-status') {
      const pageRules = rulesForPage();
      const elementCounts = {};
      let totalHidden = 0;
      for (const r of pageRules) {
        const n = countEls(r.selectors);
        elementCounts[r.id] = n;
        totalHidden += n;
      }
      sendResponse({ domain: getDomain(), activeRuleIds: pageRules.map(r => r.id), elementCounts, totalHidden, styleInjected: !!document.getElementById(STYLE_ID), rulesLoaded: activeRules.length });
      return true;
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
        if (location.hostname === 'm.youtube.com')
          send({ type: 'bypass:detected', ruleId: 'youtube-shorts', method: 'mobile_redirect', url: location.href, timestamp: Date.now() });
      });
    } catch (_) {}
    send({ type: 'content:ready' });
  }

  function matchPattern(url, pattern) {
    const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
  }

  init();
  document.addEventListener('DOMContentLoaded', () => { applyRules(); ensureObserver(); });
})();
