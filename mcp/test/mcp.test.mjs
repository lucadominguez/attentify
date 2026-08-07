// Integration test for the MCP server and the local API's access gate.
//
// Runs the REAL attentify-mcp.mjs as a child process over stdio, against a real HTTP
// server whose authorization decision comes from the app's REAL access module (compiled
// from src/main/debug/access.ts by the pretest bundle step). Only the app's data layer is
// faked. That is deliberate: the two things worth proving here are that a caller without
// the token is refused, and that the MCP client presents it correctly — and both live in
// code paths a unit test of either half would miss.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'

const here = dirname(fileURLToPath(import.meta.url))
const SERVER = join(here, '..', 'attentify-mcp.mjs')
const DATA_DIR = join(here, '.tmp-data')
const TOKEN = 'a'.repeat(64)

// Point the access module at the test's own directory BEFORE importing it: it resolves
// its token path once, at module load, exactly as it does inside the app.
mkdirSync(DATA_DIR, { recursive: true })
writeFileSync(join(DATA_DIR, 'debug-token'), TOKEN)
process.env.ATTENTIFY_DATA_DIR = DATA_DIR

// The real compiled access control, bundled by `npm run pretest` in this folder.
const access = await import(pathToFileURL(join(here, '..', '.build', 'access.mjs')).href)

let server, port, requests

before(async () => {
  requests = []
  server = createServer((req, res) => {
    const url = new URL(req.url, 'http://127.0.0.1')
    requests.push({ path: url.pathname, auth: req.headers.authorization ?? null })

    // Exactly what DebugServer does, using the same module.
    if (!access.isAuthorized(url.pathname, req.headers, url.searchParams)) {
      res.writeHead(401, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ error: 'unauthorized' }))
    }
    const body = {
      '/health': { ok: true, pid: 1 },
      '/summary': {
        appState: { blockingMode: 'auto', activeFocusSession: null, blockedDomains: 3, blockedProcesses: 1 },
        monitor: { currentUrl: 'https://reddit.com/r/all' },
        inference: { pending: 2, autoBlocked: 1, topPending: [] },
      },
      '/blocklist': { domains: [{ domain: 'reddit.com' }], processes: [] },
      '/agent/goals': [{ text: 'ship the MCP server' }],
      '/inject/block': { ok: true },
      '/inject/unblock': { ok: true },
    }[url.pathname] ?? []
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(body))
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  port = server.address().port
  writeFileSync(join(DATA_DIR, 'debug-port'), String(port))
})

after(() => {
  server?.close()
  rmSync(DATA_DIR, { recursive: true, force: true })
})

// Drive the MCP server the way a host does: one child, a sequence of requests, replies
// matched by id.
function withServer(env = {}) {
  const child = spawn(process.execPath, [SERVER], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ATTENTIFY_DATA_DIR: DATA_DIR, ...env },
  })
  const pending = new Map()
  let buf = ''
  child.stdout.on('data', (d) => {
    buf += d.toString()
    let i
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim()
      buf = buf.slice(i + 1)
      if (!line) continue
      const msg = JSON.parse(line)
      const resolve = pending.get(msg.id)
      if (resolve) { pending.delete(msg.id); resolve(msg) }
    }
  })
  let id = 0
  return {
    call(method, params) {
      const myId = ++id
      const p = new Promise((r) => pending.set(myId, r))
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: myId, method, params }) + '\n')
      return p
    },
    kill: () => child.kill(),
  }
}

const textOf = (res) => res.result.content[0].text

test('initialize and tools/list advertise the real tool set', async () => {
  const mcp = withServer()
  try {
    const init = await mcp.call('initialize', { protocolVersion: '2024-11-05', capabilities: {} })
    assert.equal(init.result.serverInfo.name, 'attentify')

    const list = await mcp.call('tools/list', {})
    const names = list.result.tools.map((t) => t.name).sort()
    assert.deepEqual(names, [
      'block_site', 'get_blocklist', 'get_distraction_flags',
      'get_focus_status', 'get_goals', 'get_recent_activity', 'unblock_site',
    ])
    for (const t of list.result.tools) {
      assert.ok(t.description?.length > 20, `${t.name} needs a real description`)
      assert.equal(t.inputSchema.type, 'object')
    }
  } finally { mcp.kill() }
})

test('a read tool reaches the app and presents the token', async () => {
  const mcp = withServer()
  try {
    await mcp.call('initialize', { protocolVersion: '2024-11-05', capabilities: {} })
    const res = await mcp.call('tools/call', { name: 'get_focus_status', arguments: {} })
    assert.ok(!res.result.isError, textOf(res))
    const out = JSON.parse(textOf(res))
    assert.equal(out.currentPage, 'https://reddit.com/r/all')
    assert.equal(out.blockedDomains, 3)
    const summary = requests.find((r) => r.path === '/summary')
    assert.equal(summary.auth, `Bearer ${TOKEN}`, 'the token must be presented')
  } finally { mcp.kill() }
})

test('without the token the app refuses, and the agent is told why', async () => {
  const mcp = withServer({ ATTENTIFY_TOKEN: 'wrong-token-entirely' })
  try {
    await mcp.call('initialize', { protocolVersion: '2024-11-05', capabilities: {} })
    const res = await mcp.call('tools/call', { name: 'get_focus_status', arguments: {} })
    assert.equal(res.result.isError, true)
    assert.match(textOf(res), /rejected the access token/i)
  } finally { mcp.kill() }
})

test('health stays open so the port scan works before the token is read', () => {
  assert.equal(access.isAuthorized('/health', {}, new URLSearchParams()), true)
  assert.equal(access.isAuthorized('/extension/activity', {}, new URLSearchParams()), true)
  assert.equal(access.isAuthorized('/summary', {}, new URLSearchParams()), false)
  assert.equal(access.isAuthorized('/inject/block', {}, new URLSearchParams()), false)
})

test('CORS is granted to the extension and to nobody else', () => {
  assert.equal(access.corsOrigin('chrome-extension://abcdef'), 'chrome-extension://abcdef')
  assert.equal(access.corsOrigin('https://evil.example'), null)
  assert.equal(access.corsOrigin('http://localhost:3000'), null)
  assert.equal(access.corsOrigin(undefined), null)
})

test('blocking normalises whatever the agent passes', async () => {
  const mcp = withServer()
  try {
    await mcp.call('initialize', { protocolVersion: '2024-11-05', capabilities: {} })
    const res = await mcp.call('tools/call', { name: 'block_site', arguments: { domain: 'HTTPS://www.Reddit.com/r/all?x=1' } })
    assert.ok(!res.result.isError, textOf(res))
    assert.equal(JSON.parse(textOf(res)).blocked, 'reddit.com')

    const bad = await mcp.call('tools/call', { name: 'block_site', arguments: { domain: 'not a domain' } })
    assert.equal(bad.result.isError, true)
  } finally { mcp.kill() }
})

test('an unknown tool is a protocol error, not a silent success', async () => {
  const mcp = withServer()
  try {
    await mcp.call('initialize', { protocolVersion: '2024-11-05', capabilities: {} })
    const res = await mcp.call('tools/call', { name: 'rm_rf', arguments: {} })
    assert.equal(res.error.code, -32602)
  } finally { mcp.kill() }
})
