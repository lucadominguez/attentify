'use strict';

// ── Utilities ─────────────────────────────────────────────────────────────────

function ask(msg, ms = 5000) {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(null), ms);
    try { chrome.runtime.sendMessage(msg, res => { clearTimeout(t); resolve(chrome.runtime.lastError ? null : res); }); }
    catch (_) { clearTimeout(t); resolve(null); }
  });
}
function askTab(id, msg, ms = 1500) {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(null), ms);
    try { chrome.tabs.sendMessage(id, msg, res => { clearTimeout(t); resolve(chrome.runtime.lastError ? null : res); }); }
    catch (_) { clearTimeout(t); resolve(null); }
  });
}
function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function ago(ts) { const s = Math.round((Date.now()-ts)/1000); if(s<3) return 'just now'; if(s<60) return `${s}s ago`; if(s<3600) return `${Math.round(s/60)}m ago`; return `${Math.round(s/3600)}h ago`; }
function sSago(ts) { const s=Math.round((Date.now()-ts)/1000); if(s<60) return `${s}s`; if(s<3600) return `${Math.round(s/60)}m`; return `${Math.round(s/3600)}h`; }

// ── Progress bar ──────────────────────────────────────────────────────────────

function prog(id, pct, cls='') { const f=document.getElementById(id); f.className='progress-fill'+(cls?' '+cls:''); f.style.width=pct+'%'; }
function progSlide(id='progress-fill') { const f=document.getElementById(id); f.className='progress-fill indeterminate'; f.style.width=''; }
function progDone(id='progress-fill', ok=true) { prog(id, 100, ok?'ok':'fail'); setTimeout(()=>prog(id,0), 1600); }

// ── State ─────────────────────────────────────────────────────────────────────

let currentTab = null;

// ═══════════════════════════════ MAIN VIEW ════════════════════════════════════

// ── Diagnostics ───────────────────────────────────────────────────────────────

function renderDiag(status, allRules, tabSt, tab) {
  const panel  = document.getElementById('diag-panel');
  const rules  = allRules?.rules || [];
  const enabled = rules.filter(r => r.enabled);
  const rows = [];

  rows.push({ ok: true, main: `Service worker running`, sub: status?.bootAt ? `started ${ago(status.bootAt)}` : '' });

  if (rules.length === 0) {
    rows.push({ ok: false, warn: true, main: `No rules loaded — try reloading the extension`, sub: '' });
  } else {
    rows.push({ ok: true, main: `<b>${rules.length}</b> rules loaded`, sub: `${enabled.length} enabled` });
  }

  if (enabled.length === 0) {
    rows.push({ ok: false, warn: true, main: `No rules enabled — toggle rules on below or use AI chat`, sub: 'CSS blocking is inactive' });
  } else {
    const doms = [...new Set(enabled.map(r=>r.domain))].join(', ');
    rows.push({ ok: true, main: `Blocking on: <b>${esc(doms)}</b>` });
  }

  const tabUrl = tab?.url || '';
  const isChromeTab = tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://') || tabUrl.startsWith('about:') || tabUrl.startsWith('edge://');
  if (isChromeTab) {
    rows.push({ ok: null, main: `Current tab is a browser page`, sub: 'Navigate to a real site to test blocking' });
  } else if (!tabSt) {
    rows.push({ ok: false, warn: true, main: `Blocking not applied on this tab yet`, sub: 'It applies automatically — switch tabs or give it a moment' });
  } else {
    const n = tabSt.totalHidden || 0;
    rows.push({ ok: true, main: `Content script active · <b>${esc(tabSt.domain||'?')}</b>`, sub: n > 0 ? `Hiding ${n} element${n!==1?'s':''} right now` : 'No matching elements on this page' });
  }

  if (status?.connected) {
    rows.push({ ok: true, main: `Daemon on <b>:${status.daemonPort}</b>`, sub: `Synced ${ago(status.lastSyncAt)} · AI tools active` });
  } else {
    rows.push({ ok: null, main: `Daemon not connected <span style="opacity:0.35">(optional)</span>`, sub: status?.lastDaemonError || 'Works standalone — daemon adds AI tools' });
  }

  const icons = { true: '✓', false: '✗', null: '·' };
  panel.innerHTML = rows.map(r => {
    const icon = r.ok === false && r.warn ? '!' : icons[String(r.ok)];
    const cls  = r.ok === true ? '' : r.warn ? 'warn' : r.ok === false ? 'err' : '';
    return `<div class="diag-row ${cls}">
      <span class="diag-icon">${icon}</span>
      <div class="diag-body">
        <div class="diag-main">${r.main}</div>
        ${r.sub ? `<div class="diag-sub">${esc(r.sub)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── Per-site hero ─────────────────────────────────────────────────────────────
// The headline a normal user wants: "is this site's junk being blocked?" — plus a
// one-tap master switch to pause/resume blocking on just this site.
function renderSiteHero(allRules, tabSt, tab, paused) {
  const hero    = document.getElementById('site-hero');
  const icon    = document.getElementById('site-hero-icon');
  const title   = document.getElementById('site-hero-title');
  const subEl   = document.getElementById('site-hero-sub');
  const tglWrap = document.getElementById('site-toggle-wrap');
  const tgl     = document.getElementById('site-toggle');
  hero.style.display = 'flex';

  const url = tab?.url || '';
  const isChrome = !url || url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://');
  if (isChrome) {
    hero.className = 'site-hero neutral';
    icon.textContent = '○';
    title.textContent = 'Open a website to manage blocking';
    subEl.textContent = 'This is a browser page — nothing to block here.';
    tglWrap.style.display = 'none';
    return;
  }

  let domain; try { domain = new URL(url).hostname.replace(/^www\./,''); } catch(_) { domain = '?'; }
  const enabled  = (allRules?.rules||[]).filter(r=>r.enabled);
  const matching = enabled.filter(r => domain === r.domain || domain.endsWith('.'+r.domain));
  const hidden   = tabSt?.totalHidden || 0;

  if (matching.length === 0) {
    hero.className = 'site-hero neutral';
    icon.textContent = '○';
    title.innerHTML = `No rules for <b>${esc(domain)}</b>`;
    subEl.textContent = 'Nothing blocked here. Tap ✦ to add a rule with AI.';
    tglWrap.style.display = 'none';
    return;
  }

  tglWrap.style.display = '';
  tgl.checked = !paused;           // checked = blocking ON

  if (paused) {
    hero.className = 'site-hero paused';
    icon.textContent = '⏸';
    title.innerHTML = `Blocking paused on <b>${esc(domain)}</b>`;
    subEl.textContent = 'Distractions are visible. Flip the switch to resume.';
  } else {
    hero.className = 'site-hero on';
    icon.textContent = '✓';
    title.innerHTML = `Blocking distractions on <b>${esc(domain)}</b>`;
    if (hidden > 0)   subEl.textContent = `Hiding ${hidden} element${hidden!==1?'s':''} right now.`;
    else if (tabSt)   subEl.textContent = `Active — ${matching.length} rule${matching.length!==1?'s':''} watching this site.`;
    else              subEl.textContent = 'Applies automatically as the page loads.';
  }
}

// ── Tab panel ─────────────────────────────────────────────────────────────────

function renderTabPanel(allRules, tabSt, tab) {
  const section = document.getElementById('tab-section');
  const tabUrl  = tab?.url || '';
  if (!tab || tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) { section.style.display = 'none'; return; }
  section.style.display = 'block';
  let domain; try { domain = new URL(tabUrl).hostname.replace(/^www\./,''); } catch(_) { domain = tab.title || '?'; }
  document.getElementById('tab-domain-label').textContent = domain;

  const detail = document.getElementById('tab-detail');
  const enabled = (allRules?.rules||[]).filter(r=>r.enabled);
  const matching = enabled.filter(r => domain === r.domain || domain.endsWith('.'+r.domain));

  if (!tabSt) {
    detail.innerHTML = `<div class="tab-warn-row"><span class="tab-warn-txt">${matching.length} rule${matching.length!==1?'s':''} apply here — activating…</span><button class="inline-btn" id="apply-tab-btn">Apply now</button></div>`;
    document.getElementById('apply-tab-btn').onclick = async () => { if(tab?.id){ await ask({ type:'test:inject', tabId: tab.id }, 6000); setTimeout(refresh, 600); } };
    return;
  }

  const counts  = tabSt.elementCounts || {};
  const maxN    = Math.max(1, ...Object.values(counts));

  if (matching.length === 0) { detail.innerHTML = `<div class="tab-empty">No enabled rules match ${esc(domain)}</div>`; return; }

  detail.innerHTML = matching.map(r => {
    const n = counts[r.id] || 0;
    const w = n > 0 ? Math.max(5, Math.round((n/maxN)*100)) : 0;
    return `<div class="tab-rule-row">
      <span class="tab-rule-lbl">${esc(r.displayName)}</span>
      <div class="tab-bar"><div class="tab-bar-fill" style="width:${w}%"></div></div>
      <span class="tab-count ${n===0?'z':''}">${n>0?n:'—'}</span>
    </div>`;
  }).join('');
}

// ── Rules list ────────────────────────────────────────────────────────────────

function renderRules(allRules, status, tabSt) {
  const rules       = allRules?.rules || [];
  const bypassScores = status?.bypassScores || {};
  const list        = document.getElementById('rules-list');
  document.getElementById('rules-summary').textContent = rules.length ? `(${rules.filter(r=>r.enabled).length}/${rules.length} on)` : '';

  if (rules.length === 0) { list.innerHTML = '<div class="placeholder">No rules — click ↻ Sync or reload extension.</div>'; return; }

  const maxElems = Math.max(1, ...rules.map(r => tabSt?.elementCounts?.[r.id]||0));
  list.innerHTML = '';

  for (const rule of rules) {
    const bypasses = bypassScores[rule.id] || 0;
    const tabElems = tabSt?.elementCounts?.[rule.id] ?? null;
    const isActive = tabSt?.activeRuleIds?.includes(rule.id) ?? false;

    let bCls='zero', bW='100%', bLbl='off', bLblCls='';
    if (rule.enabled) {
      if (tabElems===null)  { bCls='active'; bW='50%'; bLbl='enabled'; bLblCls='active'; }
      else if (tabElems>0)  { bCls='blocked'; bW=Math.max(6,Math.round((tabElems/maxElems)*100))+'%'; bLbl=`${tabElems} hidden`; bLblCls='blocked'; }
      else if (isActive)    { bCls='active'; bW='8%'; bLbl='no match'; bLblCls='active'; }
      else                  { bCls='zero'; bW='100%'; bLbl='no match'; }
    }

    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = `
      <div class="rule-top">
        <div class="sev sev-${rule.severity||'medium'}"></div>
        <div class="rule-info">
          <div class="rule-name">${esc(rule.displayName||rule.id)}</div>
          <div class="rule-meta">
            <span class="domain-pill">${esc(rule.domain)}</span>
            ${rule.enabled&&tabElems>0  ? `<span class="stat-elem">▸ ${tabElems}</span>` : ''}
            ${bypasses>0                ? `<span class="stat-bypass">${bypasses}✗</span>` : ''}
            ${!rule.enabled             ? `<span class="stat-none">off</span>` : ''}
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox"${rule.enabled?' checked':''}><span class="slider"></span>
        </label>
      </div>
      <div class="rule-bar-wrap">
        <div class="rule-bar"><div class="rule-bar-fill ${bCls}" style="width:${bW}"></div></div>
        <span class="rule-bar-lbl ${bLblCls}">${bLbl}</span>
      </div>`;

    card.querySelector('input').addEventListener('change', async e => {
      const en = e.target.checked;
      progSlide();
      const res = await ask({ type: 'toggle:rule', ruleId: rule.id, enabled: en });
      if (!res?.ok) { e.target.checked = !en; prog('progress-fill',0); return; }
      progDone('progress-fill', true);
      setTimeout(refresh, 500);
    });
    list.appendChild(card);
  }
}

// ── Distraction scanner UI ──────────────────────────────────────────────────────
let scanCandidates = [];
let autoHiddenItems = [];

function scanRowHtml(c, i, isAuto) {
  const badge = c.userWanted ? '<span class="scan-badge you">your topic</span>'
    : c.confidence === 'high' ? '<span class="scan-badge hi">likely</span>' : '';
  // Auto-hidden rows carry a subtle "the AI got this wrong" affordance: it restores
  // the element AND logs the full context so the model can be improved.
  const actions = isAuto
    ? `<div class="scan-actions">
         <button class="scan-hide-btn restore" data-idx="${i}" data-kind="auto">Restore</button>
         <button class="scan-wrong" data-idx="${i}" title="This isn't a distraction — flag the AI's mistake">not a distraction?</button>
       </div>`
    : `<button class="scan-hide-btn" data-idx="${i}" data-kind="cand">Hide</button>`;
  return `<div class="scan-row ${c.confidence} ${isAuto ? 'is-hidden' : ''}">
    <div class="scan-info">
      <div class="scan-name">${esc(c.label)} ${badge}</div>
      <div class="scan-sig">${esc((c.signals || []).join(' · '))}</div>
      <div class="scan-bar"><div class="scan-bar-fill" style="width:${Math.max(8, c.score)}%"></div></div>
    </div>${actions}</div>`;
}

// Shows the live context read: best-guess intent + a distraction meter the engine
// derived this navigation. Drives how aggressively the scanner auto-hides.
function renderContextBanner(a, prob) {
  const el = document.getElementById('context-banner');
  if (!el) return;
  if (!a) { el.style.display = 'none'; el.innerHTML = ''; return; }
  const pct = Math.round(((prob != null ? prob : a.distractionProbability) || 0) * 100);
  const lvl = pct >= 70 ? 'hi' : pct >= 40 ? 'mid' : 'lo';
  el.style.display = 'block';
  el.className = `context-banner ${lvl}`;
  el.innerHTML = `
    <div class="ctx-intent">🧭 ${esc(a.intent || '—')}</div>
    <div class="ctx-meter"><span>distraction</span><div class="ctx-bar"><div class="ctx-bar-fill" style="width:${pct}%"></div></div><b>${pct}%</b></div>
    ${a.reason ? `<div class="ctx-reason">${esc(a.reason)}${a.source === 'heuristic' ? ' · local estimate' : ''}</div>` : ''}`;
}

function renderScan(result) {
  const list = document.getElementById('scan-list');
  const summary = document.getElementById('scan-summary');
  if (typeof result?.autoBlock === 'boolean') document.getElementById('autoblock-toggle').checked = result.autoBlock;
  renderLearnedTopics(result?.userKeywords || []);
  renderContextBanner(result?.assessment || null, result?.distractionProb);
  autoHiddenItems = result?.autoHidden || [];
  scanCandidates = result?.candidates || [];

  if (!result) { summary.textContent = ''; list.innerHTML = '<div class="placeholder">Open a website, then tap ⟳ Scan.</div>'; return; }
  const total = autoHiddenItems.length + scanCandidates.length;
  summary.textContent = total ? `(${total})` : '';

  if (!total) { list.innerHTML = '<div class="scan-empty">✓ Nothing obviously distracting detected here.</div>'; return; }

  let html = '';
  if (autoHiddenItems.length) {
    html += `<div class="scan-grouplbl">Auto-hidden now (${autoHiddenItems.length})</div>`;
    autoHiddenItems.forEach((c, i) => { html += scanRowHtml(c, i, true); });
  }
  if (scanCandidates.length) {
    if (autoHiddenItems.length) html += `<div class="scan-grouplbl">Also detected</div>`;
    scanCandidates.forEach((c, i) => { html += scanRowHtml(c, i, false); });
  }
  list.innerHTML = html;
  list.querySelectorAll('.scan-hide-btn').forEach(btn => {
    const i = Number(btn.dataset.idx);
    btn.addEventListener('click', () => btn.dataset.kind === 'auto' ? restoreAutoHidden(i) : hideCandidate(i));
  });
  list.querySelectorAll('.scan-wrong').forEach(btn => {
    btn.addEventListener('click', () => reportMisprediction(Number(btn.dataset.idx), btn));
  });
}

// The user says this auto-hidden item wasn't actually a distraction. Restore it and
// log the full decision context so the model/heuristics can be improved later
// (queued locally now; forwarded by the backend once it exists).
async function reportMisprediction(i, btn) {
  const c = autoHiddenItems[i];
  if (!c || !currentTab) return;
  if (btn) { btn.disabled = true; btn.textContent = 'noting…'; }
  await askTab(currentTab.id, { type: 'unhide:adhoc', selectors: [c.selector] });
  const ctx = (await askTab(currentTab.id, { type: 'get:context' }, 2000)) || {};
  await ask({
    type: 'report:feedback',
    entry: {
      verdict: 'wrong-hide', selector: c.selector, label: c.label, score: c.score,
      signals: c.signals, confidence: c.confidence, userWanted: !!c.userWanted,
      url: ctx.url || currentTab.url || '', domain: ctx.domain || '',
      assessment: ctx.assessment || null, behavior: ctx.behavior || null,
      version: chrome.runtime.getManifest().version, userAgent: navigator.userAgent,
    },
  });
  if (btn) { btn.textContent = '✓ thanks — noted'; btn.classList.add('done'); }
  setTimeout(() => scanCurrentTab(true), 700);
}

// Shows the topics the assistant learned the user wants gone; click a chip to forget it.
function renderLearnedTopics(kws) {
  const el = document.getElementById('learned-topics');
  if (!el) return;
  if (!kws.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.innerHTML = `🧠 Auto-hiding topics you mentioned: ` +
    kws.map(k => `<span class="topic-chip" data-k="${esc(k)}">${esc(k)} ✕</span>`).join(' ');
  el.querySelectorAll('.topic-chip').forEach(ch => ch.addEventListener('click', () => removeTopic(ch.dataset.k)));
}

async function removeTopic(k) {
  const cur = (await ask({ type: 'get:auto-block' }))?.autoHideKeywords || [];
  await ask({ type: 'set:auto-hide-prefs', keywords: cur.filter(x => x !== k), replace: true });
  setTimeout(() => scanCurrentTab(true), 300);
}

// ── Block videos by title ───────────────────────────────────────────────────────
// A fast, precise alternative to topic auto-hiding: substring-match the video title.
function renderTitleBlocks(list) {
  const el = document.getElementById('title-blocks');
  if (!el) return;
  if (!list.length) { el.style.display = 'none'; el.innerHTML = ''; return; }
  el.style.display = 'block';
  el.innerHTML = `🛡️ Blocking video titles with: ` +
    list.map(k => `<span class="topic-chip tb" data-k="${esc(k)}">${esc(k)} ✕</span>`).join(' ');
  el.querySelectorAll('.topic-chip').forEach(ch => ch.addEventListener('click', () => removeTitleBlock(ch.dataset.k)));
}

async function refreshTitleBlocks() {
  const r = await ask({ type: 'get:title-blocks' });
  renderTitleBlocks(r?.titleBlocks || []);
}

async function removeTitleBlock(k) {
  const cur = (await ask({ type: 'get:title-blocks' }))?.titleBlocks || [];
  await ask({ type: 'set:title-blocks', keywords: cur.filter(x => x !== k), replace: true });
  refreshTitleBlocks();
}

async function addTitleBlock() {
  const inp = document.getElementById('title-block-input');
  const v = inp.value.trim().toLowerCase();
  if (v.length < 2) return;
  await ask({ type: 'set:title-blocks', keywords: [v] });
  inp.value = '';
  refreshTitleBlocks();
}

document.getElementById('title-block-add').addEventListener('click', addTitleBlock);
document.getElementById('title-block-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') { e.preventDefault(); addTitleBlock(); }
});

async function restoreAutoHidden(i) {
  const c = autoHiddenItems[i];
  if (!c || !currentTab) return;
  progSlide();
  await askTab(currentTab.id, { type: 'unhide:adhoc', selectors: [c.selector] });
  progDone('progress-fill', true);
  scanCurrentTab(true);
}

// Hide a detected element immediately (ad-hoc) AND persist it as a domain rule so it
// stays blocked on future visits.
async function hideCandidate(i) {
  const c = scanCandidates[i];
  if (!c || !currentTab) return;
  let domain; try { domain = new URL(currentTab.url || '').hostname.replace(/^www\./,''); } catch(_) { return; }
  const rule = normalizeRule({
    id: `auto-${domain}-${Date.now().toString(36)}`,
    domain, displayName: c.label || 'Distraction',
    selectors: [c.selector],
    severity: c.confidence === 'high' ? 'high' : 'medium',
  });
  if (!rule) return;
  progSlide();
  await askTab(currentTab.id, { type: 'hide:adhoc', selectors: [c.selector] });
  const res = await ask({ type: 'create:rule', rule });
  progDone('progress-fill', !!res?.ok);
  refresh().catch(() => {});
}

async function scanCurrentTab(forceScan = true) {
  if (!currentTab) { renderScan(null); return; }
  const res = await askTab(currentTab.id, { type: forceScan ? 'scan:page' : 'get:distractions' }, 4000);
  renderScan(res);
}

document.getElementById('scan-btn').addEventListener('click', async () => {
  const btn = document.getElementById('scan-btn');
  btn.textContent = '…'; btn.disabled = true; progSlide();
  await scanCurrentTab(true);
  progDone('progress-fill', true);
  btn.textContent = '⟳ Scan'; btn.disabled = false;
});

document.getElementById('autoblock-toggle').addEventListener('change', async e => {
  await ask({ type: 'set:auto-block', enabled: e.target.checked });
  setTimeout(() => scanCurrentTab(true), 450);
});

// ── Log ───────────────────────────────────────────────────────────────────────

const LOG_ICON = { boot:'🔌', storage:'💾', tabs:'📋', inject:'⚙', daemon:'🔗', error:'✗', toggle:'⚡', hidden:'✓', bypass:'⚠', css:'🎨' };

function renderLog(log) {
  const panel = document.getElementById('log-panel');
  if (!log?.length) { panel.innerHTML = '<div class="log-empty">No activity yet</div>'; return; }
  panel.innerHTML = log.map(e => `
    <div class="log-entry t-${e.type}">
      <span class="log-ts">${sSago(e.ts)}</span>
      <span class="log-icon">${LOG_ICON[e.type]||'·'}</span>
      <div class="log-body">
        <div class="log-msg">${esc(e.msg)}</div>
        ${e.detail ? `<div class="log-sub">${esc(e.detail)}</div>` : ''}
      </div>
    </div>`).join('');
}

// ── Update banner ─────────────────────────────────────────────────────────────

async function checkUpdate(force=false) {
  const res = await ask({ type: 'get:update-info', force });
  const info = res?.info;
  const b = document.getElementById('update-banner');
  if (info?.updateAvailable) {
    b.innerHTML = `⬆ v${esc(info.latestVersion)} &nbsp;<a href="${esc(info.downloadUrl)}" target="_blank" class="update-link">ZIP</a> · <a href="${esc(info.releasesUrl)}" target="_blank" class="update-link">Releases</a>`;
    b.style.display = 'flex';
  } else b.style.display = 'none';
}

// ── Main refresh ──────────────────────────────────────────────────────────────

async function refresh() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab || null;

  let curDomain = null;
  try { curDomain = new URL(currentTab?.url || '').hostname.replace(/^www\./,''); } catch(_) {}

  const [allRules, status, tabSt, siteState] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
    currentTab ? askTab(currentTab.id, { type: 'get:tab-status' }) : Promise.resolve(null),
    curDomain ? ask({ type: 'get:site-state', domain: curDomain }) : Promise.resolve(null),
  ]);

  const connected = status?.connected || false;
  document.getElementById('version-label').textContent = `v${chrome.runtime.getManifest().version}`;
  progDone('progress-fill', true);

  const dot = document.getElementById('status-dot');
  dot.className = 'status-dot ' + (connected ? 'on' : 'standalone');

  const rules = allRules?.rules || [];
  const enCnt = rules.filter(r=>r.enabled).length;
  const sub = document.getElementById('status-text');
  sub.textContent = connected
    ? `Standalone + daemon :${status.daemonPort} · ${enCnt} rules active`
    : `Standalone · ${enCnt} rule${enCnt!==1?'s':''} active · daemon optional`;

  const bypassTotal = Object.values(status?.bypassScores||{}).reduce((a,b)=>a+b,0);
  const elemTotal   = Object.values(status?.elementStats||{}).reduce((a,b)=>a+b,0);
  document.getElementById('bypass-total').textContent  = bypassTotal;
  document.getElementById('elements-total').textContent = elemTotal;

  renderSiteHero(allRules, tabSt, currentTab, siteState?.paused || false);
  renderDiag(status, allRules, tabSt, currentTab);
  renderTabPanel(allRules, tabSt, currentTab);
  renderRules(allRules, status, tabSt);
  renderLog(status?.activityLog || []);
  refreshTitleBlocks().catch(() => {});
  renderCloud().catch(() => {});
  scanCurrentTab(false).catch(() => {});   // show cached auto-scan results, no forced rescan
}

// ── Per-site pause toggle ───────────────────────────────────────────────────────

document.getElementById('site-toggle').addEventListener('change', async e => {
  const on = e.target.checked;        // checked = blocking ON = not paused
  let domain; try { domain = new URL(currentTab?.url || '').hostname.replace(/^www\./,''); } catch(_) { domain = null; }
  if (!domain) { e.target.checked = !on; return; }
  progSlide();
  const res = await ask({ type: 'set:site-pause', domain, paused: !on });
  if (!res?.ok) { e.target.checked = !on; prog('progress-fill', 0); return; }
  progDone('progress-fill', true);
  setTimeout(refresh, 400);
});

// ── Collapsible diagnostics + log ─────────────────────────────────────────────

function wireCollapse(toggleId, panelId, arrowId) {
  document.getElementById(toggleId).addEventListener('click', () => {
    const panel = document.getElementById(panelId);
    const open = panel.style.display === 'none';
    panel.style.display = open ? 'block' : 'none';
    document.getElementById(arrowId).textContent = open ? '▾' : '▸';
  });
}
wireCollapse('diag-toggle', 'diag-panel', 'diag-arrow');
wireCollapse('log-toggle',  'log-panel',  'log-arrow');

// ── First-run onboarding ──────────────────────────────────────────────────────

chrome.storage.local.get('onboardedAt').then(d => {
  if (!d.onboardedAt) document.getElementById('onboarding').style.display = 'flex';
});
document.getElementById('onboard-dismiss').addEventListener('click', () => {
  chrome.storage.local.set({ onboardedAt: Date.now() });
  document.getElementById('onboarding').style.display = 'none';
});

// ── Test button ───────────────────────────────────────────────────────────────

document.getElementById('test-btn').addEventListener('click', async () => {
  const btn = document.getElementById('test-btn');
  btn.textContent = '…'; btn.disabled = true; progSlide();
  const tab = currentTab;
  if (!tab?.id) { btn.textContent = 'No tab'; progDone('progress-fill', false); setTimeout(()=>{btn.textContent='⚡ Test';btn.disabled=false;},1500); return; }
  const res = await ask({ type: 'test:inject', tabId: tab.id }, 6000);
  if (res?.ok) { btn.textContent = `✓ ${res.rulesDelivered}`; progDone('progress-fill', true); }
  else         { btn.textContent = `✗ fail`; progDone('progress-fill', false); }
  setTimeout(() => { btn.textContent = '⚡ Test'; btn.disabled = false; }, 2000);
  setTimeout(refresh, 600);
});

// ── Sync button ───────────────────────────────────────────────────────────────

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻…'; btn.disabled = true; progSlide();
  const res = await ask({ type: 'force:sync' }, 10000);
  progDone('progress-fill', res?.connected);
  btn.textContent = res?.connected ? '✓' : '↻';
  setTimeout(() => { btn.textContent = '↻ Sync'; btn.disabled = false; }, 2000);
  await refresh();
});

document.getElementById('check-update-btn').addEventListener('click', async () => {
  const btn = document.getElementById('check-update-btn');
  btn.textContent = '…'; btn.disabled = true;
  await checkUpdate(true);
  btn.textContent = '↑'; btn.disabled = false;
});

// ── Modify Rules button ───────────────────────────────────────────────────────

document.getElementById('modify-rules-btn').addEventListener('click', async () => {
  const res = await ask({ type: 'daemon:open-rules' });
  if (res?.ok) {
    // Daemon window brought to front — close popup
    window.close();
  } else {
    // Daemon not available — open AI chat
    showChat();
  }
});

// ═══════════════════════════════ CHAT VIEW ════════════════════════════════════

let chatHistory = [];  // {role, content}
let chatPort = null;
let apiKey = null;
let chatConnected = false;  // daemon connected
let freeAI = false;         // bundled free-AI credit available (no own key needed)

function showChat() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('chat-view').style.display  = 'flex';
  initChat();
}

function hideChat() {
  document.getElementById('chat-view').style.display  = 'none';
  document.getElementById('main-view').style.display = 'flex';
  if (chatPort) { try { chatPort.disconnect(); } catch(_){} chatPort = null; }
}

document.getElementById('chat-back-btn').addEventListener('click', hideChat);
document.getElementById('chat-btn').addEventListener('click', showChat);

async function initChat() {
  // Load API key from storage (the user's own, if they added one)
  const res = await ask({ type: 'get:api-key' });
  apiKey = res?.key || null;

  // Check daemon status
  const status = await ask({ type: 'get:status' });
  chatConnected = status?.connected || false;

  // The extension ships with a bundled key and free AI credit, so chat works out of
  // the box with no key from the user. Reflect that instead of asking for a key.
  const cloud = await ask({ type: 'get:cloud' });
  const u = cloud?.usage;
  const subscribed = !!u?.subscribed;
  freeAI = !apiKey && !subscribed && !!u && !u.exhausted;

  const modeLabel = document.getElementById('chat-mode-label');
  const chatDot   = document.getElementById('chat-status-dot');

  if (chatConnected)      { modeLabel.textContent = '· via daemon';          chatDot.className = 'status-dot on'; }
  else if (apiKey)        { modeLabel.textContent = '· your OpenRouter key'; chatDot.className = 'status-dot standalone'; }
  else if (subscribed)    { modeLabel.textContent = '· Cloud';               chatDot.className = 'status-dot on'; }
  else if (freeAI)        { modeLabel.textContent = '· free AI included';    chatDot.className = 'status-dot standalone'; }
  else                    { modeLabel.textContent = '· free credit used up'; chatDot.className = 'status-dot off'; }

  renderKeyUI();

  if (chatHistory.length === 0) {
    addSysMsg('Hi! I can block specific things on a page. Try: "Block YouTube Shorts", "Hide rage-bait comments" or "No music videos".');
  }
}

// ── API key UI ──────────────────────────────────────────────────────────────────
// Reflects the saved-key state. When a key is stored, the panel collapses and a
// 🔑 button appears so the user can confirm/replace it; the key persists in the
// background via storage.sync + local mirror, so it survives restarts/reinstalls.
function renderKeyUI(editing = false) {
  const panel     = document.getElementById('api-key-panel');
  const hint      = document.getElementById('api-key-hint');
  const row       = document.getElementById('api-key-row');
  const savedMsg  = document.getElementById('api-key-saved');
  const err       = document.getElementById('api-key-err');
  const input     = document.getElementById('api-key-input');
  const changeBtn = document.getElementById('api-key-change-btn');

  if (chatConnected) {                       // daemon proxies chat — no user key needed
    panel.style.display = 'none';
    changeBtn.style.display = 'none';
  } else if ((apiKey || freeAI) && !editing) { // usable already (own key or included free AI) — offer to add/change a key
    panel.style.display = 'none';
    changeBtn.style.display = '';
  } else {                             // entering a new key or editing the saved one
    panel.style.display = 'block';
    hint.style.display = 'block';
    row.style.display = 'flex';
    err.style.display = 'none';
    savedMsg.style.display = apiKey ? 'block' : 'none';
    input.value = apiKey || '';
    changeBtn.style.display = apiKey ? '' : 'none';
  }
}

document.getElementById('api-key-save-btn').addEventListener('click', async () => {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key.startsWith('sk-or-')) {
    document.getElementById('api-key-err').textContent = 'OpenRouter keys start with sk-or- — get one at openrouter.ai/keys';
    document.getElementById('api-key-err').style.display = 'block';
    return;
  }
  await ask({ type: 'set:api-key', key });
  apiKey = key;
  document.getElementById('api-key-err').style.display = 'none';
  initChat();
});

// Reveal the input (pre-filled) to replace an already-saved key.
document.getElementById('api-key-change-btn').addEventListener('click', () => {
  renderKeyUI(true);
  document.getElementById('api-key-input').focus();
});

// Forget the saved key on request.
document.getElementById('api-key-remove').addEventListener('click', async (e) => {
  e.preventDefault();
  await ask({ type: 'clear:api-key' });
  apiKey = null;
  document.getElementById('api-key-input').value = '';
  initChat();
});

// ── Message rendering ─────────────────────────────────────────────────────────

function addSysMsg(text) {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = 'msg sys';
  d.innerHTML = `<div class="bubble">${esc(text)}</div>`;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

function addUserMsg(text) {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = 'msg user';
  d.innerHTML = `<div class="bubble">${esc(text)}</div>`;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
}

function addTypingIndicator() {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = 'msg ai'; d.id = 'typing-indicator';
  d.innerHTML = `<div class="bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
  msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

// Coerce an AI-proposed rule into the shape the rest of the extension expects.
// Returns null if it can't actually block anything (no domain or no selectors).
function normalizeRule(r) {
  if (!r || typeof r !== 'object') return null;
  const selectors = Array.isArray(r.selectors) ? r.selectors.filter(s => typeof s === 'string' && s.trim()) : [];
  const domain = String(r.domain || '').trim().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');
  if (!domain || selectors.length === 0) return null;
  return {
    id: String(r.id || `custom-${domain.replace(/[^a-z0-9]+/gi, '-')}-${Date.now().toString(36)}`),
    displayName: String(r.displayName || r.id || `Custom rule on ${domain}`),
    domain, selectors, enabled: true,
    severity: r.severity || 'medium',
    urlPatterns: Array.isArray(r.urlPatterns) ? r.urlPatterns : [],
    antiBypassSearchTerms: Array.isArray(r.antiBypassSearchTerms) ? r.antiBypassSearchTerms : [],
  };
}

function addAiMsg(text) {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = 'msg ai';

  // Parse <rule>…</rule> (element block) and <pref>…</pref> (topic preference) blocks.
  const parts = text.split(/(<rule>[\s\S]*?<\/rule>|<pref>[\s\S]*?<\/pref>|<titleblock>[\s\S]*?<\/titleblock>)/g);
  let html = '';
  const pendingRules = [];

  for (const part of parts) {
    if (part.startsWith('<rule>')) {
      try {
        const json = part.replace(/<\/?rule>/g, '').trim();
        const rule = JSON.parse(json);
        const idx = pendingRules.push(rule) - 1;   // reference by index — no fragile HTML round-trip
        html += `</div><button class="add-rule-btn" data-rule-idx="${idx}">➕ Add rule: ${esc(rule.displayName || rule.id)}</button><div class="bubble" style="margin-top:5px">`;
      } catch(_) { html += esc(part); }
    } else if (part.startsWith('<pref>')) {
      try {
        const pref = JSON.parse(part.replace(/<\/?pref>/g, '').trim());
        const kws = (pref.keywords || []).map(k => String(k).toLowerCase().trim()).filter(Boolean);
        if (kws.length) {
          ask({ type: 'set:auto-hide-prefs', keywords: kws });   // learn it (auto-applies across sites)
          html += `</div><div class="pref-learned">🧠 Got it — I'll auto-hide content about <b>${esc(kws.join(', '))}</b> across sites.</div><div class="bubble" style="margin-top:5px">`;
        }
      } catch(_) { html += esc(part); }
    } else if (part.startsWith('<titleblock>')) {
      try {
        const tb = JSON.parse(part.replace(/<\/?titleblock>/g, '').trim());
        const kws = (tb.keywords || []).map(k => String(k).toLowerCase().trim()).filter(k => k.length >= 2);
        if (kws.length) {
          ask({ type: 'set:title-blocks', keywords: kws });
          refreshTitleBlocks?.();
          html += `</div><div class="pref-learned tb">🛡️ I'll block videos whose title contains <b>${esc(kws.join(', '))}</b> — in your feed and the moment they open.</div><div class="bubble" style="margin-top:5px">`;
        }
      } catch(_) { html += esc(part); }
    } else {
      html += formatInline(esc(part));
    }
  }

  d.innerHTML = `<div class="bubble">${html}</div>`;

  // Wire up "Add Rule" buttons — pull the rule straight from the in-memory array so
  // selectors/quotes/apostrophes can't get mangled by HTML-attribute encoding.
  d.querySelectorAll('.add-rule-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const rule = pendingRules[Number(btn.dataset.ruleIdx)];
      if (!rule) { addSysMsg('Sorry — that rule was malformed. Ask me to try again.'); return; }
      const payload = normalizeRule(rule);
      if (!payload) { addSysMsg('That rule is missing a domain or selectors, so it can’t block anything. Ask me to be more specific.'); return; }
      const orig = btn.textContent;
      btn.disabled = true; btn.textContent = '⏳ Adding…';
      const res = await ask({ type: 'create:rule', rule: payload });
      if (res?.ok) {
        btn.textContent = `✓ Added: ${payload.displayName}`;
        btn.classList.add('added');
        addSysMsg(`Rule "${payload.displayName}" added and active. You’ll see it in the rules list.`);
        refresh().catch(() => {});   // reflect it in the main view immediately
      } else {
        btn.disabled = false; btn.textContent = orig;
        addSysMsg('Could not add that rule — please try again.');
      }
    });
  });

  msgs.appendChild(d);
  msgs.scrollTop = msgs.scrollHeight;
  return d;
}

function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

// ── Streaming chat send ───────────────────────────────────────────────────────

document.getElementById('chat-send-btn').addEventListener('click', sendChat);
document.getElementById('chat-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
});

async function sendChat() {
  const input = document.getElementById('chat-input');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  addUserMsg(text);
  chatHistory.push({ role: 'user', content: text });

  const sendBtn = document.getElementById('chat-send-btn');
  sendBtn.disabled = true;
  progSlide('chat-progress-fill');

  const typing = addTypingIndicator();

  // Only block when there's genuinely no way to run AI: no daemon, no own key, no
  // Cloud subscription and the free credit is spent. Otherwise the bundled free AI runs.
  if (!chatConnected && !apiKey && !freeAI) {
    removeTypingIndicator();
    addSysMsg("Your free AI credit is used up. Add your own OpenRouter key above, or subscribe to Cloud below to keep going.");
    progDone('chat-progress-fill', false);
    sendBtn.disabled = false;
    return;
  }

  // Open streaming port
  if (chatPort) { try { chatPort.disconnect(); } catch(_){} }
  chatPort = chrome.runtime.connect({ name: 'pd-chat' });

  let fullText = '';
  let msgEl = null;

  chatPort.onMessage.addListener(msg => {
    if (msg.type === 'chunk') {
      removeTypingIndicator();
      if (!msgEl) { msgEl = document.createElement('div'); msgEl.className = 'msg ai'; document.getElementById('chat-messages').appendChild(msgEl); }
      fullText += msg.text;
      msgEl.innerHTML = `<div class="bubble">${formatInline(esc(fullText))}</div>`;
      document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
    }
    if (msg.type === 'done') {
      removeTypingIndicator();
      if (msgEl) msgEl.remove(); // re-render with rule buttons
      if (fullText) {
        addAiMsg(fullText);
        chatHistory.push({ role: 'assistant', content: fullText });
      }
      progDone('chat-progress-fill', true);
      sendBtn.disabled = false;
      chatPort = null;
    }
    if (msg.type === 'error') {
      removeTypingIndicator();
      if (msg.message === 'paywall') {
        addSysMsg("You've used up your $1 of free AI. Subscribe to Cloud for $5/mo (no key needed) — or add your own OpenRouter key above. Open the Cloud panel below to upgrade.");
        document.getElementById('cloud-box')?.scrollIntoView({ behavior: 'smooth' });
        renderCloud().catch(() => {});
      } else if (msg.message === 'no_key') {
        addSysMsg('No OpenRouter key set — enter one above. Get it free at openrouter.ai/keys');
        renderKeyUI(true);
      } else if (msg.message === 'daemon_fail') {
        // Retry with direct API
        chatPort.postMessage({ type: 'chat:start', text, history: chatHistory.slice(-10), apiKey, useOrProxy: true });
        return;
      } else {
        addSysMsg(`Error: ${msg.message}`);
      }
      progDone('chat-progress-fill', false);
      sendBtn.disabled = false;
      chatPort = null;
    }
  });

  chatPort.postMessage({ type: 'chat:start', text, history: chatHistory.slice(-10), apiKey });
}

// ═══════════════════════════════ CONTEXT FLOW VIEW ════════════════════════════
// A chronological flowchart of every navigation the context engine assessed:
// intent + how distracted you looked, oldest → newest, connected by arrows.

let flowVisible = false;

function showFlow() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('flow-view').style.display = 'flex';
  flowVisible = true;
  renderFlow();
}
function hideFlow() {
  document.getElementById('flow-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'flex';
  flowVisible = false;
}

function flowTime(ts) {
  const d = new Date(ts);
  return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${ago(ts)}`;
}

async function renderFlow({ scrollEnd = true, quiet = false } = {}) {
  if (!quiet) progSlide('flow-progress-fill');
  const res = await ask({ type: 'get:context-log' });
  if (!quiet) progDone('flow-progress-fill', true);
  const log = res?.contextLog || [];
  const list = document.getElementById('flow-list');
  const fv = document.getElementById('flow-view');

  // Preserve the reading position on a live update: only follow to the bottom if the
  // user is already there (or we're opening the view); otherwise keep them put.
  const prevTop = fv.scrollTop;
  const nearBottom = fv.scrollHeight - fv.scrollTop - fv.clientHeight < 60;

  if (!log.length) {
    list.innerHTML = '<div class="flow-empty">No context tracked yet.<br>Browse a few sites and your attention flow will appear here.</div>';
    return;
  }

  // stored newest-first; show oldest → newest so it reads as a downward flow
  const items = log.slice(0, 40).reverse();
  list.innerHTML = items.map((e, i) => {
    const pct = Math.round((e.distractionProbability || 0) * 100);
    const lvl = pct >= 70 ? 'hi' : pct >= 40 ? 'mid' : 'lo';
    const arrow = i > 0 ? '<div class="flow-arrow">↓</div>' : '';
    const chip = e.navType === 'spa' ? '<span class="flow-chip">in-app nav</span>' : '';
    return arrow + `<div class="flow-node ${lvl}">
      <div class="flow-dot"></div>
      <div class="flow-body">
        <div class="flow-time">${esc(flowTime(e.ts))} ${chip}</div>
        <div class="flow-domain">${esc(e.domain || '?')}</div>
        <div class="flow-intent">${esc(e.intent || '')}</div>
        <div class="flow-meter"><div class="flow-bar"><div class="flow-bar-fill" style="width:${pct}%"></div></div><b>${pct}%</b></div>
        ${e.reason ? `<div class="flow-reason">${esc(e.reason)}${e.source === 'heuristic' ? ' · local estimate' : ''}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  // jump to the latest step on open / when already following; otherwise stay put
  fv.scrollTop = (scrollEnd || nearBottom) ? fv.scrollHeight : prevTop;
}

document.getElementById('flow-btn').addEventListener('click', showFlow);
document.getElementById('flow-back-btn').addEventListener('click', hideFlow);
document.getElementById('flow-refresh-btn').addEventListener('click', () => renderFlow());

// Live-update the flow as new navigations are logged. The background persists
// contextLog to storage on every context read, so we just react to that.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.contextLog && flowVisible) renderFlow({ scrollEnd: false, quiet: true });
});

// ═══════════════════════════════ REPORT VIEW ══════════════════════════════════
// File a bug straight to GitHub Issues via a stored personal-access token. The body
// is auto-padded with diagnostic context so reports are actionable.

function showReport() {
  document.getElementById('main-view').style.display = 'none';
  document.getElementById('report-view').style.display = 'flex';
  initReport();
}
function hideReport() {
  document.getElementById('report-view').style.display = 'none';
  document.getElementById('main-view').style.display = 'flex';
}

async function initReport() {
  const r = await ask({ type: 'get:github-token' });
  const has = !!r?.hasToken;
  document.getElementById('gh-token-panel').style.display = has ? 'none' : 'block';
  document.getElementById('gh-token-saved').style.display = has ? 'flex' : 'none';
  const st = document.getElementById('report-status');
  st.textContent = ''; st.className = 'report-status';
}

async function buildReportBody(desc) {
  const [status, ctxState] = await Promise.all([
    ask({ type: 'get:status' }),
    ask({ type: 'get:context-state' }),
  ]);
  const tabCtx = currentTab?.id ? await askTab(currentTab.id, { type: 'get:context' }, 2000) : null;
  const ver = chrome.runtime.getManifest().version;
  const lines = [
    desc, '', '---', '**Auto-collected context**',
    `- Extension: v${ver}`,
    `- URL: ${tabCtx?.url || currentTab?.url || 'n/a'}`,
    `- Domain: ${tabCtx?.domain || 'n/a'}`,
    `- Mode: ${status?.connected ? 'daemon :' + status.daemonPort : 'standalone'}`,
    `- Enabled rules: ${status?.enabledRules ?? '?'}/${status?.rules ?? '?'}`,
    `- Last context read: ${ctxState?.assessment ? '`' + JSON.stringify(ctxState.assessment) + '`' : 'none'}`,
  ];
  if (tabCtx?.autoHidden?.length) lines.push(`- Auto-hidden here: ${tabCtx.autoHidden.map(a => a.label).join(', ')}`);
  if (status?.activityLog?.length) {
    lines.push('', '**Recent activity**');
    for (const e of status.activityLog.slice(0, 8)) lines.push(`- ${e.type}: ${e.msg}${e.detail ? ' — ' + e.detail : ''}`);
  }
  lines.push('', `_UA: ${navigator.userAgent}_`);
  return lines.join('\n');
}

async function submitReport() {
  const desc = document.getElementById('report-desc').value.trim();
  const st = document.getElementById('report-status');
  if (!desc) { st.textContent = 'Describe the problem first.'; st.className = 'report-status err'; return; }
  const btn = document.getElementById('report-submit');
  btn.disabled = true; btn.textContent = 'Filing…'; progSlide('report-progress-fill');
  const body = await buildReportBody(desc);
  const title = desc.split('\n')[0].slice(0, 80);
  const res = await ask({ type: 'report:bug', report: { title, body } }, 20000);
  progDone('report-progress-fill', !!res?.ok);
  btn.disabled = false; btn.textContent = 'Submit bug report';
  if (res?.ok) {
    st.innerHTML = `✓ Filed <a href="${esc(res.url)}" target="_blank">#${res.number}</a> — thank you!`;
    st.className = 'report-status ok';
    document.getElementById('report-desc').value = '';
  } else if (res?.error === 'no_token') {
    st.textContent = 'Add a GitHub token below to file the issue (it was saved locally).';
    st.className = 'report-status err';
    document.getElementById('gh-token-panel').style.display = 'block';
  } else {
    st.textContent = `Couldn’t file it: ${res?.error || 'unknown error'} — saved locally.`;
    st.className = 'report-status err';
  }
}

document.getElementById('report-btn').addEventListener('click', showReport);
document.getElementById('report-back-btn').addEventListener('click', hideReport);
document.getElementById('report-submit').addEventListener('click', submitReport);

document.getElementById('gh-token-save').addEventListener('click', async () => {
  const t = document.getElementById('gh-token-input').value.trim();
  const err = document.getElementById('gh-token-err');
  if (!/^gh[ps]_|^github_pat_/.test(t)) {
    err.textContent = 'GitHub tokens start with ghp_, ghs_, or github_pat_. Create one at github.com/settings/tokens (scope: public_repo).';
    err.style.display = 'block'; return;
  }
  err.style.display = 'none';
  await ask({ type: 'set:github-token', token: t });
  document.getElementById('gh-token-input').value = '';
  initReport();
});

document.getElementById('gh-token-remove').addEventListener('click', async (e) => {
  e.preventDefault();
  await ask({ type: 'clear:github-token' });
  initReport();
});

// ═══════════════════════════════ CLOUD ACCOUNT ════════════════════════════════
// Paste a license key to unlock the managed AI (no OpenRouter key needed), managed
// auto-site-blocking and analytics. Upgrade/manage go through Stripe.

async function renderCloud() {
  const box = document.getElementById('cloud-box');
  const badge = document.getElementById('cloud-badge');
  if (!box) return;
  const res = await ask({ type: 'get:cloud' });
  const st = res?.cloudStatus;
  const active = st && st.tier === 'cloud' && st.status === 'active';

  if (active) {
    badge.textContent = 'ACTIVE';
    badge.className = 'cloud-badge on';
    const used = st.aiUsed ?? 0, quota = st.aiQuota ?? 0;
    box.innerHTML = `
      <div class="cloud-row"><span class="cloud-ok">✓ Cloud active</span>
        <span class="cloud-sub">${esc(st.email || '')}</span></div>
      <div class="cloud-meter"><span>managed AI</span>
        <div class="cloud-bar"><div class="cloud-bar-fill" style="width:${quota ? Math.min(100, Math.round(used / quota * 100)) : 0}%"></div></div>
        <b>${Math.max(0, quota - used)} left</b></div>
      <div class="cloud-btns">
        <button class="pill-btn" id="cloud-manage">Manage billing</button>
        <button class="pill-btn" id="cloud-signout">Sign out</button>
      </div>`;
    document.getElementById('cloud-manage').onclick = async () => {
      const r = await ask({ type: 'cloud:portal' }, 15000);
      if (r?.url) chrome.tabs.create({ url: r.url });
    };
    document.getElementById('cloud-signout').onclick = async () => { await ask({ type: 'clear:cloud-key' }); renderCloud(); };
    return;
  }

  badge.textContent = res?.hasKey ? 'CHECK KEY' : 'FREE';
  badge.className = 'cloud-badge';
  const invalid = res?.hasKey && st && st.status !== 'active';
  // Free-AI meter: how much of the included $1 allowance is left (unless the user
  // brought their own key, in which case there's nothing to meter).
  const u = res?.usage;
  let meterHtml = '';
  if (u && !u.hasOwnKey) {
    const pct = Math.min(100, Math.round((u.usedUsd / (u.limitUsd || 1)) * 100));
    meterHtml = `<div class="cloud-meter"><span>${u.exhausted ? 'free AI used up' : 'free AI'}</span>
      <div class="cloud-bar"><div class="cloud-bar-fill" style="width:${pct}%;${u.exhausted ? 'background:#ff5252' : ''}"></div></div>
      <b>$${u.usedUsd.toFixed(2)}/$${u.limitUsd.toFixed(2)}</b></div>`;
  }
  box.innerHTML = `
    ${meterHtml}
    <p class="cloud-pitch">${u && u.exhausted ? 'Your free AI is used up. ' : ''}Unlock <b>unlimited managed AI</b> (no API key needed), <b>automatic site blocking</b> and <b>analytics</b> for <b>$5/mo</b>.</p>
    ${invalid ? `<p class="cloud-err">That license key isn't active. Re-enter it or upgrade below.</p>` : ''}
    <div class="cloud-btns">
      <button class="pill-btn accent" id="cloud-upgrade">Upgrade to Cloud</button>
      <button class="pill-btn" id="cloud-have">I have a key</button>
    </div>
    <div id="cloud-key-row" class="cloud-key-row" style="display:${invalid ? 'flex' : 'none'}">
      <input id="cloud-key-input" class="cloud-key-input" placeholder="pd_live_…" type="password">
      <button class="pill-btn accent" id="cloud-key-save">Save</button>
    </div>`;
  document.getElementById('cloud-upgrade').onclick = async () => {
    const r = await ask({ type: 'cloud:checkout' }, 15000);
    if (r?.url) chrome.tabs.create({ url: r.url });
    else addToast?.('Could not start checkout — try the website.');
  };
  document.getElementById('cloud-have').onclick = () => {
    const row = document.getElementById('cloud-key-row');
    row.style.display = row.style.display === 'none' ? 'flex' : 'none';
    document.getElementById('cloud-key-input').focus();
  };
  document.getElementById('cloud-key-save').onclick = saveCloudKey;
  document.getElementById('cloud-key-input').addEventListener('keydown', e => { if (e.key === 'Enter') saveCloudKey(); });
}

async function saveCloudKey() {
  const inp = document.getElementById('cloud-key-input');
  const key = inp.value.trim();
  if (!key.startsWith('pd_')) { inp.style.borderColor = '#ff6666'; return; }
  const save = document.getElementById('cloud-key-save');
  save.textContent = '…'; save.disabled = true;
  await ask({ type: 'set:cloud-key', key });
  renderCloud();
  refresh().catch(() => {});
}

// ── Boot ──────────────────────────────────────────────────────────────────────

progSlide();
refresh().catch(console.error);
checkUpdate().catch(console.error);

// In the Side Panel (which stays open while you switch tabs) keep the current-tab
// view in sync as you move around. Harmless for a one-shot popup.
chrome.tabs.onActivated.addListener(() => refresh().catch(() => {}));
chrome.windows?.onFocusChanged?.addListener(() => refresh().catch(() => {}));
