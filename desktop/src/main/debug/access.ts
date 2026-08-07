// Access control for the local API (DebugServer).
//
// Kept in its own module with no Electron, database or store imports, so it can be
// exercised directly by a test. The server it guards cannot be, without standing up half
// the main process.
//
// WHY THIS EXISTS: the server binds 127.0.0.1 and used to answer every caller with
// `Access-Control-Allow-Origin: *`. Loopback keeps other machines out; it does nothing
// about the browser running on this machine, so any page the user had open could read
// their activity history and drive blocking. Binding to loopback is not authentication.
//
// LIMIT, stated plainly: the token lives in ProgramData, which any local user can read.
// This bounds web pages and other software on the machine. It does not defend against
// someone already executing code as this user.
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { randomBytes, timingSafeEqual } from 'crypto'

// Overridable so a portable install (and the MCP server's test harness) can point at a
// different directory. Not a security boundary: anything able to set this process's
// environment already runs as this user.
export const DATA_DIR = process.env.ATTENTIFY_DATA_DIR || join('C:\\ProgramData', 'Attentify')
export const TOKEN_FILE = join(DATA_DIR, 'debug-token')

// Routes that answer without a token.
//   /health              — pid, uptime and port only, no user data
//   /extension/activity  — write-only sensor ingest. The shipped extension has no token,
//                          and requiring one would break the sensor for every install in
//                          the field. Nothing can be read back through it.
export const OPEN_PATHS: ReadonlySet<string> = new Set(['/health', '/extension/activity'])

let cached = ''

export function loadOrCreateToken(file: string = TOKEN_FILE): string {
  if (cached) return cached
  try {
    const existing = readFileSync(file, 'utf8').trim()
    if (existing.length >= 32) { cached = existing; return cached }
  } catch { /* first run, or unreadable — mint one below */ }
  cached = randomBytes(32).toString('hex')
  try { writeFileSync(file, cached, 'utf8') } catch { /* non-fatal: keep it in memory */ }
  return cached
}

/** Test seam: forget the cached token so a test can point at its own file. */
export function _resetTokenCache(): void { cached = '' }

export function presentedToken(
  headers: Record<string, string | string[] | undefined>,
  search: URLSearchParams,
): string {
  const auth = headers.authorization
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) return auth.slice(7).trim()
  const header = headers['x-attentify-token']
  if (typeof header === 'string') return header.trim()
  return search.get('token')?.trim() ?? ''
}

// Constant time, so the token cannot be narrowed a byte at a time by timing the reply.
export function tokenOk(presented: string, expected: string = loadOrCreateToken()): boolean {
  const a = Buffer.from(presented)
  const b = Buffer.from(expected)
  if (a.length === 0 || a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// Only the extension is granted CORS. Everything else gets no header at all, so a page
// cannot read the response even if it can send the request.
export function corsOrigin(origin: string | undefined): string | null {
  return typeof origin === 'string' && origin.startsWith('chrome-extension://') ? origin : null
}

export function isAuthorized(
  path: string,
  headers: Record<string, string | string[] | undefined>,
  search: URLSearchParams,
): boolean {
  if (OPEN_PATHS.has(path)) return true
  return tokenOk(presentedToken(headers, search))
}
