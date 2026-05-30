'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ask(msg, ms = 5000) {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(null), ms);
    try {
      chrome.runtime.sendMessage(msg, res => {
        clearTimeout(t);
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { clearTimeout(t); resolve(null); }
  });
}

function askTab(tabId, msg, ms = 1500) {
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(null), ms);
    try {
      chrome.tabs.sendMessage(tabId, msg, res => {
        clearTimeout(t);
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { clearTimeout(t); resolve(null); }
  });
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ago(ts) {
  if (!ts) return 'never';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s <  3)  return 'just now';
  if (s < 60)  return `${s}s ago`;
  if (s < 3600) return `${Math.round(s/60)}m ago`;
  return `${Math.round(s/3600)}h ago`;
}

function shortAgo(ts) {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60)  return `${s}s`;
  if (s < 3600) return `${Math.round(s/60)}m`;
  return `${Math.round(s/3600)}h`;
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function progBar(pct, cls = '') {
  const f = document.getElementById('progress-fill');
  f.className = 'progress-fill' + (cls ? ' ' + cls : '');
  f.style.width = pct + '%';
}
function progSlide() {
  const f = document.getElementById('progress-fill');
  f.className = 'progress-fill indeterminate';
  f.style.width = '';
}
function progDone(ok) {
  progBar(100, ok ? 'ok' : 'fail');
  setTimeout(() => progBar(0), 1600);
}

// ── Diagnostics panel ─────────────────────────────────────────────────────────

function renderDiag(status, allRules, tabSt, tab) {
  const panel = document.getElementById('diag-panel');
  const rules  = allRules?.rules || [];
  const enabled = rules.filter(r => r.enabled);
  const rows = [];

  // 1. Service worker
  const uptime = status?.bootAt ? ago(status.bootAt) : 'unknown';
  rows.push({ ok: true,  label: `Service worker running`, sub: `started ${uptime}` });

  // 2. Rules loaded
  if (rules.length > 0) {
    rows.push({ ok: true, label: `<b>${rules.length}</b> rules loaded from storage`, sub: `${enabled.length} enabled` });
  } else {
    rows.push({ ok: false, warn: true, label: `No rules in storage — try reloading the extension`, sub: '' });
  }

  // 3. Enabled rules
  if (enabled.length === 0) {
    rows.push({ ok: false, warn: true, label: `No rules enabled — toggle some on below`, sub: 'CSS blocking is inactive until you enable at least one rule' });
  } else {
    const domains = [...new Set(enabled.map(r => r.domain))].join(', ');
    rows.push({ ok: true, label: `Blocking active on: <b>${esc(domains)}</b>`, sub: `${enabled.length} rule${enabled.length !== 1 ? 's' : ''} will hide elements on matching sites` });
  }

  // 4. Content script on current tab
  const tabUrl = tab?.url || '';
  const isChrome = tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://') || tabUrl.startsWith('about:') || tabUrl.startsWith('edge://');

  if (isChrome) {
    rows.push({ ok: null, label: `Current tab is a browser page`, sub: 'Content script cannot run on chrome:// pages — navigate to a real site' });
  } else if (!tab) {
    rows.push({ ok: false, warn: true, label: `No active tab detected`, sub: '' });
  } else if (!tabSt) {
    rows.push({ ok: false, warn: true, label: `Content script not running on this tab`, sub: 'Click "⚡ Test" below to inject it, or reload the tab' });
  } else {
    const n = tabSt.totalHidden || 0;
    rows.push({ ok: true, label: `Content script active on <b>${esc(tabSt.domain || '?')}</b>`, sub: n > 0 ? `Currently hiding ${n} element${n !== 1 ? 's' : ''}` : `No matching elements on this page right now` });
  }

  // 5. Daemon
  if (status?.connected) {
    rows.push({ ok: true, label: `Daemon connected on <b>:${status.daemonPort}</b>`, sub: `Last sync: ${ago(status.lastSyncAt)} · AI features active` });
  } else {
    rows.push({ ok: null, label: `Daemon not connected <span style="color:rgba(216,228,240,0.3)">(optional)</span>`, sub: status?.lastDaemonError || 'Extension works standalone — daemon adds AI features' });
  }

  const icons = { true: '✓', false: '✗', null: '·', warn: '!' };
  panel.innerHTML = rows.map(r => {
    const icon = r.ok === false && r.warn ? '!' : icons[String(r.ok)];
    const cls  = r.ok === true ? '' : r.warn ? 'diag-warn' : r.ok === false ? 'diag-err' : '';
    return `<div class="diag-row ${cls}">
      <span class="diag-icon">${icon}</span>
      <div class="diag-text">
        ${r.label}
        ${r.sub ? `<div class="diag-sub">${esc(r.sub)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── Tab detail panel ──────────────────────────────────────────────────────────

function renderTabPanel(status, allRules, tabSt, tab) {
  const section = document.getElementById('tab-section');
  const tabUrl  = tab?.url || '';
  if (!tab || tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) {
    section.style.display = 'none'; return;
  }
  section.style.display = 'block';

  let domain;
  try { domain = new URL(tabUrl).hostname.replace(/^www\./, ''); } catch (_) { domain = tab.title || '?'; }
  document.getElementById('tab-domain-label').textContent = domain;

  const detail = document.getElementById('tab-detail');
  const enabledRules = (allRules?.rules || []).filter(r => r.enabled);
  const matchingRules = enabledRules.filter(r => domain.endsWith(r.domain) || domain === r.domain);

  if (!tabSt) {
    const hasMatching = matchingRules.length > 0;
    detail.innerHTML = `
      <div class="reload-row">
        <span class="reload-hint">${hasMatching ? `${matchingRules.length} rule(s) apply here but content script not loaded` : 'Content script not loaded on this tab'}</span>
        <button class="inline-btn" id="reload-tab-btn">Reload tab</button>
      </div>`;
    document.getElementById('reload-tab-btn').onclick = async () => {
      if (tab?.id) { await chrome.tabs.reload(tab.id); setTimeout(refresh, 1200); }
    };
    return;
  }

  const counts = tabSt.elementCounts || {};
  const maxCount = Math.max(1, ...Object.values(counts));
  const activeRules = enabledRules.filter(r => matchingRules.includes(r));

  if (activeRules.length === 0) {
    detail.innerHTML = `<div class="tab-empty">No enabled rules match ${esc(domain)}</div>`;
    return;
  }

  detail.innerHTML = activeRules.map(r => {
    const n = counts[r.id] || 0;
    const w = n > 0 ? Math.max(6, Math.round((n / maxCount) * 100)) : 0;
    return `<div class="tab-rule-row">
      <span class="rule-name" style="font-size:11px;color:rgba(216,228,240,0.6)">${esc(r.displayName)}</span>
      <div class="tab-bar"><div class="tab-bar-fill" style="width:${w}%"></div></div>
      <span class="tab-rule-count ${n === 0 ? 'zero' : ''}">${n > 0 ? n : '—'}</span>
    </div>`;
  }).join('');
}

// ── Rules list ────────────────────────────────────────────────────────────────

function renderRules(allRules, status, tabSt) {
  const rules       = allRules?.rules || [];
  const bypassScores = status?.bypassScores || {};
  const list        = document.getElementById('rules-list');
  const summary     = document.getElementById('rules-summary');

  const enabled = rules.filter(r => r.enabled).length;
  summary.textContent = enabled > 0 ? `(${enabled}/${rules.length} on)` : `(all off)`;

  if (rules.length === 0) {
    list.innerHTML = '<div class="placeholder">No rules loaded. Try clicking ↻ Sync or reloading the extension.</div>';
    return;
  }

  const maxElems = Math.max(1, ...rules.map(r => tabSt?.elementCounts?.[r.id] || 0));
  list.innerHTML = '';

  for (const rule of rules) {
    const bypasses = bypassScores[rule.id] || 0;
    const tabElems = tabSt?.elementCounts?.[rule.id] ?? null;
    const isActive = tabSt?.activeRuleIds?.includes(rule.id) ?? false;

    let barClass = 'zero', barWidth = '100%', barLabel = 'off', barLabelCls = '';
    if (rule.enabled) {
      if (tabElems === null)  { barClass = 'active'; barWidth = '50%'; barLabel = 'enabled'; barLabelCls = 'active'; }
      else if (tabElems > 0) { barClass = 'blocked'; barWidth = Math.max(6, Math.round((tabElems/maxElems)*100))+'%'; barLabel = `${tabElems} hidden`; barLabelCls = 'blocked'; }
      else if (isActive)     { barClass = 'active'; barWidth = '10%'; barLabel = 'on page'; barLabelCls = 'active'; }
      else                   { barClass = 'zero'; barWidth = '100%'; barLabel = 'no match'; }
    }

    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = `
      <div class="rule-top">
        <div class="sev sev-${rule.severity||'medium'}"></div>
        <div class="rule-info">
          <div class="rule-name">${esc(rule.displayName || rule.id)}</div>
          <div class="rule-meta">
            <span class="domain-pill">${esc(rule.domain)}</span>
            ${rule.enabled && tabElems > 0  ? `<span class="stat-elem">▸ ${tabElems} hidden</span>` : ''}
            ${bypasses > 0                  ? `<span class="stat-bypass">${bypasses} bypass${bypasses!==1?'es':''}</span>` : ''}
            ${!rule.enabled                 ? `<span class="stat-none">off</span>` : ''}
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox"${rule.enabled?' checked':''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="rule-bar-wrap">
        <div class="rule-bar"><div class="rule-bar-fill ${barClass}" style="width:${barWidth}"></div></div>
        <span class="rule-bar-label ${barLabelCls}">${barLabel}</span>
      </div>`;

    card.querySelector('input').addEventListener('change', async e => {
      const en = e.target.checked;
      progSlide();
      const res = await ask({ type: 'toggle:rule', ruleId: rule.id, enabled: en });
      if (!res?.ok) { e.target.checked = !en; progBar(0); return; }
      progDone(true);
      setTimeout(refresh, 500);
    });
    list.appendChild(card);
  }
}

// ── Activity log ──────────────────────────────────────────────────────────────

const LOG_ICONS = { boot:'🔌', storage:'💾', tabs:'📋', inject:'⚙', daemon:'🔗', error:'✗', toggle:'⚡', hidden:'✓', bypass:'⚠', css:'🎨' };

function renderLog(log) {
  const panel = document.getElementById('log-panel');
  if (!log || log.length === 0) {
    panel.innerHTML = '<div class="log-empty">No activity yet</div>';
    return;
  }
  panel.innerHTML = log.map(e => {
    const icon = LOG_ICONS[e.type] || '·';
    const typeCls = ['error','hidden','toggle','daemon'].includes(e.type) ? 'type-'+e.type : '';
    return `<div class="log-entry ${typeCls}">
      <span class="log-ts">${shortAgo(e.ts)}</span>
      <span class="log-icon">${icon}</span>
      <div class="log-body">
        <div class="log-msg">${esc(e.msg)}</div>
        ${e.detail ? `<div class="log-sub">${esc(e.detail)}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ── Update banner ─────────────────────────────────────────────────────────────

async function checkUpdate(force = false) {
  const res = await ask({ type: 'get:update-info', force });
  const info = res?.info;
  const banner = document.getElementById('update-banner');
  if (info?.updateAvailable) {
    banner.innerHTML = `⬆ v${esc(info.latestVersion)} available &nbsp;<a href="${esc(info.downloadUrl)}" target="_blank" class="update-link">ZIP</a> · <a href="${esc(info.releasesUrl)}" target="_blank" class="update-link">Releases</a>`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

// ── Main refresh ──────────────────────────────────────────────────────────────

let currentTab = null;

async function refresh() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab || null;

  const [allRules, status, tabSt] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
    currentTab ? askTab(currentTab.id, { type: 'get:tab-status' }) : Promise.resolve(null),
  ]);

  const connected = status?.connected || false;

  // Version
  document.getElementById('version-label').textContent = `v${chrome.runtime.getManifest().version}`;

  // Progress + dot
  progDone(true);
  const dot = document.getElementById('status-dot');
  dot.className = 'status-dot ' + (connected ? 'on' : 'standalone');

  // Subtitle
  const rules = allRules?.rules || [];
  const enabledCount = rules.filter(r => r.enabled).length;
  const sub = document.getElementById('status-text');
  if (connected) {
    sub.textContent = `Standalone + daemon on :${status.daemonPort} · ${enabledCount} rules active`;
  } else {
    sub.textContent = `Standalone · ${enabledCount} rule${enabledCount!==1?'s':''} active · daemon optional`;
  }

  // Totals
  const bypassTotal  = Object.values(status?.bypassScores || {}).reduce((a,b)=>a+b,0);
  const elemTotal    = Object.values(status?.elementStats  || {}).reduce((a,b)=>a+b,0);
  document.getElementById('bypass-total').textContent  = bypassTotal;
  document.getElementById('elements-total').textContent = elemTotal;

  renderDiag(status, allRules, tabSt, currentTab);
  renderTabPanel(status, allRules, tabSt, currentTab);
  renderRules(allRules, status, tabSt);
  renderLog(status?.activityLog || []);
}

// ── Log toggle ────────────────────────────────────────────────────────────────

document.getElementById('log-toggle').addEventListener('click', () => {
  const panel = document.getElementById('log-panel');
  const arrow = document.getElementById('log-arrow');
  const open  = panel.style.display === 'none';
  panel.style.display = open ? 'block' : 'none';
  arrow.textContent   = open ? '▾' : '▸';
});

// ── Test button — force-injects content script into active tab ────────────────

document.getElementById('test-btn').addEventListener('click', async () => {
  const btn = document.getElementById('test-btn');
  btn.textContent = '…';
  btn.disabled = true;
  progSlide();

  const tab = currentTab;
  if (!tab?.id) {
    btn.textContent = 'No tab'; setTimeout(() => { btn.textContent = '⚡ Test'; btn.disabled = false; }, 1500);
    progBar(0); return;
  }

  const res = await ask({ type: 'test:inject', tabId: tab.id }, 6000);
  if (res?.ok) {
    btn.textContent = `✓ ${res.rulesDelivered} rules`;
    progDone(true);
  } else {
    btn.textContent = `✗ ${res?.error?.slice(0,18) || 'failed'}`;
    progDone(false);
  }
  setTimeout(() => { btn.textContent = '⚡ Test'; btn.disabled = false; }, 2000);
  setTimeout(refresh, 600);
});

// ── Sync button ───────────────────────────────────────────────────────────────

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻ Syncing…'; btn.disabled = true;
  progSlide();
  const res = await ask({ type: 'force:sync' }, 10000);
  progDone(res?.connected);
  btn.textContent = res?.connected ? '✓ Daemon' : '↻ Sync';
  setTimeout(() => { btn.textContent = '↻ Sync'; btn.disabled = false; }, 2000);
  await refresh();
});

// ── Update button ─────────────────────────────────────────────────────────────

document.getElementById('check-update-btn').addEventListener('click', async () => {
  const btn = document.getElementById('check-update-btn');
  btn.textContent = '…'; btn.disabled = true;
  await checkUpdate(true);
  btn.textContent = '↑ Update'; btn.disabled = false;
});

// ── Boot ──────────────────────────────────────────────────────────────────────

progSlide();
refresh().catch(console.error);
checkUpdate().catch(console.error);
