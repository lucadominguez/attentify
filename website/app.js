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
          sc.querySelectorAll('.real-dirty').forEach(d => { d.style.clipPath = ''; });
          sc.querySelectorAll('.scene-block').forEach(b => b.classList.remove('on'));
        }
        return sc;
      }
      const setDots = i => dots.forEach((d, k) => d.classList.toggle('on', k === i));

      // ── scene runner: real before/after plate wipe ──
      function runReal(sc, cfg, next) {
        setChrome(cfg.chrome);
        const dirty = sc.querySelector('.real-dirty');
        say(cfg.intro || 'Reading page context…');
        after(500, scan);
        const reasons = cfg.reasons || [];
        after(2100, () => say('Found ' + reasons.length + ' distractions off your goal'));
        const rs = 2600, step = 2000;
        let lastP = 0;
        reasons.forEach((r, i) => {
          after(rs + i * step, () => {
            say('Removing: ' + r);
            if (badge) badge.textContent = String(i + 1);
          });
          after(rs + i * step + 900, () => {
            // wipe the cluttered plate down to just above the next removal
            const p = Math.round(((i + 1) / reasons.length) * 94);
            if (dirty) dirty.style.clipPath = 'inset(' + p + '% 0 0 0)';
            lastP = p;
          });
        });
        const done = rs + reasons.length * step + 900;
        after(done, () => {
          if (dirty) dirty.style.clipPath = 'inset(100% 0 0 0)';
          say(reasons.length + ' distractions removed · page cleaned', true);
        });
        after(done + 2600, next);
      }

      const SCENES = [
        { name: 'reddit', mode: 'real', intro: 'Reading reddit.com…',
          chrome: { host: 'reddit.com', path: '/r/technology', badge: 0, fav: '#ff4500' },
          reasons: ['Off-goal home feed', 'Short-form video rail', 'Promoted posts'] },
        { name: 'youtube', mode: 'real', intro: 'Reading youtube.com…',
          chrome: { host: 'youtube.com', path: '/results?q=funny+cats', badge: 0, fav: '#ff0033' },
          reasons: ['Shorts shelf', 'Recommended · off-goal', 'Fallback suggestions'] },
        { name: 'ytwatch', mode: 'real', intro: 'Reading the watch page…',
          chrome: { host: 'youtube.com', path: '/watch?v=…', badge: 0, fav: '#ff0033' },
          reasons: ['Up next queue', 'Recommendation rail', 'Autoplay driver'] },
      ];

      function playScene(i) {
        clearTimers();
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
/* ---- before/after comparison sliders ---- */
(function () {
  var stages = document.querySelectorAll('.ba-stage');
  if (!stages.length) return;

  function posFromEvent(e, stage) {
    var x;
    if (e.touches && e.touches[0]) x = e.touches[0].clientX;
    else if (e.changedTouches && e.changedTouches[0]) x = e.changedTouches[0].clientX;
    else x = e.clientX;
    var r = stage.getBoundingClientRect();
    var p = (x - r.left) / r.width;
    return Math.max(0.02, Math.min(0.98, p));
  }

  function setSplit(stage, p) {
    var wrap = stage.querySelector('.ba-dirty-wrap');
    var handle = stage.querySelector('.ba-handle');
    wrap.style.clipPath = 'inset(0 ' + ((1 - p) * 100) + '% 0 0)';
    handle.style.left = (p * 100) + '%';
  }

  stages.forEach(function (stage) {
    var dirty = stage.querySelector('.ba-dirty');
    dirty.style.clipPath = 'none';

    var call = stage.querySelector('.ba-callout');
    if (call) {
      var x = parseFloat(call.getAttribute('data-x')) || 0.5;
      var y = parseFloat(call.getAttribute('data-y')) || 0.3;
      call.style.left = (x * 100) + '%';
      call.style.top = (y * 100) + '%';
      setTimeout(function () { call.classList.add('pulse'); }, 900);
      setTimeout(function () { call.classList.remove('pulse'); }, 3400);
      call.addEventListener('animationend', function () { call.classList.remove('pulse'); });
    }

    setSplit(stage, 0.55);

    var dragging = false;

    function down(e) {
      dragging = true;
      if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      setSplit(stage, posFromEvent(e, stage));
      if (e.preventDefault) e.preventDefault();
    }
    function move(e) {
      if (!dragging) return;
      setSplit(stage, posFromEvent(e, stage));
      if (e.preventDefault) e.preventDefault();
    }
    function up() { dragging = false; }

    stage.addEventListener('mousedown', down);
    stage.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    stage.addEventListener('touchstart', down, { passive: false });
    stage.addEventListener('touchmove', move, { passive: false });
    stage.addEventListener('touchend', up);

    stage.addEventListener('keydown', function (e) {
      var p = parseFloat(stage.querySelector('.ba-handle').style.left) / 100 || 0.55;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { p -= 0.04; e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { p += 0.04; e.preventDefault(); }
      else return;
      setSplit(stage, Math.max(0.02, Math.min(0.98, p)));
    });
  });
})();
