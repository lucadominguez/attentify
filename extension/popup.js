'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ask(msg, timeoutMs = 5000) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      chrome.runtime.sendMessage(msg, res => {
        clearTimeout(timer);
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { clearTimeout(timer); resolve(null); }
  });
}

function askTab(tabId, msg, timeoutMs = 1500) {
  return new Promise(resolve => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    try {
      chrome.tabs.sendMessage(tabId, msg, res => {
        clearTimeout(timer);
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { clearTimeout(timer); resolve(null); }
  });
}

function timeAgo(ts) {
  if (!ts) return 'never';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s <  5)  return 'just now';
  if (s < 60)  return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function progressSet(pct, state = '') {
  const f = document.getElementById('progress-fill');
  f.className = 'progress-fill' + (state ? ' ' + state : '');
  f.style.width = pct + '%';
}

function progressIndeterminate() {
  const f = document.getElementById('progress-fill');
  f.className = 'progress-fill indeterminate';
  f.style.width = '';
}

function progressDone(ok) {
  progressSet(100, ok ? 'success' : 'error');
  setTimeout(() => progressSet(0), 1800);
}

// ── Active tab ────────────────────────────────────────────────────────────────

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function getTabStatus(tab) {
  if (!tab?.id) return null;
  const url = tab.url || '';
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') || url.startsWith('about:') || url.startsWith('edge://')) return null;
  return await askTab(tab.id, { type: 'get:tab-status' });
}

// ── Render tab panel ──────────────────────────────────────────────────────────

function renderTabPanel(tab, tabSt) {
  const section = document.getElementById('tab-status');
  if (!tab || (tab.url || '').startsWith('chrome://')) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  let domain;
  try { domain = new URL(tab.url).hostname.replace(/^www\./, ''); }
  catch (_) { domain = tab.title || '?'; }

  document.getElementById('tab-domain').textContent = domain;
  const warnEl  = document.getElementById('tab-warn');
  const countEl = document.getElementById('tab-hidden-count');

  if (!tabSt) {
    countEl.textContent = 'not active on this tab';
    countEl.className = 'tab-hidden-count zero';
    warnEl.style.display = 'block';
  } else {
    warnEl.style.display = 'none';
    const n = tabSt.totalHidden || 0;
    countEl.textContent = n > 0 ? `${n} element${n !== 1 ? 's' : ''} hidden` : 'nothing to hide here';
    countEl.className = 'tab-hidden-count' + (n === 0 ? ' zero' : '');
  }
}

// ── Render rules ──────────────────────────────────────────────────────────────

function renderRules(rules, bypassScores, tabSt) {
  const list = document.getElementById('rules-list');
  if (!rules || rules.length === 0) {
    list.innerHTML = '<div class="placeholder">No rules — click ↻ Sync or toggle rules on below.</div>';
    return;
  }

  const maxElems = Math.max(1, ...rules.map(r => tabSt?.elementCounts?.[r.id] || 0));
  list.innerHTML = '';

  for (const rule of rules) {
    const bypasses = bypassScores[rule.id] || 0;
    const tabElems = tabSt?.elementCounts?.[rule.id] ?? null;
    const isActive = tabSt?.activeRuleIds?.includes(rule.id) ?? false;

    let barClass = 'zero', barWidth = '100%', barLabel = 'off', barLabelClass = '';
    if (rule.enabled) {
      if (tabElems === null) {
        barClass = 'active'; barWidth = '55%'; barLabel = 'enabled'; barLabelClass = 'active';
      } else if (tabElems > 0) {
        barClass = 'blocked';
        barWidth = Math.max(8, Math.round((tabElems / maxElems) * 100)) + '%';
        barLabel = `${tabElems} hidden`; barLabelClass = 'blocked';
      } else if (isActive) {
        barClass = 'active'; barWidth = '12%'; barLabel = 'on this page'; barLabelClass = 'active';
      } else {
        barClass = 'zero'; barWidth = '100%'; barLabel = 'no match'; barLabelClass = '';
      }
    }

    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = `
      <div class="rule-top">
        <div class="sev sev-${rule.severity || 'medium'}"></div>
        <div class="rule-info">
          <div class="rule-name">${esc(rule.displayName || rule.id)}</div>
          <div class="rule-meta">
            <span class="domain-pill">${esc(rule.domain)}</span>
            ${rule.enabled && tabElems > 0  ? `<span class="stat-elem">▸ ${tabElems} hidden</span>` : ''}
            ${bypasses > 0                  ? `<span class="stat-bypass">${bypasses} bypass${bypasses !== 1 ? 'es' : ''}</span>` : ''}
            ${!rule.enabled                 ? `<span class="stat-none">off</span>` : ''}
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox"${rule.enabled ? ' checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="rule-bar-wrap">
        <div class="rule-bar"><div class="rule-bar-fill ${barClass}" style="width:${barWidth}"></div></div>
        <span class="rule-bar-label ${barLabelClass}">${barLabel}</span>
      </div>
    `;

    card.querySelector('input').addEventListener('change', async e => {
      const enabled = e.target.checked;
      progressIndeterminate();
      const res = await ask({ type: 'toggle:rule', ruleId: rule.id, enabled });
      if (!res?.ok) { e.target.checked = !enabled; progressSet(0); return; }
      progressDone(true);
      setTimeout(() => refresh(), 500);
    });

    list.appendChild(card);
  }
}

// ── Update banner ─────────────────────────────────────────────────────────────

async function checkUpdate(force = false) {
  const res = await ask({ type: 'get:update-info', force });
  const info = res?.info;
  const banner = document.getElementById('update-banner');
  if (info?.updateAvailable) {
    banner.innerHTML =
      `⬆ v${esc(info.latestVersion)} available &nbsp;` +
      `<a href="${esc(info.downloadUrl)}" target="_blank" class="update-link">Download ZIP</a>` +
      ` · <a href="${esc(info.releasesUrl)}" target="_blank" class="update-link">Releases</a>`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

// ── Main refresh — responds immediately, no waiting for daemon ────────────────

async function refresh() {
  const tab = await getActiveTab();

  const [allRules, status, tabSt] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
    getTabStatus(tab),
  ]);

  const rules        = allRules?.rules || [];
  const connected    = status?.connected || false;
  const lastSyncAt   = status?.lastSyncAt || 0;
  const bypassScores = status?.bypassScores || {};

  // ── Progress + connection dot ─────────────────────────────────────────────
  progressDone(true); // local data loaded = success regardless of daemon

  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');

  if (connected) {
    dot.className = 'status-dot on';
    txt.textContent = `Standalone + daemon on :${status.daemonPort} · synced ${timeAgo(lastSyncAt)}`;
  } else {
    dot.className = 'status-dot standalone';
    txt.textContent = `Standalone · ${rules.filter(r => r.enabled).length} rules active · daemon optional`;
  }

  // ── Bypass count ──────────────────────────────────────────────────────────
  const total = Object.values(bypassScores).reduce((a, b) => a + b, 0);
  document.getElementById('bypass-total').textContent = total;

  // ── Tab panel ─────────────────────────────────────────────────────────────
  renderTabPanel(tab, tabSt);

  document.getElementById('reload-tab-btn').onclick = async () => {
    if (tab?.id) { await chrome.tabs.reload(tab.id); setTimeout(() => refresh(), 1200); }
  };

  // ── Rules ─────────────────────────────────────────────────────────────────
  renderRules(rules, bypassScores, tabSt);
}

// ── Buttons ───────────────────────────────────────────────────────────────────

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻ Syncing…';
  btn.disabled = true;
  progressIndeterminate();
  const result = await ask({ type: 'force:sync' }, 8000);
  progressDone(result?.connected);
  btn.textContent = result?.connected ? '✓ Daemon found' : '↻ Sync';
  btn.disabled = false;
  setTimeout(() => { btn.textContent = '↻ Sync'; }, 2000);
  await refresh();
});

document.getElementById('check-update-btn').addEventListener('click', async () => {
  const btn = document.getElementById('check-update-btn');
  btn.textContent = 'Checking…';
  btn.disabled = true;
  await checkUpdate(true);
  btn.textContent = 'Check update';
  btn.disabled = false;
});

// ── Boot ──────────────────────────────────────────────────────────────────────

refresh().catch(console.error);
checkUpdate().catch(console.error);
