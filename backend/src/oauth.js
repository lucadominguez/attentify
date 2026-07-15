// Social sign-in (OAuth 2.0) for Google, Facebook, GitHub and Microsoft.
//
// The desktop app can't safely embed a provider login (Google blocks embedded
// webviews), so it uses the "AppAuth" loopback pattern: the app opens the provider
// login in the user's real browser and listens on a temporary 127.0.0.1 port. The
// PROVIDER only ever talks to this Worker's stable HTTPS callback; after we verify the
// code and resolve the account's email, we hand a session token back to the app over
// its loopback URL (guarded by a signed state + per-attempt nonce).
//
// A provider is only "enabled" when BOTH its client id and secret are present as Worker
// secrets — so the UI (via /v1/auth/providers) never offers a provider that can't work.

const PROVIDERS = {
  google: {
    idEnv: 'GOOGLE_CLIENT_ID', secretEnv: 'GOOGLE_CLIENT_SECRET',
    authorize: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userinfo: 'https://openidconnect.googleapis.com/v1/userinfo',
    scope: 'openid email profile',
    extraAuth: { access_type: 'online', prompt: 'select_account' },
    email: (u) => (u.email_verified === false ? null : u.email),
  },
  facebook: {
    idEnv: 'FACEBOOK_CLIENT_ID', secretEnv: 'FACEBOOK_CLIENT_SECRET',
    authorize: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    userinfo: 'https://graph.facebook.com/me?fields=email,name',
    scope: 'email public_profile',
    email: (u) => u.email || null,
  },
  github: {
    idEnv: 'GITHUB_CLIENT_ID', secretEnv: 'GITHUB_CLIENT_SECRET',
    authorize: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userinfo: 'https://api.github.com/user',
    scope: 'read:user user:email',
    email: (u) => u.email || null, // may be null → fall back to /user/emails
  },
  microsoft: {
    idEnv: 'MICROSOFT_CLIENT_ID', secretEnv: 'MICROSOFT_CLIENT_SECRET',
    authorize: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    userinfo: 'https://graph.microsoft.com/oidc/userinfo',
    scope: 'openid email profile',
    email: (u) => u.email || u.preferred_username || null,
  },
};

export const KNOWN_PROVIDERS = Object.keys(PROVIDERS);
export const providerDef = (provider) => PROVIDERS[provider] || null;

/** Returns {id, secret} if the provider is fully configured, else null. */
export function providerCreds(env, provider) {
  const def = PROVIDERS[provider];
  if (!def) return null;
  const id = env[def.idEnv];
  const secret = env[def.secretEnv];
  return id && secret ? { id: String(id), secret: String(secret) } : null;
}

/** The providers that are actually usable (creds present), for the sign-in UI. */
export function enabledProviders(env) {
  return KNOWN_PROVIDERS.filter((p) => providerCreds(env, p));
}

// ── Signed state (stateless CSRF + loopback binding) ─────────────────────────────
function b64urlEncode(str) {
  return btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(s) {
  const t = s.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(escape(atob(t)));
}
async function hmacHex(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
const stateSecret = (env) => String(env.AUTH_STATE_SECRET || env.ADMIN_TOKEN || 'attentify-oauth-state');

export async function signState(env, payload) {
  const body = b64urlEncode(JSON.stringify(payload));
  const sig = await hmacHex(stateSecret(env), body);
  return `${body}.${sig}`;
}

/** Verify + decode a state string; returns the payload or null if tampered/expired. */
export async function verifyState(env, state, maxAgeMs = 10 * 60 * 1000) {
  if (typeof state !== 'string' || !state.includes('.')) return null;
  const dot = state.lastIndexOf('.');
  const body = state.slice(0, dot);
  const sig = state.slice(dot + 1);
  const expect = await hmacHex(stateSecret(env), body);
  if (sig.length !== expect.length || sig !== expect) return null;
  let payload;
  try { payload = JSON.parse(b64urlDecode(body)); } catch { return null; }
  if (!payload || Date.now() - (payload.ts || 0) > maxAgeMs) return null;
  return payload;
}

/** Only permit handing tokens back to a local loopback listener. */
export function isLoopbackCallback(cb) {
  try {
    const u = new URL(cb);
    return u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost');
  } catch { return false; }
}

export function authorizeUrl(env, provider, redirectUri, state) {
  const def = PROVIDERS[provider];
  const creds = providerCreds(env, provider);
  const q = new URLSearchParams({
    client_id: creds.id,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: def.scope,
    state,
    ...(def.extraAuth || {}),
  });
  return `${def.authorize}?${q.toString()}`;
}

/** Exchange the auth code for a provider access token. Returns the token or null. */
export async function exchangeCode(env, provider, code, redirectUri) {
  const def = PROVIDERS[provider];
  const creds = providerCreds(env, provider);
  const body = new URLSearchParams({
    client_id: creds.id,
    client_secret: creds.secret,
    code,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  });
  const res = await fetch(def.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || !data.access_token) return null;
  return data.access_token;
}

/** Resolve the account's verified email from the provider. Returns lowercased email or null. */
export async function fetchEmail(env, provider, accessToken) {
  const def = PROVIDERS[provider];
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/json', 'User-Agent': 'Attentify' };
  const res = await fetch(def.userinfo, { headers });
  const u = await res.json().catch(() => null);
  if (!res.ok || !u) return null;

  let email = def.email(u);
  // GitHub's /user omits the email when it's private — pull the primary verified one.
  if (!email && provider === 'github') {
    const er = await fetch('https://api.github.com/user/emails', { headers });
    const list = await er.json().catch(() => []);
    if (Array.isArray(list)) {
      const pick = list.find((e) => e.primary && e.verified) || list.find((e) => e.verified) || list[0];
      email = pick && pick.email;
    }
  }
  return email ? String(email).toLowerCase().trim() : null;
}
