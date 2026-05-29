'use strict';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ask(msg) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage(msg, res => {
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { resolve(null); }
  });
}

function askTab(tabId, msg) {
  return new Promise(resolve => {
    try {
      chrome.tabs.sendMessage(tabId, msg, res => {
        resolve(chrome.runtime.lastError ? null : res);
      });
    } catch (_) { resolve(null); }
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

const fill = () => document.getElementById('progress-fill');

function progressIndeterminate() {
  const f = fill();
  f.className = 'progress-fill indeterminate';
  f.style.width = '';
}

function progressSet(pct, state = '') {
  const f = fill();
  f.className = 'progress-fill' + (state ? ' ' + state : '');
  f.style.width = pct + '%';
}

function progressDone(ok) {
  progressSet(100, ok ? 'success' : 'error');
  setTimeout(() => progressSet(0), 1800);
}

// ── Current tab query ─────────────────────────────────────────────────────────

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

// ── Render tab status bar ─────────────────────────────────────────────────────

function renderTabStatus(tab, tabSt) {
  const section = document.getElementById('tab-status');
  const domainEl = document.getElementById('tab-domain');
  const countEl  = document.getElementById('tab-hidden-count');
  const warnEl   = document.getElementById('tab-warn');

  if (!tab || tab.url?.startsWith('chrome://')) { section.style.display = 'none'; return; }

  section.style.display = 'block';
  const domain = (tab.url ? new URL(tab.url).hostname.replace(/^www\./, '') : tab.title || '?');
  domainEl.textContent = domain;

  if (!tabSt) {
    // Content script not running
    countEl.textContent = 'script not loaded';
    countEl.className = 'tab-hidden-count zero';
    warnEl.style.display = 'block';
  } else {
    warnEl.style.display = 'none';
    const n = tabSt.totalHidden || 0;
    countEl.textContent = n > 0 ? `${n} element${n !== 1 ? 's' : ''} hidden` : 'nothing hidden here';
    countEl.className = 'tab-hidden-count' + (n === 0 ? ' zero' : '');
  }
}

// ── Render rules list ─────────────────────────────────────────────────────────

function renderRules(rules, bypassScores, tabSt) {
  const list = document.getElementById('rules-list');
  if (!rules || rules.length === 0) {
    list.innerHTML = '<div class="placeholder">No rules found — open the daemon app to install them, or wait for sync.</div>';
    return;
  }

  // Max element count across enabled rules for proportional bars
  const maxElems = Math.max(1, ...rules.map(r => (tabSt?.elementCounts?.[r.id] || 0)));

  list.innerHTML = '';
  for (const rule of rules) {
    const bypasses   = bypassScores[rule.id] || 0;
    const tabElems   = tabSt?.elementCounts?.[rule.id] ?? null; // null = no tab data
    const isActive   = tabSt?.activeRuleIds?.includes(rule.id) ?? false;

    const card = document.createElement('div');
    card.className = 'rule-card';

    // Bar state
    let barClass = 'zero', barWidth = '100%', barLabel = 'off', barLabelClass = '';
    if (rule.enabled) {
      if (tabElems === null) {
        // No tab data — show indeterminate "active" state
        barClass = 'active'; barWidth = '60%'; barLabel = 'enabled'; barLabelClass = 'active';
      } else if (tabElems > 0) {
        barClass = 'blocked';
        barWidth = Math.round((tabElems / maxElems) * 100) + '%';
        barLabel = `${tabElems} hidden`;
        barLabelClass = 'blocked';
      } else if (isActive) {
        barClass = 'active'; barWidth = '15%'; barLabel = 'on this page'; barLabelClass = 'active';
      } else {
        barClass = 'zero'; barWidth = '100%'; barLabel = 'no match'; barLabelClass = '';
      }
    }

    card.innerHTML = `
      <div class="rule-top">
        <div class="sev sev-${rule.severity || 'medium'}"></div>
        <div class="rule-info">
          <div class="rule-name">${esc(rule.displayName || rule.id)}</div>
          <div class="rule-meta">
            <span class="domain-pill">${esc(rule.domain)}</span>
            ${rule.enabled && tabElems > 0  ? `<span class="stat-elem">▸ ${tabElems} hidden</span>` : ''}
            ${bypasses > 0                  ? `<span class="stat-bypass">${bypasses} bypass${bypasses !== 1 ? 'es' : ''}</span>` : ''}
            ${!rule.enabled                 ? `<span class="stat-none">disabled</span>` : ''}
          </div>
        </div>
        <label class="toggle">
          <input type="checkbox" data-id="${esc(rule.id)}"${rule.enabled ? ' checked' : ''}>
          <span class="slider"></span>
        </label>
      </div>
      <div class="rule-bar-wrap">
        <div class="rule-bar">
          <div class="rule-bar-fill ${barClass}" style="width:${barWidth}"></div>
        </div>
        <span class="rule-bar-label ${barLabelClass}">${barLabel}</span>
      </div>
    `;

    card.querySelector('input').addEventListener('change', async e => {
      const enabled = e.target.checked;
      const res = await ask({ type: 'toggle:rule', ruleId: rule.id, enabled });
      if (!res?.ok) { e.target.checked = !enabled; return; }
      // Re-render after a short delay so tabs get the script injected
      setTimeout(() => refresh(), 600);
    });

    list.appendChild(card);
  }
}

// ── Main refresh ──────────────────────────────────────────────────────────────

async function refresh() {
  progressIndeterminate();
  document.getElementById('status-dot').className = 'status-dot checking';
  document.getElementById('status-text').textContent = 'Connecting…';

  const tab = await getActiveTab();

  const [allRules, status, tabSt] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
    getTabStatus(tab),
  ]);

  const rules        = allRules?.rules || [];
  const connected    = status?.connected || false;
  const lastError    = status?.lastError || '';
  const lastSyncAt   = status?.lastSyncAt || 0;
  const syncStep     = status?.syncStep || '';
  const bypassScores = status?.bypassScores || {};

  // ── Progress bar final state ──────────────────────────────────────────────
  progressDone(connected);

  // ── Connection dot + subtitle ─────────────────────────────────────────────
  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');
  dot.className = 'status-dot ' + (connected ? 'on' : 'off');

  if (connected) {
    txt.textContent = `Connected · :${status.daemonPort} · ${status.enabledRules} rules active · synced ${timeAgo(lastSyncAt)}`;
  } else if (syncStep) {
    txt.textContent = syncStep;
  } else if (lastError) {
    txt.textContent = lastError;
  } else {
    txt.textContent = 'Daemon offline · cached rules · open the daemon app to connect';
  }

  // ── Bypass total ──────────────────────────────────────────────────────────
  const total = Object.values(bypassScores).reduce((a, b) => a + b, 0);
  document.getElementById('bypass-total').textContent = total;

  // ── Tab status ────────────────────────────────────────────────────────────
  renderTabStatus(tab, tabSt);

  // ── Reload tab button ─────────────────────────────────────────────────────
  document.getElementById('reload-tab-btn').onclick = async () => {
    if (tab?.id) { await chrome.tabs.reload(tab.id); setTimeout(() => refresh(), 1200); }
  };

  // ── Rules ─────────────────────────────────────────────────────────────────
  renderRules(rules, bypassScores, tabSt);
}

// ── Update check ──────────────────────────────────────────────────────────────

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

// ── Buttons ───────────────────────────────────────────────────────────────────

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻ Syncing…';
  btn.disabled = true;
  progressIndeterminate();

  const result = await ask({ type: 'force:sync' });
  progressDone(result?.connected);

  btn.textContent = result?.connected ? '✓ Synced' : '✗ Retry';
  setTimeout(() => { btn.textContent = '↻ Sync'; btn.disabled = false; }, 1500);
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
