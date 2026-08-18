/* ============ Attentify site interactions ============ */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Cloud backend (Cloudflare Worker). Replace with your deployed URL.
  const CLOUD_API = 'https://api.attentify.ca';
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

  // ============ EXTENSION DEMO: live page-cleaning on REAL captures ============
    // A looping carousel of REAL page pairs (each captured twice from the same load:
    // once with the extension's stylesheet off, once with it on). For each scene the
    // cluttered "without" plate sits on top of the "with" plate and is progressively
    // wiped away top-down while the status pill narrates each removal -- the same
    // before/after evidence as the compare section, just animated over a scan line.
    // The real extension popup runs live in the iframe beside it (see pd-ext-shim.js).
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
          // Full reset, or the loop's second pass starts on an already-clean
          // page: the classes go, and so does the inline height strip() pinned.
          sc.querySelectorAll('.bait').forEach(b => {
            b.classList.remove('gone', 'targeting');
            b.style.height = '';
          });
          const stage = sc.querySelector('.html-stage');
          if (stage) { stage.classList.remove('cleaned'); stage.scrollTop = 0; }
        }
        return sc;
      }
      const setDots = i => dots.forEach((d, k) => d.classList.toggle('on', k === i));

      const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Collapse one bait element. A real blocker removes the node, so the rows
      // below travel up into the space; fading in place left a hole that read as
      // a broken page rather than a cleaned one. height:auto cannot be animated,
      // so the current height is pinned first and the class drives it to zero.
      function strip(el) {
        const h = el.getBoundingClientRect().height;
        el.style.height = h + 'px';
        void el.offsetHeight;            // flush, so the start height is the one we measured
        el.classList.add('gone');
      }

      // Keep the element about to be removed on screen. The stage scrolls, and a
      // strip the visitor cannot see is the same as no strip at all.
      function reveal(el, stage) {
        if (!stage || stage.scrollHeight <= stage.clientHeight) return;
        const top = el.offsetTop, h = el.offsetHeight;
        const want = Math.max(0, top - Math.max(0, (stage.clientHeight - h) / 2));
        if (Math.abs(want - stage.scrollTop) > 8) {
          if (stage.scrollTo) stage.scrollTo({ top: want, behavior: REDUCED ? 'auto' : 'smooth' });
          else stage.scrollTop = want;
        }
      }

      // ── scene runner: strip real bait elements from the live HTML page ──
      // Beat order per element: look at it, name it, take it. Removing without
      // the targeting beat reads as elements randomly vanishing; the outline is
      // what makes it read as something deciding.
      function runReal(sc, cfg, next) {
        const stage = sc.querySelector('.html-stage');
        setChrome(cfg.chrome);
        say(cfg.intro || 'Reading page context…');
        after(320, scan);

        const baits = Array.prototype.slice.call(sc.querySelectorAll('.bait'));
        const reasons = baits.map(b => b.getAttribute('data-reason') || 'distraction');
        const n = reasons.length;
        const noun = n === 1 ? 'distraction' : 'distractions';

        after(1900, () => say('Found ' + n + ' ' + noun + ' off your goal'));

        const rs = REDUCED ? 700 : 2500, step = REDUCED ? 420 : 1400, aim = REDUCED ? 0 : 560;
        baits.forEach((b, i) => {
          const at = rs + i * step;
          after(at, () => {
            reveal(b, stage);
            if (!REDUCED) b.classList.add('targeting');
            say('Removing: ' + reasons[i]);
            if (badge) badge.textContent = String(i + 1);
          });
          after(at + aim, () => {
            b.classList.remove('targeting');
            strip(b);
          });
        });

        const done = rs + n * step + (REDUCED ? 120 : 700);
        after(done, () => {
          if (stage) stage.classList.add('cleaned');
          say(n + ' ' + noun + ' removed · page cleaned', true);
        });
        after(done + (REDUCED ? 1200 : 2600), next);
      }

      const SCENES = [
        { name: 'reddit', intro: 'Reading reddit.com…',
          chrome: { host: 'reddit.com', path: '/r/technology', badge: 0, fav: '#ff4500' } },
        { name: 'youtube', intro: 'Reading youtube.com…',
          chrome: { host: 'youtube.com', path: '/results?search_query=funny+cats', badge: 0, fav: '#ff0033' } },
        { name: 'ytwatch', intro: 'Reading the watch page…',
          chrome: { host: 'youtube.com', path: '/watch?v=8Xr7pTNPrGk', badge: 0, fav: '#ff0033' } },
      ];

      let idx = 0;
      function playScene(i) {
        clearTimers();
        idx = i;
        setDots(i);
        const cfg = SCENES[i], sc = showScene(cfg.name);
        const next = () => playScene((i + 1) % SCENES.length);
        if (!sc) return next();
        runReal(sc, cfg, next);
      }

      // Autoplay when the extension pane is visible; (re)start when it's switched to.
      let started = false;
      const start = () => { if (started) return; started = true; playScene(0); };
      const extBtn = $('.ps-btn[data-prev="ext"]');
      if (extBtn) extBtn.addEventListener('click', start);

      // Let the scene tabs be used as tabs. They already read as controls, so
      // leaving them inert was the odd part.
      dots.forEach((d, k) => {
        d.setAttribute('role', 'button');
        d.setAttribute('tabindex', '0');
        const jump = () => { started = true; playScene(k); };
        d.addEventListener('click', jump);
        d.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
        });
      });

      // Only run while the demo is actually on screen. Off-screen the timers ran
      // on regardless, so scrolling back mid-scene showed a half-stripped page
      // with a status pill describing a different step.
      const win = $('.extwin');
      if (win && 'IntersectionObserver' in window) {
        let live = false;
        new IntersectionObserver(entries => {
          const vis = entries[0].isIntersecting;
          if (vis && !live) { live = true; started = true; playScene(idx); }
          else if (!vis && live) { live = false; clearTimers(); }
        }, { threshold: 0.12 }).observe(win);
      } else {
        const pane = $('.preview-pane[data-pane="ext"]');
        if (pane && !pane.classList.contains('hidden')) start();
      }
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

/* ── Email capture ────────────────────────────────────────────────────────────
   Deliberately not gated: no account, no sign-in, and nothing on this page is
   hidden behind it. It exists for the majority of launch traffic who will not
   install an unsigned 79 MB Windows binary today but would come back for the
   signed build or the Mac one.
   Submits to /v1/subscribe, which is idempotent per address, so a double click or
   an impatient second submit cannot create duplicates. */
(function () {
  var form = document.getElementById('notify-form');
  if (!form) return;
  var note = document.getElementById('notify-note');
  var btn = document.getElementById('notify-btn');
  var input = document.getElementById('notify-email');
  var base = window.PD_CLOUD_API || 'https://api.attentify.ca';
  var busy = false;

  function say(msg, kind) {
    note.textContent = msg;
    note.className = 'notify-note' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var email = (input.value || '').trim();
    // Let the browser's own validator speak first; it is clearer than anything here.
    if (!email || !input.checkValidity()) { say('Please enter a valid email address.', 'err'); input.focus(); return; }

    busy = true;
    btn.disabled = true;
    var was = btn.textContent;
    btn.textContent = 'Sending...';

    fetch(base + '/v1/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        company: form.company ? form.company.value : '',   // honeypot, empty for humans
        source: 'site-download',
        interest: 'launch'
      })
    })
      .then(function (r) { return r.json().catch(function () { return {}; }); })
      .then(function (d) {
        if (d && d.ok) {
          form.classList.add('is-done');
          say('Thanks. We will email you when there is news worth reading.', 'ok');
        } else {
          say((d && d.error) || 'That did not go through. Please try again.', 'err');
        }
      })
      .catch(function () { say('That did not go through. Please try again.', 'err'); })
      .finally(function () { busy = false; btn.disabled = false; btn.textContent = was; });
  });
})();
