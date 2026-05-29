'use strict';

function ask(msg) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(msg, (res) => {
      if (chrome.runtime.lastError) { resolve(null); return; }
      resolve(res);
    });
  });
}

async function refresh() {
  const [allRules, status] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
  ]);

  const rules = allRules?.rules || [];
  const connected = status?.connected || false;
  const bypassScores = status?.bypassScores || {};
  const elementStats = status?.elementStats || {};

  // Connection indicator
  document.getElementById('status-dot').className = 'status-dot ' + (connected ? 'on' : 'off');
  document.getElementById('status-text').textContent = connected
    ? `Connected · daemon on :${status.daemonPort}`
    : 'Offline · using cached rules';

  // Bypass total
  const total = Object.values(bypassScores).reduce((a, b) => a + b, 0);
  document.getElementById('bypass-total').textContent = total;

  // Rule cards
  const list = document.getElementById('rules-list');
  if (rules.length === 0) {
    list.innerHTML = '<div class="placeholder">No rules found — open the daemon app to install them.</div>';
    return;
  }

  list.innerHTML = '';
  for (const rule of rules) {
    const bypasses = bypassScores[rule.id] || 0;
    const elems = elementStats[rule.id] || 0;

    const card = document.createElement('div');
    card.className = 'rule-card';
    card.innerHTML = `
      <div class="sev sev-${rule.severity || 'medium'}"></div>
      <div class="rule-info">
        <div class="rule-name">${escHtml(rule.displayName || rule.id)}</div>
        <div class="rule-meta">
          <span class="domain-pill">${escHtml(rule.domain)}</span>
          ${elems > 0 ? `<span class="stat-elem">${elems} hidden</span>` : ''}
          ${bypasses > 0 ? `<span class="stat-bypass">${bypasses} bypass${bypasses !== 1 ? 'es' : ''}</span>` : ''}
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" data-id="${escHtml(rule.id)}"${rule.enabled ? ' checked' : ''}>
        <span class="slider"></span>
      </label>
    `;

    card.querySelector('input').addEventListener('change', (e) => {
      ask({ type: 'toggle:rule', ruleId: rule.id, enabled: e.target.checked });
    });

    list.appendChild(card);
  }
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

document.getElementById('sync-btn').addEventListener('click', async () => {
  const btn = document.getElementById('sync-btn');
  btn.textContent = '↻ Syncing…';
  btn.disabled = true;
  await ask({ type: 'force:sync' });
  await refresh();
  btn.textContent = '↻ Sync';
  btn.disabled = false;
});

refresh().catch(console.error);
