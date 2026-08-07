#!/usr/bin/env node
// Attentify MCP server — gives an AI agent read access to what you have actually been
// doing, and the ability to block a site.
//
// Speaks MCP over stdio as newline-delimited JSON-RPC 2.0. Deliberately ZERO dependencies
// and a single file: this asks people to let an agent see their browsing history, so the
// whole thing should be readable in one sitting. No build step, no lockfile, no transitive
// packages to audit.
//
// It talks to the Attentify desktop app's local API on 127.0.0.1. That API is gated by a
// per-install token (see the app's src/main/debug/access.ts), which this reads from
// ProgramData. Nothing here reaches the network.
//
//   claude mcp add attentify -- npx -y @attentify/mcp
//
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createInterface } from 'node:readline'

const PROGRAM_DATA = process.env.ATTENTIFY_DATA_DIR || join('C:\\ProgramData', 'Attentify')
const PORT_FILE = join(PROGRAM_DATA, 'debug-port')
const TOKEN_FILE = join(PROGRAM_DATA, 'debug-token')
const FALLBACK_PORTS = [9119, 9120, 9121, 9122, 9123]
const PROTOCOL_VERSION = '2024-11-05'

// ── talking to the app ───────────────────────────────────────────────────────

const readTrimmed = (p) => { try { return readFileSync(p, 'utf8').trim() } catch { return '' } }

function token() {
  return process.env.ATTENTIFY_TOKEN || readTrimmed(TOKEN_FILE)
}

// The app writes its actual port to a file because 9119 may be taken; fall back to
// scanning the same range it tries, so a stale file cannot strand us.
let cachedPort = null
async function findPort() {
  if (cachedPort) return cachedPort
  const written = parseInt(readTrimmed(PORT_FILE), 10)
  const candidates = Number.isFinite(written) ? [written, ...FALLBACK_PORTS] : FALLBACK_PORTS
  for (const p of candidates) {
    try {
      const r = await fetch(`http://127.0.0.1:${p}/health`, { signal: AbortSignal.timeout(700) })
      if (r.ok) { cachedPort = p; return p }
    } catch { /* try the next one */ }
  }
  throw new Error(
    'Attentify does not appear to be running. Start the desktop app, then try again. ' +
    '(Looked on ports ' + candidates.join(', ') + '.)',
  )
}

async function api(path, { method = 'GET', body } = {}) {
  const port = await findPort()
  const t = token()
  if (!t) {
    throw new Error(
      `No access token found. Expected it at ${TOKEN_FILE}, which the app writes on ` +
      'startup. Run Attentify once, or set ATTENTIFY_TOKEN.',
    )
  }
  const res = await fetch(`http://127.0.0.1:${port}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 401) {
    cachedPort = null
    throw new Error(`Attentify rejected the access token. Re-read it from ${TOKEN_FILE}.`)
  }
  const text = await res.text()
  let data
  try { data = JSON.parse(text) } catch { data = { raw: text } }
  if (!res.ok) throw new Error(data?.error || `Attentify returned ${res.status}`)
  return data
}

// ── tools ────────────────────────────────────────────────────────────────────
//
// Every tool here maps onto a route the app already serves. Nothing is aspirational:
// if it is listed, it works. Focus-session control is deliberately absent — the app has
// no local route for it yet, and a tool that quietly does nothing is worse than none.

const HOUR = 60 * 60 * 1000

const TOOLS = [
  {
    name: 'get_focus_status',
    description:
      'What Attentify knows right now: the current page, whether a focus session is ' +
      'running, how many sites are blocked, and anything it has flagged as a distraction ' +
      'but not yet acted on. Call this before advising the user about their focus.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => {
      const s = await api('/summary')
      return {
        currentPage: s?.monitor?.currentUrl ?? null,
        blockingMode: s?.appState?.blockingMode ?? null,
        activeFocusSession: s?.appState?.activeFocusSession ?? null,
        blockedDomains: s?.appState?.blockedDomains ?? 0,
        blockedProcesses: s?.appState?.blockedProcesses ?? 0,
        pendingDistractionFlags: s?.inference?.pending ?? 0,
        autoBlocked: s?.inference?.autoBlocked ?? 0,
        topPending: (s?.inference?.topPending ?? []).slice(0, 5),
      }
    },
  },
  {
    name: 'get_recent_activity',
    description:
      'What the user has actually been doing, most recent first. Use it to ground advice ' +
      'in real behaviour instead of asking them to recall their own day.',
    inputSchema: {
      type: 'object',
      properties: {
        hours: { type: 'number', description: 'How far back to look. Default 2, max 24.' },
        limit: { type: 'number', description: 'Maximum entries. Default 50, max 200.' },
      },
      additionalProperties: false,
    },
    run: async (args) => {
      const hours = Math.min(Math.max(Number(args?.hours) || 2, 0.1), 24)
      const limit = Math.min(Math.max(parseInt(args?.limit, 10) || 50, 1), 200)
      const since = Date.now() - hours * HOUR
      const events = await api(`/events?since=${since}&limit=${limit}`)
      return { hours, count: Array.isArray(events) ? events.length : 0, events }
    },
  },
  {
    name: 'get_goals',
    description:
      'The goals the user has told Attentify they are working towards. Read these before ' +
      'judging whether something counts as a distraction: the same site is focus for one ' +
      'person and avoidance for another.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => ({ goals: await api('/agent/goals') }),
  },
  {
    name: 'get_blocklist',
    description: 'Which domains and applications are currently blocked.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    run: async () => await api('/blocklist'),
  },
  {
    name: 'get_distraction_flags',
    description:
      'Sites Attentify has judged to be distractions, with its confidence and reasoning. ' +
      'Filter by status: pending (flagged, awaiting a decision), auto_applied (blocked ' +
      'automatically), confirmed, or rejected.',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'auto_applied', 'confirmed', 'rejected'] },
      },
      additionalProperties: false,
    },
    run: async (args) => {
      const q = args?.status ? `?status=${encodeURIComponent(args.status)}` : ''
      return { inferences: await api(`/inferences${q}`) }
    },
  },
  {
    name: 'block_site',
    description:
      'Block a domain immediately, across every browser, until it is unblocked. This ' +
      'changes the user\'s machine. Only call it when they have asked for it, or have ' +
      'agreed to it in this conversation.',
    inputSchema: {
      type: 'object',
      properties: { domain: { type: 'string', description: 'Bare domain, e.g. reddit.com' } },
      required: ['domain'],
      additionalProperties: false,
    },
    run: async (args) => {
      const domain = normaliseDomain(args?.domain)
      const r = await api('/inject/block', { method: 'POST', body: { domain } })
      if (!r?.ok) throw new Error(r?.error || `Could not block ${domain}`)
      return { blocked: domain }
    },
  },
  {
    name: 'unblock_site',
    description: 'Remove a domain from the blocklist.',
    inputSchema: {
      type: 'object',
      properties: { domain: { type: 'string' } },
      required: ['domain'],
      additionalProperties: false,
    },
    run: async (args) => {
      const domain = normaliseDomain(args?.domain)
      await api('/inject/unblock', { method: 'POST', body: { domain } })
      return { unblocked: domain }
    },
  },
]

// Agents pass whatever the user typed: a full URL, a "www." prefix, a trailing slash.
// The app's blocking engine wants a bare host, and a mismatch here silently blocks
// nothing, which reads to the user as the tool lying about what it did.
function normaliseDomain(raw) {
  let d = String(raw || '').trim().toLowerCase()
  if (!d) throw new Error('A domain is required.')
  d = d.replace(/^[a-z]+:\/\//, '').split('/')[0].split('?')[0]
  d = d.replace(/^www\./, '').replace(/:\d+$/, '')
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) throw new Error(`That does not look like a domain: ${raw}`)
  return d
}

// ── JSON-RPC plumbing ────────────────────────────────────────────────────────

const send = (msg) => process.stdout.write(JSON.stringify(msg) + '\n')
const reply = (id, result) => send({ jsonrpc: '2.0', id, result })
const fail = (id, code, message) => send({ jsonrpc: '2.0', id, error: { code, message } })

async function handle(msg) {
  const { id, method, params } = msg

  if (method === 'initialize') {
    return reply(id, {
      protocolVersion: PROTOCOL_VERSION,
      capabilities: { tools: {} },
      serverInfo: { name: 'attentify', version: '0.1.0' },
    })
  }

  // Notifications carry no id and must never be answered.
  if (id === undefined) return

  if (method === 'tools/list') {
    return reply(id, {
      tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
    })
  }

  if (method === 'tools/call') {
    const tool = TOOLS.find((t) => t.name === params?.name)
    if (!tool) return fail(id, -32602, `Unknown tool: ${params?.name}`)
    try {
      const out = await tool.run(params?.arguments ?? {})
      return reply(id, { content: [{ type: 'text', text: JSON.stringify(out, null, 2) }] })
    } catch (e) {
      // An MCP tool error belongs in the RESULT with isError, not in the JSON-RPC error
      // channel: the model should see "Attentify is not running" and tell the user, not
      // have the call collapse into a transport failure it cannot read.
      return reply(id, { content: [{ type: 'text', text: String(e?.message || e) }], isError: true })
    }
  }

  if (method === 'ping') return reply(id, {})
  return fail(id, -32601, `Unknown method: ${method}`)
}

createInterface({ input: process.stdin }).on('line', (line) => {
  const trimmed = line.trim()
  if (!trimmed) return
  let msg
  try { msg = JSON.parse(trimmed) } catch { return fail(null, -32700, 'Parse error') }
  handle(msg).catch((e) => { if (msg?.id !== undefined) fail(msg.id, -32603, String(e?.message || e)) })
})

export { TOOLS, normaliseDomain, handle }
