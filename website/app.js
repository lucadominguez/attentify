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

  // ============ EXTENSION DEMO: live AI reasoning flowchart + circumvention blocking ============
  // The left "side panel" streams Attentify's reasoning as a downward flowchart while the main
  // stage shows it blocking a site, then inferring a circumvention attempt and auto-blocking the
  // alternatives. Pure presentation, looped.
  (function () {
    const flow = $('#demo-flow'), stage = $('#demo-stage');
    if (!flow || !stage) return;
    const host = $('#demo-host'), path = $('#demo-path'), badge = $('#demo-badge'),
          status = $('#demo-status'), tabTitle = $('#demo-tabtitle');

    const SHIELD = '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5l-8-3z"/></svg>';
    const IC = { nav: '→', think: '◆', match: '≈', infer: '!', block: '✕' };
    const KN = { nav: 'Navigation', think: 'Reasoning', match: 'Pattern match', infer: 'Inference', block: 'Action' };

    let timers = [];
    const after = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

    const setUrl = (h, p) => { host.textContent = h; path.textContent = p || ''; if (tabTitle) tabTitle.textContent = h; };

    function addNode(n) {
      if (flow.children.length) {
        const c = document.createElement('div'); c.className = 'fconn';
        flow.appendChild(c); requestAnimationFrame(() => c.classList.add('in'));
      }
      const el = document.createElement('div');
      el.className = 'fnode k-' + n.k;
      el.innerHTML = '<div class="fnode-ic">' + IC[n.k] + '</div><div class="fnode-tx">' +
        '<div class="fnode-k">' + KN[n.k] + '</div><div class="fnode-t">' + n.t + '</div>' +
        (n.s ? '<div class="fnode-s">' + n.s + '</div>' : '') + '</div>';
      flow.appendChild(el);
      requestAnimationFrame(() => el.classList.add('in'));
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function renderBlock(b) {
      stage.innerHTML = '<div class="block-card">' +
        '<div class="block-shield">' + SHIELD + '</div>' +
        '<div class="block-eyebrow">Blocked by Attentify</div>' +
        '<div class="block-host">' + b.host + '</div>' +
        '<div class="block-why">' + b.why + '</div>' +
        (b.tags ? '<div class="block-tags">' + b.tags.map(t => '<span class="block-tag">' + t + '</span>').join('') + '</div>' : '') +
        (b.similar ? '<div class="block-similar"><div class="block-similar-h"><b>' + b.similarHead + '</b></div><div class="bs-list"></div></div>' : '') +
        '</div>';
      const card = stage.querySelector('.block-card');
      requestAnimationFrame(() => card.classList.add('in'));
      if (b.similar) {
        const sim = stage.querySelector('.block-similar'), list = stage.querySelector('.bs-list');
        after(480, () => sim.classList.add('in'));
        b.similar.forEach((s, i) => after(640 + i * 240, () => {
          const r = document.createElement('div'); r.className = 'bs-row';
          r.innerHTML = '<span class="bs-x">×</span><code>' + s.u + '</code><span class="bs-rsn">' + s.r + '</span>';
          list.appendChild(r); requestAnimationFrame(() => r.classList.add('in'));
        }));
      }
    }

    function cycle() {
      clearTimers();
      flow.innerHTML = ''; stage.innerHTML = '';
      setUrl('reddit.com', '/r/all'); status.textContent = 'analyzing'; badge.textContent = '0';

      // PHASE 1 — block the distracting site
      after(350,  () => addNode({ k: 'nav',   t: 'You opened <b>reddit.com</b>', s: '/r/all · social feed' }));
      after(1350, () => addNode({ k: 'think', t: 'Check it against your goal', s: '“no social or short-form video”' }));
      after(2400, () => addNode({ k: 'think', t: 'Classified as a <b>social feed</b>', s: 'distraction score 0.94' }));
      after(3450, () => {
        addNode({ k: 'block', t: 'Block <b>reddit.com</b>' });
        badge.textContent = '1';
        renderBlock({ host: 'reddit.com',
          why: 'An infinite social feed, exactly the kind of place you said you wanted to stay out of.',
          tags: ['Social feed', 'Infinite scroll'] });
      });

      // PHASE 2 — first circumvention: an old-domain alias
      after(5400, () => { status.textContent = 'watching'; setUrl('old.reddit.com', '/r/all');
        addNode({ k: 'nav', t: 'You opened <b>old.reddit.com</b>', s: '14 seconds later' }); });
      after(6500, () => addNode({ k: 'match', t: 'Same site, different subdomain', s: 'matches reddit.com, blocked moments ago' }));
      after(7550, () => addNode({ k: 'infer', t: 'Looks like a way around the block', s: 'attempt #1' }));
      after(8600, () => {
        addNode({ k: 'block', t: 'Block <b>old.reddit.com</b>', s: 'extend pattern → *.reddit.com' });
        badge.textContent = '2';
        renderBlock({ host: 'old.reddit.com',
          why: 'The same destination through a different door. Attentify recognised the alias and <b>extended the block to every reddit.com subdomain</b>.',
          tags: ['Alias', '*.reddit.com'] });
      });

      // PHASE 3 — escalated circumvention: a mirror → auto-block the alternatives
      after(10600, () => { status.textContent = 'protecting'; setUrl('libreddit.com', '/r/all');
        addNode({ k: 'nav', t: 'You opened <b>libreddit.com</b>' }); });
      after(11700, () => addNode({ k: 'match', t: 'A known <b>Reddit mirror</b>', s: 'a proxy front-end for the same content' }));
      after(12750, () => addNode({ k: 'infer', t: 'Repeated attempts to get around me', s: 'attempt #3 · escalating' }));
      after(13800, () => {
        addNode({ k: 'block', t: 'Close the alternatives too', s: '5 known mirrors · matching tightened' });
        badge.textContent = '7';
        renderBlock({ host: 'libreddit.com',
          why: 'You keep reaching for the same thing through new doors, so Attentify closed the rest of them <b>before</b> you got there.',
          tags: ['Mirror', 'Circumvention inferred'],
          similarHead: 'Also blocked, same thing through a different door',
          similar: [
            { u: 'teddit.net',          r: 'reddit mirror' },
            { u: 'redlib.catsarch.com', r: 'reddit proxy' },
            { u: 'eddrit.com',          r: 'reddit mirror' },
            { u: 'i.reddit.com',        r: 'mobile alias' },
            { u: 'm.reddit.com',        r: 'mobile alias' },
          ] });
      });

      after(21500, cycle); // loop
    }

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
