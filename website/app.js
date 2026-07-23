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

  // ============ EXTENSION DEMO: live page-cleaning animation ============
  // The left "page" is a realistic feed. On a loop, Attentify reads it (scan line),
  // flags each distracting element with the reason, then removes it — while the status
  // pill narrates the reasoning. The real extension popup runs live in the iframe beside
  // it (see pd-ext-shim.js), so together this shows reasoning + removal, not a mockup.
  (function () {
    const page = $('#ext-page');
    if (!page) return;
    const status = $('#ext-status'), statusTx = $('#ext-status-tx');
    const blocks = () => Array.prototype.slice.call(page.querySelectorAll('.epost.block'));

    let timers = [];
    const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const say = (tx, done) => { if (statusTx) statusTx.textContent = tx; if (status) status.classList.toggle('done', !!done); };

    function reset() {
      blocks().forEach(b => b.classList.remove('flagged', 'removed'));
      page.classList.remove('scanning');
      say('Attentify is reading this page…', false);
    }

    function cycle() {
      clearTimers();
      reset();

      // 1) scan the page
      after(600, () => { page.classList.add('scanning'); say('Reading page context…'); });
      after(2200, () => { page.classList.remove('scanning'); });

      // 2) flag every distraction at once (found them)
      const bl = blocks();
      after(2300, () => { say('Found ' + bl.length + ' distractions off your goal'); });
      after(2900, () => bl.forEach((b, i) => after(i * 180, () => b.classList.add('flagged'))));

      // 3) remove them one by one, narrating the reason
      const removeStart = 4200, step = 1500;
      bl.forEach((b, i) => {
        after(removeStart + i * step, () => { say('Removing: ' + (b.dataset.reason || 'distraction')); });
        after(removeStart + i * step + 500, () => { b.classList.remove('flagged'); b.classList.add('removed'); });
      });

      // 4) done state, hold, then loop
      const doneAt = removeStart + bl.length * step + 400;
      after(doneAt, () => say(bl.length + ' distractions removed · page cleaned', true));
      after(doneAt + 4200, cycle);
    }

    // Autoplay when the extension pane is visible; (re)start when it's switched to.
    let started = false;
    const start = () => { if (started) return; started = true; cycle(); };
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
