#!/usr/bin/env node
// Attentify — Native Messaging Host (optional)
// Bridges Chrome's native messaging protocol (stdin/stdout length-prefixed JSON)
// to the daemon's HTTP debug API. Use if you want native messaging instead of
// the extension's built-in HTTP polling (more responsive, no CORS).
//
// Install: run install.ps1 with your extension ID after installing the extension.

'use strict';

const http = require('http');

const DAEMON_PORTS = [9119, 9120, 9121, 9122, 9123];
let daemonPort = null;

// Chrome native messaging: 4-byte LE uint32 length + UTF-8 JSON body
function writeMsg(obj) {
  const json = JSON.stringify(obj);
  const body = Buffer.from(json, 'utf8');
  const hdr = Buffer.alloc(4);
  hdr.writeUInt32LE(body.length, 0);
  process.stdout.write(Buffer.concat([hdr, body]));
}

function readLoop() {
  let buf = Buffer.alloc(0);
  process.stdin.on('data', (chunk) => {
    buf = Buffer.concat([buf, chunk]);
    while (buf.length >= 4) {
      const len = buf.readUInt32LE(0);
      if (buf.length < 4 + len) break;
      const msg = JSON.parse(buf.slice(4, 4 + len).toString('utf8'));
      buf = buf.slice(4 + len);
      handleMsg(msg);
    }
  });
  process.stdin.on('end', () => process.exit(0));
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 1500 }, (res) => {
      let body = '';
      res.on('data', (d) => { body += d; });
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

function post(url, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = new URL(url);
    const reqOpts = {
      hostname: opts.hostname,
      port: opts.port,
      path: opts.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
      timeout: 3000,
    };
    const req = http.request(reqOpts, (res) => {
      let rb = '';
      res.on('data', (d) => { rb += d; });
      res.on('end', () => resolve(rb));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function findPort() {
  for (const p of DAEMON_PORTS) {
    try {
      const body = await get(`http://127.0.0.1:${p}/ping`);
      if (JSON.parse(body).ok) { daemonPort = p; return p; }
    } catch (_) {}
  }
  return null;
}

async function handleMsg(msg) {
  if (!daemonPort) await findPort();

  try {
    if (msg.type === 'rules:get') {
      if (!daemonPort) { writeMsg({ type: 'error', message: 'Daemon not reachable' }); return; }
      const body = await get(`http://127.0.0.1:${daemonPort}/content-rules`);
      const data = JSON.parse(body);
      writeMsg({ type: 'rules:update', rules: data.rules || [] });
    }

    if (msg.type === 'bypass:detected') {
      if (daemonPort) await post(`http://127.0.0.1:${daemonPort}/extension/bypass`, msg);
      writeMsg({ type: 'bypass:ack', ruleId: msg.ruleId });
    }

    if (msg.type === 'ping') {
      writeMsg({ type: 'pong', daemonPort });
    }
  } catch (e) {
    writeMsg({ type: 'error', message: e.message });
    daemonPort = null;
  }
}

async function main() {
  await findPort();
  writeMsg({ type: 'host:ready', daemonConnected: !!daemonPort, daemonPort });
  readLoop();
}

main().catch((e) => { writeMsg({ type: 'error', message: e.message }); process.exit(1); });
