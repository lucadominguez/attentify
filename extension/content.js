// Attentify — Content Script v0.6.0
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
  let adhocSelectors = [];                 // auto-detected distractions hidden this session
  let autoHidden = [];                     // {selector,label,signals,...} we auto-hid — shown in panel
  let autoBlock = false;                   // auto-hide high-confidence detections?
  let userKeywords = [];                   // topics the user told the assistant to hide
  let titleBlocks = [];                     // lowercase title substrings — block matching videos
  let titleOverrides = new Set();           // video keys the user chose to watch anyway this session
  let lastScan = [];                       // cached scan results for the panel
  let lastCss = '';                       // dedupe — only touch <style> when CSS changes
  let hiddenSel = [];                      // flattened selectors currently hidden — media-guard lookups
  let distractionProb = 0;                 // 0..1 from the context engine — raises auto-hide aggressiveness
  let assessment = null;                   // last context assessment {intent, distractionProbability, reason}
  let suppressSelectors = new Set();       // selectors the user flagged "not a distraction" here — scanner must skip
  const STYLE_ID = 'pd-element-blocker';

  // Load this domain's "not a distraction" corrections and keep them fresh. The scanner
  // consults these so a flagged element is never auto-hidden (or re-surfaced) again — the
  // client-side counterpart to the daemon's learned suppressions.
  function loadSuppressions() {
    try {
      chrome.storage.local.get('autoHideSuppress', (d) => {
        const map = (d && d.autoHideSuppress) || {};
        const list = map[getDomain()] || [];
        suppressSelectors = new Set(list.map(x => (x && x.selector) || (typeof x === 'string' ? x : null)).filter(Boolean));
      });
    } catch (_) {}
  }
  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.autoHideSuppress) loadSuppressions();
    });
  } catch (_) {}
  const HIDE = '{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;overflow:hidden!important;pointer-events:none!important;max-height:0!important;}';

  function getDomain() { return location.hostname.replace(/^www\./, ''); }

  // Search-engine results pages are never auto-hidden. A SERP is the user actively
  // looking for something, and its results are dense repeated link-lists with headings
  // like "Top stories" / "People also ask" — exactly the shape the distraction scanner
  // scores as a feed, so without this guard auto-hide silently eats search results.
  // (This mirrors the desktop classifier's "searches never auto-block" rule, which the
  // extension's own scanner never had.) Manual scanning still works; only auto-hide is
  // suppressed here.
  const SEARCH_HOSTS = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|search\.brave\.com|ecosia\.org|startpage\.com|yandex\.[a-z.]+|baidu\.com|qwant\.com|kagi\.com|search\.marginalia\.nu)$/;
  function isSearchResultsPage() {
    if (!SEARCH_HOSTS.test(location.hostname)) return false;
    const hasQuery = /[?&](q|query|search_query|p|text|wd|k)=/.test(location.search);
    return hasQuery || /(^|\/)(search|s)(\/|\?|$)/.test(location.pathname);
  }

  function rulesForPage() {
    const d = getDomain();
    return activeRules.filter(r => r.enabled && (r.domain === d || d.endsWith('.' + r.domain)));
  }

  // ── CSS injection — runs once per rule change, then the browser does the rest ──

  function applyCss() {
    const pageRules = rulesForPage();
    // [data-pd-hide] is set by the title-blocker on matching video tiles/players; the
    // browser then hides them and the media guard mutes any video inside them.
    const sels = ['[data-pd-hide]', ...pageRules.flatMap(r => r.selectors), ...adhocSelectors];
    hiddenSel = sels;                      // keep the media guard's lookup list in sync

    const css = sels.length ? sels.map(s => `${s} ${HIDE}`).join('\n') : '';

    // Skip the DOM write only if the CSS is unchanged AND our <style> is still in the
    // page. SPA frameworks (YouTube's Polymer) re-render and can wipe injected nodes;
    // if ours is gone we must re-add it even though the rules didn't change — otherwise
    // blocking silently dies until the user restarts the extension.
    if (css === lastCss && document.getElementById(STYLE_ID)) return;
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
    // Hiding a region with CSS does NOT stop a <video>/<audio> inside it — the
    // element keeps playing (this is why Shorts audio survived a display:none).
    // Actively silence any media that now lives under a hidden selector.
    scheduleMediaSweep();
  }

  // ── Media guard — pause+mute media inside hidden regions ──────────────────────
  // display:none never pauses an HTMLMediaElement. So we (a) sweep on every CSS
  // change and (b) listen, in the capture phase, for any media that *starts* (or
  // gets un-muted by the site's own script) and silence it if it sits under a
  // hidden selector. Event-driven, so it survives SPA re-creation and autoplay
  // restarts without polling.

  function isInsideHidden(el) {
    if (!hiddenSel.length || !el) return false;
    for (const s of hiddenSel) { try { if (el.closest(s)) return true; } catch (_) {} }
    return false;
  }

  function silence(m) {
    try {
      m.muted = true;
      m.pause();
      m.setAttribute('data-pd-silenced', '1');
    } catch (_) {}
  }

  let mediaSweepTimer = null;
  function scheduleMediaSweep() {
    clearTimeout(mediaSweepTimer);
    // small delay so the browser has applied the new CSS / laid out the page
    mediaSweepTimer = setTimeout(sweepHiddenMedia, 120);
  }

  function sweepHiddenMedia() {
    if (!hiddenSel.length) return 0;
    let n = 0;
    for (const m of document.querySelectorAll('video, audio')) {
      if ((!m.paused || !m.muted) && isInsideHidden(m)) { silence(m); n++; }
    }
    return n;
  }

  // ── Re-scan when substantial content arrives ──────────────────────────────────
  // Feeds, reels and recommendation rails are injected *after* first paint (and SPAs
  // swap whole views in), so a single load-time scan misses them. A throttled
  // observer re-scans when a meaningful chunk of new DOM appears — bounded to roughly
  // one scan per 2.5s so infinite-scroll churn can't pin the CPU.
  let moTimer = null;
  function installContentObserver() {
    let mo;
    try {
      mo = new MutationObserver(muts => {
        let addedEls = 0, bigSubtree = false;
        for (const m of muts) for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          addedEls++;
          if (n.querySelectorAll && n.querySelectorAll('*').length >= 4) bigSubtree = true;
        }
        if (addedEls < 2 && !bigSubtree) return;     // ignore trivial DOM tweaks
        clearTimeout(moTimer);
        const since = Date.now() - lastScanAt;
        const delay = since > 2500 ? 350 : (2500 - since);
        moTimer = setTimeout(() => scheduleAutoScan(0), Math.max(0, delay));
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
    } catch (_) {}
  }

  function installMediaGuard() {
    const onStart = e => {
      const m = e.target;
      if (m && (m.tagName === 'VIDEO' || m.tagName === 'AUDIO') && isInsideHidden(m)) silence(m);
    };
    // 'play'/'playing' catch autoplay + SPA-recreated players; 'volumechange'
    // catches sites that programmatically un-mute a hidden player. Setting
    // muted=true inside the handler re-fires volumechange but then m.muted is
    // already true, so there's no recursion.
    document.addEventListener('play', onStart, true);
    document.addEventListener('playing', onStart, true);
    document.addEventListener('volumechange', e => {
      const m = e.target;
      if (m && !m.muted && isInsideHidden(m)) silence(m);
    }, true);
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
    // Watchdog: if a framework wiped our stylesheet (but rules are unchanged), put it
    // back immediately so blocking self-heals without a restart or reload.
    if (lastCss && !document.getElementById(STYLE_ID)) applyCss();
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    // A new video may have opened — re-check the watch-page title block immediately.
    checkWatchBlock();
    // CSS is already in place and still applies; just recheck telemetry + bypass,
    // and re-scan since SPA navigation can swap in a whole new (distracting) view.
    scheduleCount();
    checkUrlBypass(location.href);
    scheduleAutoScan(1200);
    // A new view = a new intent. Reset behaviour and re-ask the context engine.
    resetBehavior('spa');
    setTimeout(() => reportContext('spa-nav'), 600);
  }, 500);

  function checkUrlBypass(url) {
    for (const rule of rulesForPage()) {
      for (const p of (rule.urlPatterns || [])) {
        if (matchPattern(url, p)) send({ type: 'bypass:detected', ruleId: rule.id, method: 'url_navigation', url, timestamp: Date.now() });
      }
    }
  }

  // ══ Title blocker — block videos by their title (fast, pre-emptive) ════════════
  // Substring-matches video titles against the user's block list, in two places:
  //   • feed tiles — hide a tile before it's ever clicked (pre-emptive)
  //   • watch page — the instant a blocked video opens, hide+mute the player and show
  //                  an overlay (driven by a <title> observer, so there's no scan lag)

  const YT_TILE_SEL = 'ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ' +
    'ytd-grid-video-renderer, ytd-playlist-video-renderer, ytd-reel-item-renderer, ' +
    'ytd-rich-grid-media, ytd-compact-radio-renderer, ytm-shorts-lockup-view-model';
  const YT_TITLE_SEL = '#video-title, a#video-title-link, h3 a.yt-simple-endpoint, .yt-lockup-metadata-view-model-wiz__title';
  const PLAYER_SEL = '#movie_player, ytd-player, .html5-video-player';

  function titleMatch(text) {
    if (!text || !titleBlocks.length) return null;
    const t = text.toLowerCase();
    for (const k of titleBlocks) { if (k && t.includes(k)) return k; }
    return null;
  }

  // Feed: hide tiles whose title matches. Clears stale marks first because YouTube
  // recycles tile DOM nodes as you scroll (a node may now hold a different video).
  function sweepTitleTiles() {
    for (const el of document.querySelectorAll('[data-pd-hide]')) {
      if (el.matches && el.matches(YT_TILE_SEL)) el.removeAttribute('data-pd-hide');
    }
    if (!titleBlocks.length) return 0;
    let n = 0;
    for (const te of document.querySelectorAll(YT_TITLE_SEL)) {
      const txt = (te.getAttribute('title') || te.textContent || '').trim();
      if (!titleMatch(txt)) continue;
      const tile = te.closest(YT_TILE_SEL);
      if (tile) { tile.setAttribute('data-pd-hide', '1'); n++; }
    }
    return n;
  }

  function isWatchPage() {
    return /(^|\.)youtube\.com$/.test(location.hostname) &&
      (location.pathname === '/watch' || location.pathname.startsWith('/shorts/'));
  }
  function videoKey() {
    try { const u = new URL(location.href); const v = u.searchParams.get('v'); return u.pathname + (v ? '?v=' + v : ''); }
    catch (_) { return location.pathname; }
  }
  function watchTitle() {
    const h1 = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1.title yt-formatted-string, #title h1');
    const og = document.querySelector('meta[property="og:title"]');
    const raw = (h1 && h1.textContent) || (og && og.getAttribute('content')) || document.title || '';
    return raw.replace(/\s*-\s*YouTube\s*$/i, '').trim();
  }

  function checkWatchBlock() {
    if (!isWatchPage() || !titleBlocks.length || titleOverrides.has(videoKey())) { clearWatchBlock(); return; }
    const m = titleMatch(watchTitle());
    if (m) showWatchBlock(watchTitle(), m);
    else clearWatchBlock();
  }

  function showWatchBlock(title, matched) {
    // Hide + mute the player via the same machinery as everything else.
    document.querySelectorAll(PLAYER_SEL).forEach(p => p.setAttribute('data-pd-hide', '1'));
    sweepHiddenMedia();
    let ov = document.getElementById('pd-watch-block');
    if (!ov) { ov = document.createElement('div'); ov.id = 'pd-watch-block'; (document.body || document.documentElement).appendChild(ov); }
    const safe = s => String(s || '').replace(/[<>&]/g, '');
    ov.innerHTML = `<div class="pd-wb-card">
        <div class="pd-wb-icon">🛡️</div>
        <div class="pd-wb-title">Blocked to protect your focus</div>
        <div class="pd-wb-sub">This video’s title matches your block for <b>“${safe(matched)}”</b>.</div>
        <div class="pd-wb-name">${safe(title).slice(0, 120)}</div>
        <div class="pd-wb-btns">
          <button id="pd-wb-back">← Go back</button>
          <button id="pd-wb-watch">Watch anyway</button>
        </div></div>`;
    ov.querySelector('#pd-wb-back').onclick = () => { if (history.length > 1) history.back(); else location.href = 'https://www.youtube.com/'; };
    ov.querySelector('#pd-wb-watch').onclick = () => { titleOverrides.add(videoKey()); clearWatchBlock(); };
    injectWatchBlockStyle();
  }

  function clearWatchBlock() {
    document.querySelectorAll(PLAYER_SEL).forEach(p => p.removeAttribute('data-pd-hide'));
    const ov = document.getElementById('pd-watch-block');
    if (ov) ov.remove();
  }

  function injectWatchBlockStyle() {
    if (document.getElementById('pd-wb-style')) return;
    const s = document.createElement('style');
    s.id = 'pd-wb-style';
    s.textContent =
      "#pd-watch-block{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;background:rgba(7,15,30,0.96);font-family:'Segoe UI',system-ui,sans-serif;}" +
      "#pd-watch-block .pd-wb-card{max-width:420px;text-align:center;color:#d8e4f0;padding:28px 26px;}" +
      "#pd-watch-block .pd-wb-icon{font-size:42px;margin-bottom:10px;}" +
      "#pd-watch-block .pd-wb-title{font-size:20px;font-weight:700;margin-bottom:8px;}" +
      "#pd-watch-block .pd-wb-sub{font-size:14px;color:rgba(216,228,240,0.7);margin-bottom:12px;line-height:1.5;}" +
      "#pd-watch-block .pd-wb-sub b{color:#00c8ff;}" +
      "#pd-watch-block .pd-wb-name{font-size:13px;color:rgba(216,228,240,0.45);font-style:italic;margin-bottom:20px;}" +
      "#pd-watch-block .pd-wb-btns{display:flex;gap:10px;justify-content:center;}" +
      "#pd-watch-block button{cursor:pointer;border-radius:7px;padding:9px 16px;font-size:13px;font-weight:600;border:1px solid rgba(0,200,255,0.3);}" +
      "#pd-watch-block #pd-wb-back{background:#00c8ff;color:#04121f;border-color:#00c8ff;}" +
      "#pd-watch-block #pd-wb-watch{background:transparent;color:rgba(216,228,240,0.6);}" +
      "#pd-watch-block #pd-wb-watch:hover{color:#fff;}";
    (document.head || document.documentElement).appendChild(s);
  }

  // The fast path: re-check the watch page the moment its <title> changes (YouTube
  // updates document.title on SPA navigation almost immediately) — no scan lag.
  function installTitleObserver() {
    const t = document.querySelector('title');
    if (t) { try { new MutationObserver(() => checkWatchBlock()).observe(t, { childList: true }); } catch (_) {} }
  }

  function applyTitleBlocks() {
    try { sweepTitleTiles(); checkWatchBlock(); } catch (_) {}
  }

  // ══ Distraction scanner ═══════════════════════════════════════════════════════
  // Mirrors the desktop app's "score it, then decide" idea, but for on-page UI. It
  // works top-down → zero-in: collect the page's structural/semantic regions, score
  // each on how distracting it looks, then emit a stable selector for the winners.

  const DISTRACTION_WORDS = [
    'for you', 'foryou', 'fyp', 'recommended', 'recommendation', 'suggested', 'suggestion',
    'trending', 'explore', 'discover', 'reels', 'shorts', 'stories', 'up next', 'watch next',
    'because you', 'you might', 'people you may know', 'who to follow', 'popular', 'more for you',
    'related videos', 'top stories', 'promoted', 'sponsored', 'feed', 'highlights',
  ];
  // Regions we must never offer to hide — hiding these breaks the page.
  const PROTECTED = new Set(['HTML', 'BODY', 'MAIN', 'HEADER', 'FOOTER', 'NAV']);

  function isVisible(el) {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 40 && r.height > 40;
  }

  function headingText(el) {
    const h = el.querySelector('h1, h2, h3, [role="heading"]');
    return h ? (h.textContent || '').slice(0, 80) : '';
  }

  // How many near-identical siblings does this element hold? (feed/grid signal)
  function repeatedChildren(el) {
    const kids = Array.from(el.children);
    if (kids.length < 5) return 0;
    const sig = c => c.tagName + ':' + (c.getAttribute('role') || '') + ':' + (c.className || '').toString().split(' ')[0];
    const counts = {};
    for (const c of kids) { const k = sig(c); counts[k] = (counts[k] || 0) + 1; }
    return Math.max(0, ...Object.values(counts));
  }

  function scoreEl(el) {
    if (PROTECTED.has(el.tagName) || !isVisible(el)) return null;
    const rect = el.getBoundingClientRect();
    const area = rect.width * rect.height;
    const vp = innerWidth * innerHeight;
    if (area < 8000 || area > vp * 4) return null;     // too small, or basically the whole doc

    const text = [
      el.getAttribute('aria-label'), el.getAttribute('data-e2e'), el.getAttribute('data-testid'),
      el.getAttribute('data-pagelet'), el.id, headingText(el),
    ].filter(Boolean).join(' ').toLowerCase();

    let score = 0; const signals = []; let userWanted = false;

    // The user explicitly told the assistant they want this kind of thing gone — match
    // against labels AND a slice of visible text (their topics live in body copy, not
    // just aria-labels), and treat any hit as a definite auto-hide.
    if (userKeywords.length) {
      const hay = (text + ' ' + (el.textContent || '').slice(0, 400)).toLowerCase();
      for (const kw of userKeywords) {
        if (kw && hay.includes(kw)) { score += 50; signals.push(`you asked: “${kw}”`); userWanted = true; break; }
      }
    }

    for (const w of DISTRACTION_WORDS) {
      if (text.includes(w)) { score += 34; signals.push(`“${w}”`); break; }
    }
    if (el.getAttribute('role') === 'feed') { score += 34; signals.push('role=feed'); }

    let shortVid = false;
    el.querySelectorAll('video').forEach(v => { if (v.hasAttribute('autoplay') || v.hasAttribute('loop') || v.muted) shortVid = true; });
    if (shortVid) { score += 30; signals.push('autoplay video'); }

    // Short-form video shelves (YouTube Shorts / IG-FB Reels): their tiles link to
    // /shorts/<id> or /reel/<id>. This is deploy-proof — it survives the host
    // renaming its custom elements, which is exactly how Shorts shelves slipped past.
    const sfLinks = el.querySelectorAll('a[href*="/shorts/"], a[href*="/reel/"], a[href*="/reels/"]').length;
    if (sfLinks >= 2) { score += 45; signals.push(`${sfLinks} short-video tiles`); }

    const rep = repeatedChildren(el);
    if (rep >= 6) { score += 26; signals.push(`${rep} repeated items`); }
    else if (rep >= 4) { score += 14; signals.push(`${rep} repeated items`); }

    if (el.scrollHeight > el.clientHeight * 1.6 && el.clientHeight > 280) { score += 12; signals.push('infinite scroll'); }
    if (area > vp * 0.55) { score += 8; signals.push('large region'); }

    // ── Negative signals — protect genuine content & tools from false hides ──
    const links = el.querySelectorAll('a').length;
    const paras = el.querySelectorAll('p').length;
    const txtLen = (el.textContent || '').length;
    // Article/reading content: lots of prose, few links. Don't nuke what they came to read.
    if (paras >= 2 && txtLen > 600 && links <= Math.max(3, paras)) { score -= 30; signals.push('reading content'); }
    // Interactive tools: forms / search / inputs mean the user is doing something deliberate.
    if (el.querySelector('form, input:not([type=hidden]), textarea, [role="search"], [role="searchbox"]')) { score -= 24; signals.push('has input'); }
    // Comment threads are engagement, but usually intentional — bias away from hiding.
    if (/comment|reply|replies|discussion/.test(text)) { score -= 14; signals.push('comments'); }

    // A topic the user explicitly asked to hide always wins, regardless of the
    // protective penalties above. Otherwise apply the (context-sensitive) gate.
    if (!userWanted && score < entryThreshold()) return null;
    return { el, score, signals, area, userWanted, label: cleanLabel(el, text) };
  }

  // The bar to even surface a candidate, and the bar to auto-hide it, both drop as
  // the context engine's distraction probability rises — i.e. the more the user
  // looks distracted, the more aggressively we offer to (and do) hide.
  function entryThreshold() { return Math.round(34 - distractionProb * 12); }   // 34 → 22
  function highThreshold()  { return Math.round(64 - distractionProb * 26); }   // 64 → 38

  function cleanLabel(el, text) {
    const lbl = el.getAttribute('aria-label') || headingText(el)
      || el.getAttribute('data-e2e') || el.getAttribute('data-testid') || el.tagName.toLowerCase();
    return lbl.trim().replace(/\s+/g, ' ').slice(0, 48) || el.tagName.toLowerCase();
  }

  const looksRandom = s => /[a-z]{1,3}[A-Z0-9]|[_-]?[a-f0-9]{6,}|^[a-z]{1,2}\d+$/.test(s) || /\d{4,}/.test(s);
  const cssEsc = s => (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/["\\]/g, '\\$&');

  // Build a selector that's stable across reloads/deploys: prefer ids, roles, aria,
  // data-* hooks; fall back to a short structural path. Reject if it matches nothing
  // or sweeps in too much of the page.
  function selectorFor(el) {
    const cands = [];
    // Short-form shelves (Shorts/Reels) get a precise, deploy-proof :has() selector
    // first — it pins the exact shelf by its /shorts/ tiles, not by a churny tag name.
    const tagL = el.tagName.toLowerCase();
    if (/-/.test(tagL) || el.tagName === 'SECTION' || el.tagName === 'ASIDE') {
      if (el.querySelector('a[href*="/shorts/"]')) cands.push(`${tagL}:has(a[href^="/shorts/"])`);
      else if (el.querySelector('a[href*="/reel/"], a[href*="/reels/"]')) cands.push(`${tagL}:has(a[href*="/reel/"])`);
    }
    if (el.id && !looksRandom(el.id)) cands.push(`#${cssEsc(el.id)}`);
    const role = el.getAttribute('role');
    const aria = el.getAttribute('aria-label');
    if (role === 'feed' && aria) cands.push(`[role="feed"][aria-label="${cssEsc(aria)}"]`);
    if (aria) cands.push(`${el.tagName.toLowerCase()}[aria-label="${cssEsc(aria)}"]`);
    for (const a of ['data-e2e', 'data-testid', 'data-pagelet']) {
      const v = el.getAttribute(a); if (v) cands.push(`[${a}="${cssEsc(v)}"]`);
    }
    if (role === 'feed') cands.push('[role="feed"]');
    // Custom-element tag names (ytd-*, yt-*) are very stable.
    if (el.tagName.includes('-')) cands.push(el.tagName.toLowerCase());

    for (const sel of cands) {
      try {
        const hits = document.querySelectorAll(sel);
        if (hits.length >= 1 && hits.length <= 8 && [...hits].includes(el)) return sel;
      } catch (_) {}
    }
    // Structural fallback: nearest stable ancestor + nth-of-type chain (max 3 hops).
    let node = el, parts = [];
    for (let i = 0; node && i < 3 && !PROTECTED.has(node.tagName); i++) {
      const tag = node.tagName.toLowerCase();
      if (node.id && !looksRandom(node.id)) { parts.unshift(`#${cssEsc(node.id)}`); break; }
      const sibs = node.parentElement ? [...node.parentElement.children].filter(c => c.tagName === node.tagName) : [node];
      parts.unshift(sibs.length > 1 ? `${tag}:nth-of-type(${sibs.indexOf(node) + 1})` : tag);
      node = node.parentElement;
    }
    const sel = parts.join(' > ');
    try { if ([...document.querySelectorAll(sel)].includes(el)) return sel; } catch (_) {}
    return null;
  }

  function scanForDistractions() {
    const seen = new Set();
    const cands = [];
    // Top-down: the page's semantic regions are the candidate set (bounded & cheap).
    const regions = document.querySelectorAll(
      '[role="feed"], [aria-label], section, aside, [data-e2e], [data-testid], [data-pagelet], ' +
      'ytd-rich-grid-renderer, ytd-reel-shelf-renderer, ytd-rich-shelf-renderer, ytd-rich-section-renderer, grid-shelf-view-model'
    );
    let scanned = 0;
    for (const el of regions) {
      if (scanned++ > 600) break;
      const scored = scoreEl(el);
      if (!scored) continue;
      // Zero-in: drop a candidate if an ancestor already scored (keep the outer region).
      let nested = false;
      for (const c of cands) { if (c.el.contains(el) || el.contains(c.el)) { nested = true; break; } }
      if (nested) continue;
      const selector = selectorFor(el);
      if (!selector || seen.has(selector)) continue;
      // The user flagged this element as "not a distraction" — never re-surface or auto-hide it.
      if (suppressSelectors.has(selector)) continue;
      seen.add(selector);
      cands.push(scored);
      scored.selector = selector;
    }
    return cands
      .map(c => ({
        selector: c.selector, label: c.label, score: Math.min(100, Math.max(0, c.score)),
        confidence: (c.userWanted || c.score >= highThreshold()) ? 'high' : 'medium',
        userWanted: !!c.userWanted, signals: c.signals,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }

  let scanTimer = null;
  let lastScanAt = 0;
  function scheduleAutoScan(delay = 1800) {
    clearTimeout(scanTimer);
    scanTimer = setTimeout(() => {
      lastScanAt = Date.now();
      applyTitleBlocks();        // hide title-blocked tiles / watch pages on every pass
      try {
        lastScan = scanForDistractions();
        if (autoBlock) {
          let changed = false;
          for (const c of lastScan.filter(c => c.confidence === 'high')) {
            if (!adhocSelectors.includes(c.selector)) { adhocSelectors.push(c.selector); changed = true; }
            if (!autoHidden.some(a => a.selector === c.selector)) autoHidden.push(c);
          }
          if (changed) applyCss();
        }
        send({ type: 'distractions:scanned', domain: getDomain(), found: lastScan.length, autoHidden: autoHidden.length });
      } catch (_) {}
    }, delay);
  }

  // ══ Browsing-context engine ═══════════════════════════════════════════════════
  // Capture *why* the user is here (intent) and *how* they're behaving, hand it to
  // the background (which asks the model on every navigation), and let the returned
  // distraction probability tune how aggressively we hide. Behaviour is passive.

  const behavior = { startedAt: Date.now(), maxScroll: 0, feedClicks: 0, recoClicks: 0, navType: 'load' };

  function resetBehavior(navType) {
    behavior.startedAt = Date.now();
    behavior.maxScroll = 0; behavior.feedClicks = 0; behavior.recoClicks = 0;
    behavior.navType = navType || 'load';
  }

  function snapshotBehavior() {
    return {
      dwellMs: Date.now() - behavior.startedAt,
      maxScroll: +behavior.maxScroll.toFixed(2),
      feedClicks: behavior.feedClicks, recoClicks: behavior.recoClicks, navType: behavior.navType,
    };
  }

  // Best-effort read of *why* the user came here, from the URL alone.
  function extractIntent() {
    let u; try { u = new URL(location.href); } catch (_) { return { intentText: `on ${getDomain()}`, searchQuery: '' }; }
    const q = u.searchParams.get('search_query') || u.searchParams.get('q') || u.searchParams.get('query') || '';
    const p = u.pathname;
    let intentText;
    if (q) intentText = `searching "${q}"`;
    else if (/\/(watch|video|p|status|comments|article|wiki)\b/.test(p)) intentText = `viewing a specific page on ${getDomain()}`;
    else if (p === '/' || p === '') intentText = `landed on the ${getDomain()} home/feed`;
    else intentText = `browsing ${getDomain()}${p}`;
    return { intentText, searchQuery: q };
  }

  function installBehaviorTracking() {
    addEventListener('scroll', () => {
      const sc = (scrollY + innerHeight) / Math.max(1, document.documentElement.scrollHeight);
      if (sc > behavior.maxScroll) behavior.maxScroll = Math.min(1, sc);
    }, { passive: true });
    addEventListener('click', e => {
      const t = e.target;
      if (!t || !t.closest) return;
      // a click landing inside something the scanner flagged = engaging a distraction
      for (const c of lastScan) {
        try { if (t.closest(c.selector)) { behavior.feedClicks++; if (c.confidence === 'high') behavior.recoClicks++; break; } } catch (_) {}
      }
    }, true);
  }

  function reportContext(reason) {
    const { intentText, searchQuery } = extractIntent();
    send({
      type: 'context:navigated',
      url: location.href, domain: getDomain(), referrer: document.referrer || '',
      pageTitle: (document.title || '').slice(0, 160),
      intentText, searchQuery, behavior: snapshotBehavior(), reason: reason || 'navigation',
    });
  }

  // ── Messaging ─────────────────────────────────────────────────────────────────

  function send(msg) { try { chrome.runtime.sendMessage(msg).catch(() => {}); } catch (_) {} }

  chrome.runtime.onMessage.addListener((msg, _s, sendResponse) => {
    if (msg.type === 'rules:update') {
      activeRules = msg.rules || [];
      if (typeof msg.autoBlock === 'boolean') autoBlock = msg.autoBlock;
      if (Array.isArray(msg.titleBlocks)) titleBlocks = msg.titleBlocks;
      applyCss();
      applyTitleBlocks();
    }
    if (msg.type === 'settings:update') {
      if (typeof msg.autoBlock === 'boolean') autoBlock = msg.autoBlock;
      if (Array.isArray(msg.userKeywords)) userKeywords = msg.userKeywords;
      if (Array.isArray(msg.titleBlocks)) titleBlocks = msg.titleBlocks;
      applyTitleBlocks();
      scheduleAutoScan(200);
      sendResponse?.({ ok: true });
    }
    if (msg.type === 'scan:page') {
      // Fresh scan on demand (the panel's "Scan" button).
      lastScan = scanForDistractions();
      sendResponse({ domain: getDomain(), candidates: lastScan, autoBlock, autoHidden, userKeywords, assessment, distractionProb });
      return true;
    }
    if (msg.type === 'get:distractions') {
      sendResponse({ domain: getDomain(), candidates: lastScan, autoBlock, autoHidden, userKeywords, assessment, distractionProb });
      return true;
    }
    if (msg.type === 'context:assessment') {
      // Background's per-navigation read came back — adopt it and re-evaluate.
      assessment = msg.assessment || null;
      distractionProb = assessment ? Math.max(0, Math.min(1, +assessment.distractionProbability || 0)) : 0;
      scheduleAutoScan(300);
      sendResponse?.({ ok: true });
      return true;
    }
    if (msg.type === 'get:context') {
      // Snapshot for the bug report / feedback context.
      sendResponse({
        domain: getDomain(), url: location.href, assessment, distractionProb,
        behavior: snapshotBehavior(), autoHidden, candidates: lastScan,
        hiddenSelectors: hiddenSel,
      });
      return true;
    }
    if (msg.type === 'hide:adhoc') {
      for (const s of (msg.selectors || [])) if (s && !adhocSelectors.includes(s)) adhocSelectors.push(s);
      applyCss();
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === 'unhide:adhoc') {
      const rm = new Set(msg.selectors || []);
      adhocSelectors = adhocSelectors.filter(s => !rm.has(s));
      autoHidden = autoHidden.filter(a => !rm.has(a.selector));
      applyCss();
      sendResponse({ ok: true });
      return true;
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

  // Have we ever gotten a rules answer from the background? At document_start the MV3
  // service worker is often asleep and the first message can be dropped while it boots
  // — leaving the page unblocked until a manual reload. So we retry, and also re-ask
  // whenever the tab becomes visible (i.e. the user switches to it), which self-heals
  // a cold-start miss without any reload.
  let rulesReceived = false;

  function requestRules(attempt = 0) {
    try {
      chrome.runtime.sendMessage({ type: 'get:rules' }, res => {
        if (chrome.runtime.lastError || !res) {
          if (attempt < 5) setTimeout(() => requestRules(attempt + 1), 300 + attempt * 350);
          return;
        }
        rulesReceived = true;
        activeRules = res.rules || [];
        autoBlock = !!res.autoBlock;
        if (Array.isArray(res.userKeywords)) userKeywords = res.userKeywords;
        if (Array.isArray(res.titleBlocks)) titleBlocks = res.titleBlocks;
        applyCss();
        applyTitleBlocks();
        scheduleAutoScan();
        if (location.hostname === 'm.youtube.com')
          send({ type: 'bypass:detected', ruleId: 'youtube-shorts', method: 'mobile_redirect', url: location.href, timestamp: Date.now() });
      });
    } catch (_) {
      if (attempt < 5) setTimeout(() => requestRules(attempt + 1), 300 + attempt * 350);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    if (!rulesReceived) requestRules();   // cold-start miss — try again
    else applyCss();                      // re-assert in case the stylesheet was wiped while hidden
  });
  // bfcache restores (back/forward) re-run nothing — re-assert rules on show.
  window.addEventListener('pageshow', e => { if (e.persisted && !rulesReceived) requestRules(); });

  function init() {
    loadSuppressions();
    installMediaGuard();
    installBehaviorTracking();
    installContentObserver();
    installTitleObserver();
    requestRules();
    send({ type: 'content:ready' });
    // Ask the context engine why we're here (give referrer/URL a moment to settle).
    setTimeout(() => reportContext('load'), 800);
  }

  function matchPattern(url, pattern) {
    const re = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
    try { return new RegExp('^' + re + '$', 'i').test(url); } catch (_) { return false; }
  }

  init();
})();
