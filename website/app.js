/* ============ Attentify site interactions ============ */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Cloud backend (Cloudflare Worker). Replace with your deployed URL.
  const CLOUD_API = 'https://attentify-cloud.ludomi2502.workers.dev';
  window.PD_CLOUD_API = CLOUD_API;

  // ---- year ----
  $('#year').textContent = new Date().getFullYear();

  // ---- sticky nav + burger ----
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  onScroll(); addEventListener('scroll', onScroll, { passive: true });
  $('#burger').addEventListener('click', () => nav.classList.toggle('open'));
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // ---- scroll-spy: highlight the nav link for the section you're viewing ----
  const navAnchors = $$('.nav-links a[href^="#"]');
  const linkFor = id => navAnchors.find(a => a.getAttribute('href') === '#' + id);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const link = linkFor(e.target.id);
      if (!link) return;
      navAnchors.forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  ['app-demo', 'features', 'how', 'compare', 'pricing'].forEach(id => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  // ---- OS detection → badge the right download ----
  const plat = (navigator.userAgentData?.platform || navigator.platform || navigator.userAgent || '').toLowerCase();
  const os = /mac|iphone|ipad|ipod/.test(plat) ? 'mac' : /win/.test(plat) ? 'win' : null;
  if (os) $$('.dl[data-os="' + os + '"]').forEach(b => b.classList.add('is-os'));

  // ---- scroll reveal ----
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });

  // ---- count-up stats ----
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), v = Math.round((1 - Math.pow(1 - p, 3)) * target);
        el.textContent = pre + v + suf;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('.stat b[data-count]').forEach(el => countIO.observe(el));

  // ---- hero terminal typewriter ----
  const termLines = [
    { t: '$ daemon engage --focus', c: '' },
    { t: '[•] reading context…  intent = "writing code"', c: 'd' },
    { t: '[✓] youtube.com feed + Shorts hidden', c: 'g' },
    { t: '[✓] player & subscriptions kept intact', c: 'g' },
    { t: '[✓] 6 distractions removed in 412ms', c: 'c' },
    { t: '[•] watching for bypass attempts…', c: 'p' },
    { t: 'focus restored.', c: 'g' },
  ];
  const term = $('#term-body');
  if (term) (function typeTerm() {
    let li = 0, ci = 0, html = '';
    const cls = c => c ? `<span class="${c}">` : '';
    const step = () => {
      if (li >= termLines.length) { term.innerHTML = html + '<span class="cursor"></span>'; return; }
      const line = termLines[li];
      if (ci === 0) html += cls(line.c);
      if (ci < line.t.length) {
        term.innerHTML = html + line.t.slice(0, ++ci) + (line.c ? '</span>' : '') + '<span class="cursor"></span>';
        setTimeout(step, 16 + Math.random() * 26);
      } else {
        html += line.t + (line.c ? '</span>' : '') + '\n';
        li++; ci = 0;
        setTimeout(step, 360);
      }
    };
    setTimeout(step, 600);
  })();

  // ============ PREVIEW SWITCHER (desktop app <-> browser extension) ============
  // Both previews are real: the desktop app and the browser extension popup each run
  // in an iframe with a faked backend. This just flips which one is on screen.
  (function () {
    const btns = $$('.ps-btn');
    if (!btns.length) return;
    const show = which => {
      $$('.preview-pane').forEach(p => p.classList.toggle('hidden', p.dataset.pane !== which));
      btns.forEach(b => b.classList.toggle('on', b.dataset.prev === which));
    };
    btns.forEach(b => b.addEventListener('click', () => show(b.dataset.prev)));
  })();

  // The app demo is the real renderer embedded via <iframe src="./app/">, so no JS is needed here.

  // ============ EXTENSION DEMO: live page-cleaning across 4 real scenarios ============
  // A looping carousel of real pages. For each, Attentify reads it (scan line), then:
  //  • Feed / YouTube — flags each distracting element and strips it out.
  //  • Google search — tells a focused search (allowed) from a distracting one (blocked).
  //  • Gambling — blocks the whole site outright.
  // The status pill narrates the reasoning throughout, and the real extension popup runs
  // live in the iframe beside it (see pd-ext-shim.js). Not a mockup.
  (function () {
    const page = $('#ext-page'), scenesWrap = $('#ext-scenes');
    if (!page || !scenesWrap) return;
    const status = $('#ext-status'), statusTx = $('#ext-status-tx');
    const tabTitle = $('#ext-tab-title'), omniHost = $('#ext-omni-host'), omniPath = $('#ext-omni-path'),
          badge = $('#ext-badge'), fav = $('#ext-fav');
    const dots = $$('#ext-scene-dots .esd');

    let timers = [];
    const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const say = (tx, done) => { if (statusTx) statusTx.textContent = tx; if (status) status.classList.toggle('done', !!done); };
    const scan = () => { page.classList.remove('scanning'); void page.offsetWidth; page.classList.add('scanning'); after(1500, () => page.classList.remove('scanning')); };

    function setChrome(c) {
      if (!c) return;
      if (tabTitle) tabTitle.textContent = c.host;
      if (omniHost) omniHost.textContent = c.host;
      if (omniPath) omniPath.textContent = c.path || '';
      if (badge && c.badge != null) badge.textContent = String(c.badge);
      if (fav && c.fav) fav.style.background = c.fav;
    }
    function showScene(name) {
      const all = scenesWrap.querySelectorAll('.ext-scene');
      all.forEach(s => s.classList.toggle('on', s.dataset.scene === name));
      const sc = scenesWrap.querySelector('.ext-scene[data-scene="' + name + '"]');
      if (sc) {
        sc.querySelectorAll('.blockable').forEach(b => b.classList.remove('flagged', 'removed'));
        sc.querySelectorAll('.scene-block').forEach(b => b.classList.remove('on'));
      }
      return sc;
    }
    const setDots = i => dots.forEach((d, k) => d.classList.toggle('on', k === i));

    // ── scene runners (each calls `next` when done) ──
    function runClean(sc, cfg, next) {
      setChrome(cfg.chrome); say(cfg.intro || 'Reading page context…');
      after(500, scan);
      const bl = Array.prototype.slice.call(sc.querySelectorAll('.blockable'));
      after(2100, () => say('Found ' + bl.length + ' distractions off your goal'));
      after(2600, () => bl.forEach((b, i) => after(i * 160, () => b.classList.add('flagged'))));
      const rs = 3900, step = 1300;
      bl.forEach((b, i) => {
        after(rs + i * step, () => { say('Removing: ' + (b.dataset.reason || 'distraction')); if (badge) badge.textContent = String(i + 1); });
        after(rs + i * step + 500, () => { b.classList.remove('flagged'); b.classList.add('removed'); });
      });
      const done = rs + bl.length * step + 300;
      after(done, () => say(bl.length + ' distractions removed · page cleaned', true));
      after(done + 2600, next);
    }

    function runSearch(sc, cfg, next) {
      const q = sc.querySelector('#gs-q'), verdict = sc.querySelector('#gs-verdict'),
            block = sc.querySelector('#gs-block'), blockWhy = sc.querySelector('#gs-block-why');
      setChrome(cfg.chrome); q.textContent = cfg.goodQ; verdict.className = 'gs-verdict';
      say('Reading your search: “' + cfg.goodQ + '”');
      after(500, scan);
      after(2100, () => { verdict.textContent = '✓ on task'; verdict.className = 'gs-verdict good show'; say('On your goal — search allowed', false); });
      after(4300, () => { q.textContent = cfg.badQ; verdict.className = 'gs-verdict'; say('New search: “' + cfg.badQ + '”'); });
      after(4800, scan);
      after(6400, () => { verdict.textContent = '✕ off-goal'; verdict.className = 'gs-verdict bad show'; blockWhy.textContent = cfg.badWhy; block.classList.add('on'); say('Off-goal search — blocked', false); if (badge) badge.textContent = '1'; });
      after(9200, next);
    }

    function runBlock(sc, cfg, next) {
      const block = sc.querySelector('.scene-block');
      setChrome(cfg.chrome); say(cfg.intro || 'Reading page context…');
      after(500, scan);
      after(2200, () => say(cfg.detect));
      after(3500, () => { block.classList.add('on'); say(cfg.blocked, false); if (badge) badge.textContent = '1'; });
      after(6400, next);
    }

    const SCENES = [
      { name: 'reddit', mode: 'clean', intro: 'Reading reddit.com…',
        chrome: { host: 'reddit.com', path: '/', badge: 0, fav: '#ff4500' } },
      { name: 'google', mode: 'search',
        goodQ: 'react useEffect cleanup', badQ: 'premier league live stream free',
        chrome: { host: 'google.com', path: '/search', badge: 0, fav: '#4285f4' },
        badWhy: 'Off-goal for “deep work” — entertainment, not the task.' },
      { name: 'youtube', mode: 'clean', intro: 'Reading youtube.com…',
        chrome: { host: 'youtube.com', path: '/watch', badge: 0, fav: '#ff0033' } },
      { name: 'gambling', mode: 'block',
        chrome: { host: 'royalbet.bet', path: '/casino', badge: 0, fav: '#ffd24d' },
        detect: 'Recognised a gambling site', blocked: 'Blocked — gambling, off every goal' },
    ];

    function playScene(i) {
      clearTimers();
      setDots(i);
      const cfg = SCENES[i], sc = showScene(cfg.name);
      const next = () => playScene((i + 1) % SCENES.length);
      if (!sc) return next();
      if (cfg.mode === 'clean') runClean(sc, cfg, next);
      else if (cfg.mode === 'search') runSearch(sc, cfg, next);
      else runBlock(sc, cfg, next);
    }

    // Autoplay when the extension pane is visible; (re)start when it's switched to.
    let started = false;
    const start = () => { if (started) return; started = true; playScene(0); };
    const extBtn = $('.ps-btn[data-prev="ext"]');
    if (extBtn) extBtn.addEventListener('click', start);
    const pane = $('.preview-pane[data-pane="ext"]');
    if (pane && !pane.classList.contains('hidden')) start();
  })();

  // ---- Cloud checkout (pricing) ----
  const buy = $('#cloud-buy-btn');
  if (buy) buy.addEventListener('click', async (e) => {
    e.preventDefault();
    const orig = buy.textContent;
    buy.textContent = 'Starting checkout…';
    buy.style.pointerEvents = 'none';
    try {
      const res = await fetch(CLOUD_API + '/v1/billing/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      throw new Error(data.error || 'no checkout url');
    } catch (err) {
      buy.textContent = 'Checkout unavailable, try again';
      buy.style.pointerEvents = '';
      setTimeout(() => { buy.textContent = orig; }, 2600);
    }
  });
})();
