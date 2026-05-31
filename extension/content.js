// Productivity Daemon — Content Script v0.6.0
//
// PERFORMANCE MODEL:
// CSS `display:none !important` on a selector applies to every matching element
// automatically — including ones the SPA adds later. The browser does this for
// free. So we inject the stylesheet ONCE and let it stand. No MutationObserver,
// no polling re-apply. The only JS work is:
//   1. Re-inject CSS when the rule set actually changes (rare)
//   2. A cheap 500ms URL poll for SPA-navigation bypass detection
//   3. Lazy element counting for telemetry — only when asked, or once after load
(function () {
  'use strict';
  if (window.__pdInjected) return;
  window.__pdInjected = true;

  let activeRules = [];
  let lastCss = '';                       // dedupe — only touch <style> when CSS changes
  const STYLE_ID = 'pd-element-blocker';
  const HIDE = '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;max-height:0!important;}';

  function getDomain() { return location.hostname.replace(/^www\./, ''); }

  function rulesForPage() {
    const d = getDomain();
    return activeRules.filter(r => r.enabled && (r.domain === d || d.endsWith('.' + r.domain)));
  }

  // ── CSS injection — runs once per rule change, then the browser does the rest ──

  function applyCss() {
    const pageRules = rulesForPage();
    const css = pageRules.length
      ? pageRules.flatMap(r => r.selectors.map(s => `${s} ${HIDE}`)).join('\n')
      : '';

    if (css === lastCss) return;          // nothing changed — skip the DOM write
    lastCss = css;

    let el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = css;

    // Count once, shortly after applying, for the popup's "N hidden" stat.
    // Debounced so rapid rule changes don't stack counts.
    scheduleCount();
  }

  // ── Lazy element counting (telemetry only — does NOT affect blocking) ─────────

  let countTimer = null;
  function scheduleCount() {
    if (countTimer) clearTimeout(countTimer);
    countTimer = setTimeout(countAndReport, 1200);
  }

  function countAndReport() {
    const pageRules = rulesForPage();
    let total = 0; const ruleIds = [];
    for (const rule of pageRules) {
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

  // ── SPA URL detection (cheap string compare every 500ms) ──────────────────────

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    // CSS is already in place and still applies; just recheck telemetry + bypass
    scheduleCount();
    checkUrlBypass(location.href);
  }, 500);

  function checkUrlBypass(url) {
    for (const rule of rulesForPage()) {
      for (const p of (rule.urlPatterns || [])) {
        if (matchPattern(url, p)) send({ type: 'bypass:detected', ruleId: rule.id, method: 'url_navigation', url, timestamp: Date.now() });
      }
    }
  }

  // ── Messaging ─────────────────────────────────────────────────────────────────

  function send(msg) { try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {} }

  chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
    if (msg.type === 'rules:update') {
      activeRules = msg.rules || [];
      applyCss();
    }
    if (msg.type === 'get:tab-status') {
      // Count on demand — this is the only place we do a full count synchronously
      const pageRules = rulesForPage();
      const elementCounts = {};
      let totalHidden = 0;
      for (const r of pageRules) {
        const n = countEls(r.selectors);
        elementCounts[r.id] = n;
        totalHidden += n;
      }
      sendResponse({
        domain: getDomain(),
        activeRuleIds: pageRules.map(r => r.id),
        elementCounts, totalHidden,
        styleInjected: !!document.getElementById(STYLE_ID),
        rulesLoaded: activeRules.length,
        cssApplied: lastCss.length > 0,
      });
      return true;
    }
  });

  // ── Init ──────────────────────────────────────────────────────────────────────

  function init() {
    try {
      chrome.runtime.sendMessage({ type: 'get:rules' }, res => {
        if (chrome.runtime.lastError || !res) return;
        activeRules = res.rules || [];
        applyCss();
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
})();
