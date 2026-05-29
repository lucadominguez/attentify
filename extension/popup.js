'use strict';

function ask(msg) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(msg, (res) => {
        if (chrome.runtime.lastError) { resolve(null); return; }
        resolve(res);
      });
    } catch (_) { resolve(null); }
  });
}

function timeAgo(ts) {
  if (!ts) return 'never';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 5)  return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function checkUpdate(force = false) {
  const res = await ask({ type: 'get:update-info', force });
  const info = res?.info;
  const banner = document.getElementById('update-banner');
  if (info?.updateAvailable) {
    banner.innerHTML =
      `⬆ Update available: v${escHtml(info.latestVersion)} &nbsp;` +
      `<a href="${escHtml(info.downloadUrl)}" target="_blank" class="update-link">Download ZIP</a>` +
      ` &nbsp;<a href="${escHtml(info.releasesUrl)}" target="_blank" class="update-link">Releases</a>`;
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
  }
}

async function refresh() {
  // Show "checking" state immediately so the popup doesn't look frozen
  document.getElementById('status-dot').className = 'status-dot checking';
  document.getElementById('status-text').textContent = 'Checking…';

  const [allRules, status] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
  ]);

  const rules         = allRules?.rules || [];
  const connected     = status?.connected || false;
  const lastError     = status?.lastError || '';
  const lastSyncAt    = status?.lastSyncAt || 0;
  const bypassScores  = status?.bypassScores || {};
  const elementStats  = status?.elementStats || {};

  // ── Connection indicator ──────────────────────────────────────────────────

  const dot = document.getElementById('status-dot');
  const txt = document.getElementById('status-text');

  if (connected) {
    dot.className = 'status-dot on';
    txt.textContent = `Connected · daemon on :${status.daemonPort} · synced ${timeAgo(lastSyncAt)}`;
  } else {
    dot.className = 'status-dot off';
    if (lastError) {
      txt.textContent = lastError;
    } else {
      txt.textContent = 'Daemon offline · cached rules active · open the daemon app to connect';
    }
  }

  // ── Bypass total ──────────────────────────────────────────────────────────

  const total = Object.values(bypassScores).reduce((a, b) => a + b, 0);
  document.getElementById('bypass-total').textContent = total;

  // ── Rule cards ───────────────────────────────────────────────────────────

  const list = document.getElementById('rules-list');

  if (!rules || rules.length === 0) {
    list.innerHTML = '<div class="placeholder">' +
      (connected
        ? 'No rules yet — the daemon app will push rules here.'
        : 'No cached rules. Open the daemon app first.') +
      '</div>';
    return;
  }

  list.innerHTML = '';
  for (const rule of rules) {
    const bypasses = bypassScores[rule.id] || 0;
    const elems    = elementStats[rule.id] || 0;

    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = `
      <div class="sev sev-${rule.severity || 'medium'}"></div>
      <div class="rule-info">
        <div class="rule-name">${escHtml(rule.displayName || rule.id)}</div>
        <div class="rule-meta">
          <span class="domain-pill">${escHtml(rule.domain)}</span>
          ${elems    > 0 ? `<span class="stat-elem">${elems} hidden</span>` : ''}
          ${bypasses > 0 ? `<span class="stat-bypass">${bypasses} bypass${bypasses !== 1 ? 'es' : ''}</span>` : ''}
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" data-id="${escHtml(rule.id)}"${rule.enabled ? ' checked' : ''}>
        <span class="slider"></span>
      </label>
    `;

    card.querySelector('input').addEventListener('change', async (e) => {
      const ok = await ask({ type: 'toggle:rule', ruleId: rule.id, enabled: e.target.checked });
      if (!ok) e.target.checked = !e.target.checked; // revert if failed
    });

    list.appendChild(card);
  }
}

// ── Sync button ───────────────────────────────────────────────────────────────

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻ Syncing…';
  btn.disabled = true;

  const result = await ask({ type: 'force:sync' });

  if (result?.connected) {
    btn.textContent = '✓ Synced';
    setTimeout(() => { btn.textContent = '↻ Sync'; btn.disabled = false; }, 1500);
  } else {
    btn.textContent = '✗ Failed';
    setTimeout(() => { btn.textContent = '↻ Retry'; btn.disabled = false; }, 1500);
  }

  await refresh();
  btn.disabled = false;
});

// ── Check for update button ───────────────────────────────────────────────────

document.getElementById('check-update-btn').addEventListener('click', async () => {
  const btn = document.getElementById('check-update-btn');
  btn.textContent = 'Checking…';
  btn.disabled = true;
  await checkUpdate(true);
  btn.textContent = 'Check update';
  btn.disabled = false;
});

// ── Load ──────────────────────────────────────────────────────────────────────

refresh().catch(console.error);
checkUpdate().catch(console.error);
