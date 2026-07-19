// Small shared helpers for the Worker.

export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Admin-Token,Stripe-Signature,X-Attentify-Client,x-api-key,anthropic-version',
};

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extra },
  });
}
export const ok = (d = {}) => json({ ok: true, ...d });
export const err = (message, status = 400, extra = {}) => json({ ok: false, error: message, ...extra }, status);

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

// ── Money model ───────────────────────────────────────────────────────────────
// Balances are integer MICRO-USD (1 micro = $0.000001) so there is no float drift
// in accounting. Users see "credits" (1 credit = $0.001), never dollars — that hides
// the cost basis so the markup can't be reverse-engineered from the displayed number.
export const CREDIT_UNIT_MICROS = 1000;                 // 1 credit = $0.001
export const TRIAL_GRANT_MICROS = 250_000;              // $0.25 free trial
export const SUB_CEILING_MICROS = 8_000_000;            // $8/mo fair-use ceiling for subscribers
// Markup applied to real provider cost when debiting a credit balance. Kept as an
// integer ratio (5/4 = 1.25) so the deduction is exact.
export const MARKUP_NUM = 5, MARKUP_DEN = 4;
export const debitMicros = (costMicros) => Math.ceil((costMicros * MARKUP_NUM) / MARKUP_DEN);
export const toCredits = (micros) => Math.max(0, Math.round((micros || 0) / CREDIT_UNIT_MICROS));

// Provider pricing per 1M tokens, [input, output] USD. Used to derive the true cost
// of a call from the token usage the provider reports (no extra billing API call).
const MODEL_PRICING = {
  'anthropic/claude-haiku-4.5': [1, 5],
  'anthropic/claude-haiku-4-5': [1, 5],
  'claude-haiku-4-5-20251001': [1, 5],
  'anthropic/claude-sonnet-4.5': [3, 15],
  'anthropic/claude-sonnet-4-5': [3, 15],
  'anthropic/claude-sonnet-4-6': [3, 15],
  'deepseek/deepseek-v4-pro': [0.35, 1.4],
  'deepseek/deepseek-chat': [0.28, 1.1],
  'deepseek/deepseek-reasoner': [0.55, 2.2],
};
// Credit packs: dollars purchased → micro-USD credited at FACE VALUE (the markup is
// realized later, at debit time, not here). The Stripe price id for each pack is read
// from env at checkout so packs can be re-priced without a code change.
export const CREDIT_PACKS = {
  '5':  { usd: 5,  micros: 5_000_000,  priceEnv: 'STRIPE_PRICE_CREDITS_5'  },
  '10': { usd: 10, micros: 10_000_000, priceEnv: 'STRIPE_PRICE_CREDITS_10' },
  '20': { usd: 20, micros: 20_000_000, priceEnv: 'STRIPE_PRICE_CREDITS_20' },
};

const DEFAULT_PRICING = [1, 5]; // assume haiku-class if the model is unknown
export function costMicros(model, inputTokens = 0, outputTokens = 0) {
  const [inPrice, outPrice] = MODEL_PRICING[model] || DEFAULT_PRICING;
  const usd = (inputTokens / 1_000_000) * inPrice + (outputTokens / 1_000_000) * outPrice;
  return Math.max(0, Math.round(usd * 1_000_000));
}

// Tiers: what each plan is ENTITLED to (independent of the AI balance, which is
// metered separately). 'cloud' is the $9.99/mo subscriber; 'free' is trial/credit.
export const TIERS = {
  free:  { managedRules: false, analytics: false, customAnalyticsLimit: 3,    label: 'Free' },
  cloud: { managedRules: true,  analytics: true,  customAnalyticsLimit: null, label: 'Cloud' }, // null = unlimited
};
export const tierOf = (u) => (u && u.tier && TIERS[u.tier]) ? u.tier : 'free';
export const isSubscriber = (u) => tierOf(u) === 'cloud' && u?.status === 'active';

const MONTH = 30 * 24 * 60 * 60 * 1000;
// Subscriber fair-use: rolls a monthly window of real provider cost against the ceiling.
export function subUsageState(user, now = Date.now()) {
  let used = user.sub_used_micros || 0;
  let start = user.sub_period_start || 0;
  if (!start || now - start > MONTH) { used = 0; start = now; }
  return { used, ceiling: SUB_CEILING_MICROS, remaining: Math.max(0, SUB_CEILING_MICROS - used), periodStart: start };
}

export function publicUser(u) {
  if (!u) return null;
  const sub = isSubscriber(u);
  const balance = u.credit_micros || 0;
  const ent = TIERS[tierOf(u)];
  const su = subUsageState(u);
  const canUseAi = sub ? su.remaining > 0 : balance > 0;
  return {
    email: u.email, tier: tierOf(u), status: u.status,
    license_key: u.license_key,
    subscribed: sub,
    balanceMicros: balance,
    credits: toCredits(balance),
    trialGranted: !!u.trial_granted,
    canUseAi,
    outOfCredit: !sub && balance <= 0,          // clients gate AI+adaptive features on this
    reason: canUseAi ? null : (sub ? 'fair_use' : 'out_of_credit'),
    entitlements: {
      managedRules: ent.managedRules,
      analytics: ent.analytics,
      customAnalyticsLimit: ent.customAnalyticsLimit,   // null = unlimited (subscriber)
    },
    currentPeriodEnd: u.current_period_end || null,
  };
}
