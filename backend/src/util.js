// Small shared helpers for the Worker.

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Admin-Token,Stripe-Signature',
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extra },
  });
}
export const ok = (d = {}) => json({ ok: true, ...d });
export const err = (message, status = 400) => json({ ok: false, error: message }, status);

// random url-safe token
export function token(bytes = 24) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map(b => b.toString(16).padStart(2, '0')).join('');
}
export const newId = (prefix) => `${prefix}_${token(10)}`;
export const newLicense = () => `pd_live_${token(18)}`;
export const newSessionToken = () => `ses_${token(24)}`;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

// ── Password auth (PBKDF2-SHA256 via Web Crypto — no external deps) ───────────────
const PBKDF2_ITERATIONS = 100_000;

function hexToBytes(hex) {
  const a = new Uint8Array(hex.length / 2);
  for (let i = 0; i < a.length; i++) a[i] = parseInt(hex.substr(i * 2, 2), 16);
  return a;
}
function bytesToHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Derive a PBKDF2 hash. Pass an existing saltHex to verify; omit to hash fresh. */
export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial, 256,
  );
  return { hash: bytesToHex(new Uint8Array(bits)), salt: bytesToHex(salt) };
}

/** Constant-time-ish comparison of two hex strings. */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyPassword(password, saltHex, hashHex) {
  if (!saltHex || !hashHex) return false;
  const { hash } = await hashPassword(password, saltHex);
  return timingSafeEqual(hash, hashHex);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (s) => typeof s === 'string' && EMAIL_RE.test(s.trim());
export const isSessionToken = (s) => typeof s === 'string' && s.startsWith('ses_');

// Tiers: what each plan is allowed to do.
export const TIERS = {
  free:  { aiQuota: 60,    managedRules: false, analytics: false, label: 'Free' },
  cloud: { aiQuota: 60000, managedRules: true,  analytics: true,  label: 'Cloud' },
};
export const tierOf = (u) => (u && u.tier && TIERS[u.tier]) ? u.tier : 'free';

const MONTH = 30 * 24 * 60 * 60 * 1000;
// Returns { used, quota, remaining } after rolling the monthly window if needed.
export function quotaState(user, now = Date.now()) {
  const t = TIERS[tierOf(user)];
  let used = user.ai_calls_used || 0;
  let start = user.ai_period_start || 0;
  if (now - start > MONTH) { used = 0; start = now; }
  return { used, quota: t.aiQuota, remaining: Math.max(0, t.aiQuota - used), periodStart: start };
}

export function publicUser(u) {
  if (!u) return null;
  const q = quotaState(u);
  return {
    email: u.email, tier: tierOf(u), status: u.status,
    license_key: u.license_key,
    aiUsed: q.used, aiQuota: q.quota, aiRemaining: q.remaining,
    currentPeriodEnd: u.current_period_end || null,
  };
}
