// Attentify — Cloud backend (Cloudflare Worker)
//
// One small Worker fronts: accounts (license keys), Stripe billing for the $5/mo
// Cloud tier, a managed AI proxy (so paying users need no key), analytics ingest,
// managed auto-blocking rules, and an admin API. The router is exported separately
// so it can be unit-tested with an in-memory store + mocked fetch.

import { D1Store } from './store.js';
import {
  json, ok, err, newId, newLicense, readJson, CORS, TIERS, tierOf, publicUser,
  hashPassword, verifyPassword, newSessionToken, isEmail, isSessionToken, SESSION_TTL_MS,
  isSubscriber, subUsageState, costMicros, debitMicros, TRIAL_GRANT_MICROS, CREDIT_PACKS,
} from './util.js';
import { stripe, verifyStripeSig } from './stripe.js';
import { aiJson, aiChatStream, aiProxy, SEED_RULES } from './ai.js';
import {
  enabledProviders, providerCreds, signState, verifyState, isLoopbackCallback,
  authorizeUrl, exchangeCode, fetchEmail,
} from './oauth.js';

export default {
  async fetch(request, env, ctx) {
    const store = new D1Store(env.DB);
    return router(request, env, store, ctx);
  },
};

// ── auth helpers ────────────────────────────────────────────────────────────────
// A Bearer credential is EITHER a website session token (ses_…) or a desktop-app
// license key (pd_live_…). Both resolve to the same user, so every authenticated
// route works from the app and the website alike.
function bearer(request) {
  const h = request.headers.get('Authorization') || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  // The Anthropic SDK (used by the desktop app through the passthrough proxy) sends the
  // credential as x-api-key instead of a Bearer header.
  return (request.headers.get('x-api-key') || '').trim();
}
async function authUser(request, store) {
  const key = bearer(request);
  if (!key) return null;
  if (isSessionToken(key)) return store.getUserBySession(key);
  return store.getUserByLicense(key);
}
const isAdmin = (request, env) =>
  !!env.ADMIN_TOKEN && request.headers.get('X-Admin-Token') === String(env.ADMIN_TOKEN).trim();

async function issueSession(store, user, request) {
  const now = Date.now();
  const session = {
    token: newSessionToken(), user_id: user.id, created_at: now,
    expires_at: now + SESSION_TTL_MS, user_agent: (request.headers.get('User-Agent') || '').slice(0, 200),
  };
  await store.createSession(session);
  return session;
}

// A minimal branded HTML page shown in the browser when a social sign-in can't be
// completed (e.g. a tampered/expired state, so we have no loopback URL to return to).
function oauthClosePage(message) {
  const body = `<!doctype html><html><head><meta charset="utf-8"><title>Attentify</title>
<style>body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
font-family:system-ui,Segoe UI,Roboto,sans-serif;background:#0b0b12;color:#e5e7eb}
.card{max-width:360px;text-align:center;padding:32px}h1{font-size:16px;margin:0 0 8px}
p{font-size:13px;color:#9ca3af;line-height:1.5;margin:0}</style></head>
<body><div class="card"><h1>Attentify</h1><p>${message}</p></div></body></html>`;
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS } });
}

async function createUser(store, { email, tier = 'free', source = 'self', stripe_customer, stripe_sub, current_period_end }) {
  const now = Date.now();
  const u = {
    id: newId('usr'), email: String(email).toLowerCase().trim(), license_key: newLicense(),
    tier, status: 'active', source, stripe_customer, stripe_sub, current_period_end,
    ai_calls_used: 0, ai_period_start: now,
    credit_micros: 0, trial_granted: 0, sub_used_micros: 0, sub_period_start: 0,
    created_at: now, updated_at: now,
  };
  await store.insertUser(u);
  return u;
}

// Which client is calling. 'app'/'ext' send an explicit header (picks the provider key +
// spend attribution); a browser sends none → 'web'. Turnstile is enforced for 'web' only,
// since the desktop app can't render the widget (it relies on the device fingerprint).
const clientOf = (request) => {
  const c = request.headers.get('X-Attentify-Client');
  return c === 'ext' ? 'ext' : c === 'app' ? 'app' : 'web';
};

// Cloudflare Turnstile check on sign-up (anti-bot). If TURNSTILE_SECRET is unset (local
// dev / tests) it is skipped so nothing breaks; production sets the secret.
async function verifyTurnstile(env, tokenStr, request) {
  if (!env.TURNSTILE_SECRET) return true;
  if (!tokenStr) return false;
  try {
    const body = new URLSearchParams({ secret: String(env.TURNSTILE_SECRET), response: String(tokenStr) });
    const ip = request.headers.get('CF-Connecting-IP');
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
    const data = await res.json();
    return !!data.success;
  } catch { return false; }
}

// Grant the one-time $0.25 trial, unless this device fingerprint already claimed one
// (anti-abuse: stops re-signup farming). Per-email uniqueness is enforced separately by
// the users table. Safe to call more than once — trial_granted guards it.
async function grantTrialIfEligible(store, user, fingerprint) {
  if (user.trial_granted) return user;
  const fp = String(fingerprint || '').trim().slice(0, 128);
  if (fp && await store.fingerprintGranted(fp)) {
    await store.updateUser(user.id, { trial_granted: 1 });   // mark, but no credit for a repeat device
    return { ...user, trial_granted: 1 };
  }
  const after = await store.addCredits(user.id, TRIAL_GRANT_MICROS);
  await store.updateUser(user.id, { trial_granted: 1 });
  if (fp) await store.recordFingerprint(fp, user.id);
  await store.addLedger({ user_id: user.id, kind: 'grant', micros: TRIAL_GRANT_MICROS, balance_after: after });
  return { ...user, trial_granted: 1, credit_micros: after };
}

// ── router ────────────────────────────────────────────────────────────────────
export async function router(request, env, store, ctx) {
  const url = new URL(request.url);
  const p = url.pathname.replace(/\/+$/, '') || '/';
  const method = request.method;

  if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  try {
    // ---- health ----
    if (p === '/' || p === '/v1/health') return ok({ service: "attentify-cloud", time: Date.now() });

    // ---- auth: sign up (email + password) ----
    if (p === '/v1/auth/signup' && method === 'POST') {
      const { email, password, cf_token, fingerprint } = await readJson(request);
      const em = String(email || '').toLowerCase().trim();
      if (!isEmail(em)) return err('a valid email is required');
      if (!password || String(password).length < 8) return err('password must be at least 8 characters');
      // Turnstile is a browser widget → enforced for web signups only; the desktop app is
      // gated by its device fingerprint instead.
      if (clientOf(request) === 'web' && !(await verifyTurnstile(env, cf_token, request))) return err('could not verify you are human, please try again', 400, { reason: 'captcha' });
      if (await store.getUserByEmail(em)) return err('an account with this email already exists', 409);
      let user = await createUser(store, { email: em, tier: 'free', source: 'self' });
      const { hash, salt } = await hashPassword(String(password));
      await store.setPassword(user.id, hash, salt);
      user = await grantTrialIfEligible(store, user, fingerprint);
      const session = await issueSession(store, user, request);
      return ok({ token: session.token, user: publicUser(user) });
    }

    // ---- auth: log in ----
    if (p === '/v1/auth/login' && method === 'POST') {
      const { email, password } = await readJson(request);
      const em = String(email || '').toLowerCase().trim();
      const user = await store.getUserByEmail(em);
      // Always run a verify to keep timing uniform whether or not the user exists.
      const okPw = user
        ? await verifyPassword(String(password || ''), user.password_salt, user.password_hash)
        : await verifyPassword('x', '00', 'ff');
      if (!user || !user.password_hash || !okPw) return err('incorrect email or password', 401);
      const session = await issueSession(store, user, request);
      return ok({ token: session.token, user: publicUser(user) });
    }

    // ---- auth: current session → user (website restores login with this) ----
    if (p === '/v1/auth/session' && method === 'GET') {
      const user = await authUser(request, store);
      if (!user) return err('not signed in', 401);
      return ok({ user: publicUser(user) });
    }

    // ---- auth: log out (invalidate this session) ----
    if (p === '/v1/auth/logout' && method === 'POST') {
      const tok = bearer(request);
      if (isSessionToken(tok)) await store.deleteSession(tok);
      return ok({ signedOut: true });
    }

    // ---- auth: set/replace password (lets Stripe/license users add one) ----
    if (p === '/v1/auth/set-password' && method === 'POST') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      const { password } = await readJson(request);
      if (!password || String(password).length < 8) return err('password must be at least 8 characters');
      const { hash, salt } = await hashPassword(String(password));
      await store.setPassword(user.id, hash, salt);
      return ok({ updated: true });
    }

    // ---- auth: which social providers are configured (drives the sign-in UI) ----
    if (p === '/v1/auth/providers' && method === 'GET') {
      return ok({ providers: enabledProviders(env) });
    }

    // ---- auth: begin social sign-in — redirect the user's browser to the provider ----
    // The desktop app opens this in the system browser with a loopback `cb` + `nonce`;
    // we bind both into a signed state so the callback can hand the token straight back.
    {
      const mStart = p.match(/^\/v1\/auth\/oauth\/([a-z]+)\/start$/);
      if (mStart && method === 'GET') {
        const provider = mStart[1];
        if (!providerCreds(env, provider)) return err('sign-in provider not configured', 404);
        const cb = url.searchParams.get('cb') || '';
        const nonce = url.searchParams.get('nonce') || '';
        if (!isLoopbackCallback(cb)) return err('invalid callback');
        const redirectUri = `${url.origin}/v1/auth/oauth/${provider}/callback`;
        const state = await signState(env, { provider, cb, nonce, ts: Date.now() });
        return Response.redirect(authorizeUrl(env, provider, redirectUri, state), 302);
      }
    }

    // ---- auth: social sign-in callback — provider redirects here with a code ----
    {
      const mCb = p.match(/^\/v1\/auth\/oauth\/([a-z]+)\/callback$/);
      if (mCb && method === 'GET') {
        const provider = mCb[1];
        const payload = await verifyState(env, url.searchParams.get('state') || '');
        // Without a valid state we can't trust the loopback target — show a plain page.
        if (!payload || payload.provider !== provider || !isLoopbackCallback(payload.cb)) {
          return oauthClosePage('Sign-in could not be verified. You can close this window and try again.');
        }
        const backToApp = (extra) => {
          const q = new URLSearchParams({ nonce: payload.nonce || '', ...extra });
          return Response.redirect(`${payload.cb}?${q.toString()}`, 302);
        };
        const provErr = url.searchParams.get('error');
        if (provErr) return backToApp({ error: provErr });
        const code = url.searchParams.get('code');
        if (!code || !providerCreds(env, provider)) return backToApp({ error: 'no_code' });

        const redirectUri = `${url.origin}/v1/auth/oauth/${provider}/callback`;
        const accessToken = await exchangeCode(env, provider, code, redirectUri);
        if (!accessToken) return backToApp({ error: 'exchange_failed' });
        const email = await fetchEmail(env, provider, accessToken);
        if (!email) return backToApp({ error: 'no_email' });

        let user = await store.getUserByEmail(email);
        if (!user) {
          user = await createUser(store, { email, tier: 'free', source: provider });
          // Social sign-in has no device fingerprint to bind, so the trial is gated by
          // the (verified) email alone here.
          user = await grantTrialIfEligible(store, user, '');
        }
        const session = await issueSession(store, user, request);
        return backToApp({ token: session.token });
      }
    }

    // ---- public installer download (streamed from R2) ----
    if (p === '/download/win' && method === 'GET') {
      if (!env.DOWNLOADS) return err('downloads not configured', 503);
      const obj = await env.DOWNLOADS.get('Attentify-Setup.exe');
      if (!obj) return err('installer not found', 404);
      // If the client already has the current build (matching ETag), tell it so
      // instead of re-sending ~80 MB.
      const inm = request.headers.get('if-none-match');
      if (inm && inm === obj.httpEtag) {
        return new Response(null, { status: 304, headers: { ...CORS, etag: obj.httpEtag, 'Cache-Control': 'no-cache' } });
      }
      const headers = new Headers(CORS);
      obj.writeHttpMetadata(headers);
      headers.set('etag', obj.httpEtag);
      headers.set('Content-Type', 'application/vnd.microsoft.portable-executable');
      headers.set('Content-Disposition', 'attachment; filename="Attentify-Setup.exe"');
      // The installer is replaced in place on every release, so the browser must
      // revalidate every time rather than serving a stale cached copy for an hour.
      // Paired with the ETag check above, an unchanged build still costs only a 304.
      headers.set('Cache-Control', 'no-cache, must-revalidate');
      return new Response(obj.body, { headers });
    }

    // ---- auto-update feed (electron-updater generic provider) ----
    // Serves latest.yml (+ .blockmap) from R2 under the updates/ prefix; the installer
    // itself reuses the single Attentify-Setup.exe object so releases upload it once.
    if (p.startsWith('/updates/') && method === 'GET') {
      if (!env.DOWNLOADS) return err('downloads not configured', 503);
      const name = p.slice('/updates/'.length);
      if (!/^[A-Za-z0-9._-]+$/.test(name)) return err('bad request', 400);
      let obj = await env.DOWNLOADS.get(`updates/${name}`);
      if (!obj && name === 'Attentify-Setup.exe') obj = await env.DOWNLOADS.get('Attentify-Setup.exe');
      if (!obj) return err('not found', 404);
      const inm = request.headers.get('if-none-match');
      if (inm && inm === obj.httpEtag) {
        return new Response(null, { status: 304, headers: { ...CORS, etag: obj.httpEtag, 'Cache-Control': 'no-cache' } });
      }
      const headers = new Headers(CORS);
      obj.writeHttpMetadata(headers);
      headers.set('etag', obj.httpEtag);
      if (name.endsWith('.yml')) headers.set('Content-Type', 'text/yaml; charset=utf-8');
      else if (name.endsWith('.exe')) headers.set('Content-Type', 'application/vnd.microsoft.portable-executable');
      // latest.yml must never be cached stale, or clients miss releases.
      headers.set('Cache-Control', 'no-cache, must-revalidate');
      return new Response(obj.body, { headers });
    }

    // ---- billing: start a $9.99/mo subscription checkout ----
    if (p === '/v1/billing/checkout' && method === 'POST') {
      const { email } = await readJson(request);
      const site = env.SITE_URL || 'https://attentify.ca';
      const session = await stripe.createCheckoutSession(env.STRIPE_SECRET, {
        priceId: env.STRIPE_PRICE_ID,
        successUrl: `${site}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${site}/#pricing`,
        email,
        metadata: { kind: 'subscription' },
      });
      return ok({ url: session.url, id: session.id });
    }

    // ---- billing: buy a one-time credit pack (authenticated) ----
    if (p === '/v1/billing/credits' && method === 'POST') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      const { pack } = await readJson(request);
      const def = CREDIT_PACKS[String(pack)];
      if (!def) return err('unknown credit pack', 400);
      const priceId = env[def.priceEnv];
      if (!priceId) return err('credit packs not configured', 503);
      const site = env.SITE_URL || 'https://attentify.ca';
      const session = await stripe.createPaymentSession(env.STRIPE_SECRET, {
        priceId,
        successUrl: `${site}/success.html?session_id={CHECKOUT_SESSION_ID}&credits=1`,
        cancelUrl: `${site}/account.html`,
        email: user.email,
        // The webhook credits by these — user_id avoids an email-matching race.
        metadata: { kind: 'credits', user_id: user.id, credit_micros: String(def.micros) },
      });
      return ok({ url: session.url, id: session.id });
    }

    // ---- billing: recent credit movements (for the account page) ----
    if (p === '/v1/billing/ledger' && method === 'GET') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      const entries = await store.listLedger(user.id, 50);
      return ok({ entries });
    }

    // ---- billing: success page fetches the issued license key ----
    if (p === '/v1/billing/session' && method === 'GET') {
      const id = url.searchParams.get('session_id');
      if (!id) return err('session_id required');
      const s = await stripe.getCheckoutSession(env.STRIPE_SECRET, id);
      const customer = typeof s.customer === 'string' ? s.customer : s.customer?.id;
      let user = customer ? await store.getUserByCustomer(customer) : null;
      if (!user && s.customer_details?.email) user = await store.getUserByEmail(s.customer_details.email.toLowerCase());
      if (!user) return ok({ pending: true, message: 'Activation in progress — refresh in a moment.' });
      return ok({ pending: false, ...publicUser(user) });
    }

    // ---- billing: manage/cancel via Stripe portal ----
    if (p === '/v1/billing/portal' && method === 'POST') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      if (!user.stripe_customer) return err('no billing account', 400);
      const site = env.SITE_URL || 'https://attentify.ai';
      const s = await stripe.createPortalSession(env.STRIPE_SECRET, { customer: user.stripe_customer, returnUrl: `${site}/account.html` });
      return ok({ url: s.url });
    }

    // ---- Stripe webhooks ----
    if (p === '/v1/webhooks/stripe' && method === 'POST') {
      const payload = await request.text();
      const sigOk = await verifyStripeSig(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
      if (!sigOk) return err('bad signature', 400);
      const evt = JSON.parse(payload);
      if (await store.seenEvent(evt.id)) return ok({ duplicate: true });
      await handleStripeEvent(store, evt);
      await store.markEvent(evt.id);
      return ok({ received: true });
    }

    // ---- account: who am I ----
    if (p === '/v1/me' && method === 'GET') {
      const user = await authUser(request, store);
      if (!user) return err('invalid license key', 401);
      return ok({ user: publicUser(user) });
    }

    // ---- AI proxy: non-streaming (context engine) ----
    if (p === '/v1/ai/json' && method === 'POST') {
      const gate = await gateAI(request, store);
      if (gate.error) return err(gate.error, gate.status, gate.reason ? { reason: gate.reason } : {});
      const { system, input, model } = await readJson(request);
      const out = await aiJson(env, { system, input, model }, clientOf(request));
      await settleAI(store, gate, out.model, out.inputTokens, out.outputTokens);
      return ok(out);
    }

    // ---- AI passthrough: Anthropic-compatible /v1/messages (used by the desktop app SDK) ----
    // Forwards the full request (incl. tools) to the provider, metering real cost. Streams
    // when the body asks to; otherwise returns the provider's JSON verbatim.
    if (p === '/v1/messages' && method === 'POST') {
      const gate = await gateAI(request, store);
      if (gate.error) return err(gate.error, gate.status, gate.reason ? { reason: gate.reason } : {});
      const bodyObj = await readJson(request);
      const out = await aiProxy(env, bodyObj, clientOf(request));
      if (out.kind === 'stream') {
        const settle = out.usage.then(u => settleAI(store, gate, u.model, u.inputTokens, u.outputTokens)).catch(() => {});
        if (ctx && ctx.waitUntil) ctx.waitUntil(settle);
        return new Response(out.stream, { status: out.status, headers: { 'Content-Type': 'text/event-stream; charset=utf-8', ...CORS } });
      }
      await settleAI(store, gate, out.usage.model, out.usage.inputTokens, out.usage.outputTokens);
      return new Response(out.body, { status: out.status, headers: { 'Content-Type': 'application/json', ...CORS } });
    }

    // ---- AI proxy: streaming chat ----
    if (p === '/v1/ai/chat' && method === 'POST') {
      const gate = await gateAI(request, store);
      if (gate.error) return err(gate.error, gate.status, gate.reason ? { reason: gate.reason } : {});
      const { system, messages, model } = await readJson(request);
      const { status, stream, usage } = await aiChatStream(env, { system, messages, model }, clientOf(request));
      // Settle the true cost once the stream completes, off the response path.
      const settle = usage.then(u => settleAI(store, gate, u.model, u.inputTokens, u.outputTokens)).catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(settle);
      return new Response(stream, {
        status,
        headers: { 'Content-Type': 'text/event-stream; charset=utf-8', ...CORS },
      });
    }

    // ---- managed auto-blocking rules (cloud) ----
    if (p === '/v1/rules' && method === 'GET') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      if (!TIERS[tierOf(user)].managedRules) return ok({ rules: [], tier: tierOf(user) });
      const custom = await store.managedRulesFor(user.id);
      return ok({ rules: [...SEED_RULES, ...custom], tier: tierOf(user) });
    }
    if (p === '/v1/rules' && method === 'POST') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      if (!TIERS[tierOf(user)].managedRules) return err('cloud tier required', 402);
      const { rule } = await readJson(request);
      if (!rule || !rule.domain || !Array.isArray(rule.selectors)) return err('invalid rule');
      const r = { id: newId('rule'), user_id: user.id, rule: { ...rule, enabled: true }, created_at: Date.now() };
      await store.insertManagedRule(r);
      return ok({ id: r.id });
    }

    // ---- analytics ingest (cloud) ----
    if (p === '/v1/analytics' && method === 'POST') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      if (!TIERS[tierOf(user)].analytics) return ok({ skipped: 'free tier' });
      const { events } = await readJson(request);
      let n = 0;
      for (const e of (Array.isArray(events) ? events : []).slice(0, 200)) {
        if (!e || !e.type) continue;
        await store.insertEvent({ user_id: user.id, type: e.type, domain: e.domain, label: e.label, value: e.value, meta: e.meta, ts: e.ts || Date.now() });
        n++;
      }
      return ok({ stored: n });
    }
    if (p === '/v1/analytics/summary' && method === 'GET') {
      const user = await authUser(request, store);
      if (!user) return err('unauthorized', 401);
      if (!TIERS[tierOf(user)].analytics) return err('cloud tier required', 402);
      const days = Math.min(90, Math.max(1, +(url.searchParams.get('days') || 30)));
      const summary = await store.analyticsSummary(user.id, Date.now() - days * 86400000);
      return ok({ days, ...summary });
    }

    // ---- diagnostics (unauthenticated: installs identified by anonymous install_id) ----
    if (p === '/v1/issues' && method === 'POST') {
      const { install_id, version, issues } = await readJson(request);
      let n = 0;
      for (const i of (Array.isArray(issues) ? issues : []).slice(0, 50)) {
        if (!i || !i.id || !i.kind) continue;
        try { await store.insertIssue({ ...i, install_id, version }); n++; } catch { /* skip bad row */ }
      }
      return ok({ stored: n });
    }
    if (p === '/v1/usage' && method === 'POST') {
      const { install_id, stats } = await readJson(request);
      if (!install_id) return err('install_id required');
      let n = 0;
      for (const s of (Array.isArray(stats) ? stats : []).slice(0, 300)) {
        if (!s || !s.day || !s.model) continue;
        try { await store.upsertUsage(install_id, s); n++; } catch { /* skip */ }
      }
      return ok({ stored: n });
    }

    // ---- admin ----
    if (p.startsWith('/v1/admin/')) {
      if (!isAdmin(request, env)) return err('forbidden', 403);
      return adminRoutes(p, method, request, url, store);
    }

    return err('not found', 404);
  } catch (e) {
    return err(e.message || 'server error', 500);
  }
}

// ── AI gating (subscription fair-use OR credit balance) ──────────────────────────
async function gateAI(request, store) {
  const user = await authUser(request, store);
  if (!user) return { error: 'invalid license key', status: 401 };
  if (user.status !== 'active') return { error: 'subscription inactive', status: 402, reason: 'inactive' };
  if (isSubscriber(user)) {
    const su = subUsageState(user);
    if (su.remaining <= 0) return { error: 'monthly fair-use limit reached', status: 429, reason: 'fair_use' };
    return { user, mode: 'sub', su };
  }
  if ((user.credit_micros || 0) <= 0) return { error: 'out of credit', status: 402, reason: 'out_of_credit' };
  return { user, mode: 'credit' };
}

// Record the true cost of a completed call. Subscribers accrue against the fair-use
// ceiling; everyone else is debited (cost × markup) from their credit balance. Never
// throws into the caller — accounting must not break a successful response.
async function settleAI(store, gate, model, inputTokens, outputTokens) {
  const cost = costMicros(model, inputTokens, outputTokens);
  if (cost <= 0) return;
  try {
    if (gate.mode === 'sub') {
      const su = subUsageState(gate.user);
      await store.updateUser(gate.user.id, { sub_used_micros: su.used + cost, sub_period_start: su.periodStart });
      await store.addLedger({ user_id: gate.user.id, kind: 'debit', micros: -cost, balance_after: gate.user.credit_micros || 0, model });
    } else {
      const after = await store.debitCredits(gate.user.id, debitMicros(cost));
      await store.addLedger({ user_id: gate.user.id, kind: 'debit', micros: -debitMicros(cost), balance_after: after, model });
    }
  } catch { /* ignore accounting failure */ }
}

// ── Stripe event handling ────────────────────────────────────────────────────────
async function handleStripeEvent(store, evt) {
  const o = evt.data?.object || {};
  switch (evt.type) {
    case 'checkout.session.completed': {
      // One-time credit-pack purchase: credit the balance the metadata points at.
      if (o.mode === 'payment' && o.metadata?.kind === 'credits') {
        const uid = o.metadata.user_id;
        const micros = parseInt(o.metadata.credit_micros, 10) || 0;
        if (uid && micros > 0) {
          const user = await store.getUserById(uid);
          if (user) {
            const after = await store.addCredits(uid, micros);
            await store.addLedger({ user_id: uid, kind: 'purchase', micros, balance_after: after });
          }
        }
        return;
      }
      const email = (o.customer_details?.email || o.customer_email || '').toLowerCase();
      const customer = typeof o.customer === 'string' ? o.customer : o.customer?.id;
      const sub = typeof o.subscription === 'string' ? o.subscription : o.subscription?.id;
      if (!email) return;
      let user = await store.getUserByEmail(email);
      if (!user) user = await createUser(store, { email, tier: 'cloud', source: 'stripe', stripe_customer: customer, stripe_sub: sub });
      else await store.updateUser(user.id, { tier: 'cloud', status: 'active', stripe_customer: customer, stripe_sub: sub });
      return;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const customer = typeof o.customer === 'string' ? o.customer : o.customer?.id;
      const user = await store.getUserByCustomer(customer) || await store.getUserBySub(o.id);
      if (!user) return;
      const active = ['active', 'trialing'].includes(o.status);
      await store.updateUser(user.id, {
        tier: active ? 'cloud' : 'free',
        status: active ? 'active' : (o.status === 'past_due' ? 'past_due' : 'canceled'),
        stripe_sub: o.id,
        current_period_end: o.current_period_end ? o.current_period_end * 1000 : null,
      });
      return;
    }
    case 'customer.subscription.deleted': {
      const customer = typeof o.customer === 'string' ? o.customer : o.customer?.id;
      const user = await store.getUserByCustomer(customer) || await store.getUserBySub(o.id);
      if (user) await store.updateUser(user.id, { tier: 'free', status: 'canceled' });
      return;
    }
  }
}

// ── admin routes ────────────────────────────────────────────────────────────────
async function adminRoutes(p, method, request, url, store) {
  // token usage + cost, broken down by model (the admin token panel)
  if (p === '/v1/admin/usage' && method === 'GET') {
    const days = url.searchParams.get('days');
    const sinceDay = days ? new Date(Date.now() - (+days) * 86400000).toISOString().split('T')[0] : undefined;
    const byModel = await store.usageByModel({ sinceDay });
    const totals = byModel.reduce((a, m) => ({
      cost_usd: a.cost_usd + (m.cost_usd || 0),
      input_tokens: a.input_tokens + (m.input_tokens || 0),
      output_tokens: a.output_tokens + (m.output_tokens || 0),
      calls: a.calls + (m.calls || 0),
    }), { cost_usd: 0, input_tokens: 0, output_tokens: 0, calls: 0 });
    return ok({ byModel, byDay: await store.usageByDay({ days: 30 }), totals });
  }
  // uploaded issues (bugs, crashes, freezes, AI-friction)
  if (p === '/v1/admin/issues' && method === 'GET') {
    const limit = Math.min(500, Math.max(1, +(url.searchParams.get('limit') || 200)));
    const kind = url.searchParams.get('kind') || undefined;
    return ok({ issues: await store.listIssues({ limit, kind }) });
  }
  // give someone a free or comped-cloud account
  if (p === '/v1/admin/grant' && method === 'POST') {
    const { email, tier = 'free', days } = await readJson(request);
    if (!email) return err('email required');
    let user = await store.getUserByEmail(String(email).toLowerCase());
    const cpe = days ? Date.now() + days * 86400000 : null;
    if (!user) user = await createUser(store, { email, tier, source: 'admin', current_period_end: cpe });
    else await store.updateUser(user.id, { tier, status: 'active', current_period_end: cpe });
    const fresh = await store.getUserByEmail(String(email).toLowerCase());
    return ok({ user: publicUser(fresh), granted: tier });
  }
  if (p === '/v1/admin/set-tier' && method === 'POST') {
    const { email, tier } = await readJson(request);
    const user = await store.getUserByEmail(String(email || '').toLowerCase());
    if (!user) return err('user not found', 404);
    await store.updateUser(user.id, { tier: TIERS[tier] ? tier : 'free' });
    return ok({ email: user.email, tier });
  }
  if (p === '/v1/admin/revoke' && method === 'POST') {
    const { email } = await readJson(request);
    const user = await store.getUserByEmail(String(email || '').toLowerCase());
    if (!user) return err('user not found', 404);
    await store.updateUser(user.id, { tier: 'free', status: 'canceled' });
    return ok({ email: user.email, revoked: true });
  }
  // add/remove credit balance for support (usd can be negative to deduct)
  if (p === '/v1/admin/credit' && method === 'POST') {
    const { email, usd } = await readJson(request);
    const user = await store.getUserByEmail(String(email || '').toLowerCase());
    if (!user) return err('user not found', 404);
    const micros = Math.round((Number(usd) || 0) * 1_000_000);
    const after = micros >= 0 ? await store.addCredits(user.id, micros) : await store.debitCredits(user.id, -micros);
    await store.addLedger({ user_id: user.id, kind: 'adjust', micros, balance_after: after });
    return ok({ email: user.email, balanceMicros: after });
  }
  if (p === '/v1/admin/lookup' && method === 'GET') {
    const email = url.searchParams.get('email');
    const user = email ? await store.getUserByEmail(email.toLowerCase()) : null;
    if (!user) return err('user not found', 404);
    return ok({ user: { ...publicUser(user), id: user.id, source: user.source, stripe_customer: user.stripe_customer } });
  }
  if (p === '/v1/admin/users' && method === 'GET') {
    const limit = Math.min(500, +(url.searchParams.get('limit') || 100));
    const users = await store.listUsers(limit);
    return ok({ count: users.length, users: users.map(publicUser) });
  }
  return err('unknown admin route', 404);
}
