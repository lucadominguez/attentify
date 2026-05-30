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
    rows.push({ ok: false, warn: true, main: `Content script not running on this tab`, sub: 'Click ⚡ Test to inject it, or reload the tab' });
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
    detail.innerHTML = `<div class="tab-warn-row"><span class="tab-warn-txt">${matching.length} rule${matching.length!==1?'s':''} apply here — script not loaded</span><button class="inline-btn" id="reload-tab-btn">Reload tab</button></div>`;
    document.getElementById('reload-tab-btn').onclick = () => { if(tab?.id) chrome.tabs.reload(tab.id).then(()=>setTimeout(refresh,1200)); };
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

  const [allRules, status, tabSt] = await Promise.all([
    ask({ type: 'get:all-rules' }),
    ask({ type: 'get:status' }),
    currentTab ? askTab(currentTab.id, { type: 'get:tab-status' }) : Promise.resolve(null),
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

  renderDiag(status, allRules, tabSt, currentTab);
  renderTabPanel(allRules, tabSt, currentTab);
  renderRules(allRules, status, tabSt);
  renderLog(status?.activityLog || []);
}

// ── Collapsible log ───────────────────────────────────────────────────────────

document.getElementById('log-toggle').addEventListener('click', () => {
  const panel = document.getElementById('log-panel');
  const open = panel.style.display === 'none';
  panel.style.display = open ? 'block' : 'none';
  document.getElementById('log-arrow').textContent = open ? '▾' : '▸';
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
  // Load API key from storage
  const res = await ask({ type: 'get:api-key' });
  apiKey = res?.key || null;

  // Check daemon status
  const status = await ask({ type: 'get:status' });
  chatConnected = status?.connected || false;

  const modeLabel = document.getElementById('chat-mode-label');
  const chatDot   = document.getElementById('chat-status-dot');

  if (chatConnected) {
    modeLabel.textContent = '· via daemon';
    chatDot.className = 'status-dot on';
  } else if (apiKey) {
    modeLabel.textContent = '· OpenRouter';
    chatDot.className = 'status-dot standalone';
  } else {
    modeLabel.textContent = '· needs OpenRouter key';
    chatDot.className = 'status-dot off';
  }

  // Show/hide API key panel
  document.getElementById('api-key-panel').style.display = (!chatConnected && !apiKey) ? 'block' : 'none';

  if (chatHistory.length === 0) {
    addSysMsg('Hi! I can block specific UI elements on websites. Try: "Block YouTube Shorts" or "Hide the Twitter trending sidebar"');
  }
}

// ── API key save ──────────────────────────────────────────────────────────────

document.getElementById('api-key-save-btn').addEventListener('click', async () => {
  const key = document.getElementById('api-key-input').value.trim();
  if (!key.startsWith('sk-or-')) {
    document.getElementById('api-key-err').textContent = 'OpenRouter keys start with sk-or- — get one at openrouter.ai/keys';
    document.getElementById('api-key-err').style.display = 'block';
    return;
  }
  await ask({ type: 'set:api-key', key });
  apiKey = key;
  document.getElementById('api-key-panel').style.display = 'none';
  document.getElementById('api-key-err').style.display = 'none';
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

function addAiMsg(text) {
  const msgs = document.getElementById('chat-messages');
  const d = document.createElement('div'); d.className = 'msg ai';

  // Parse <rule>...</rule> blocks and render "Add Rule" buttons
  const parts = text.split(/(<rule>[\s\S]*?<\/rule>)/g);
  let html = '';
  const pendingRules = [];

  for (const part of parts) {
    if (part.startsWith('<rule>')) {
      try {
        const json = part.replace(/<\/?rule>/g, '').trim();
        const rule = JSON.parse(json);
        pendingRules.push(rule);
        html += `</div><button class="add-rule-btn" data-rule='${esc(JSON.stringify(rule))}'>➕ Add rule: ${esc(rule.displayName || rule.id)}</button><div class="bubble" style="margin-top:5px">`;
      } catch(_) { html += esc(part); }
    } else {
      html += formatInline(esc(part));
    }
  }

  d.innerHTML = `<div class="bubble">${html}</div>`;

  // Wire up "Add Rule" buttons
  d.querySelectorAll('.add-rule-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      try {
        const rule = JSON.parse(btn.dataset.rule || '{}');
        rule.enabled = true;
        const res = await ask({ type: 'create:rule', rule });
        if (res?.ok) {
          btn.textContent = `✓ Added: ${rule.displayName || rule.id}`;
          btn.className += ' added';
          btn.disabled = true;
          addSysMsg(`Rule "${rule.displayName || rule.id}" added and active.`);
        }
      } catch(e) { console.error(e); }
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

  if (!chatConnected && !apiKey) {
    removeTypingIndicator();
    document.getElementById('api-key-panel').style.display = 'block';
    addSysMsg('Please enter your API key above to continue.');
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
      if (msg.message === 'no_key') {
        addSysMsg('No OpenRouter key set — enter one above. Get it free at openrouter.ai/keys');
        document.getElementById('api-key-panel').style.display = 'block';
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

// ── Boot ──────────────────────────────────────────────────────────────────────

progSlide();
refresh().catch(console.error);
checkUpdate().catch(console.error);
