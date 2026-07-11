// Attentify — Cloud backend (Cloudflare Worker)
//
// One small Worker fronts: accounts (license keys), Stripe billing for the $5/mo
// Cloud tier, a managed AI proxy (so paying users need no key), analytics ingest,
// managed auto-blocking rules, and an admin API. The router is exported separately
// so it can be unit-tested with an in-memory store + mocked fetch.

import { D1Store } from './store.js';
import {
  json, ok, err, newId, newLicense, readJson, CORS, TIERS, tierOf, quotaState, publicUser,
  hashPassword, verifyPassword, newSessionToken, isEmail, isSessionToken, SESSION_TTL_MS,
} from './util.js';
import { stripe, verifyStripeSig } from './stripe.js';
import { aiJson, aiChatStream, SEED_RULES } from './ai.js';

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
  return h.startsWith('Bearer ') ? h.slice(7).trim() : '';
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

async function createUser(store, { email, tier = 'free', source = 'self', stripe_customer, stripe_sub, current_period_end }) {
  const now = Date.now();
  const u = {
    id: newId('usr'), email: String(email).toLowerCase().trim(), license_key: newLicense(),
    tier, status: 'active', source, stripe_customer, stripe_sub, current_period_end,
    ai_calls_used: 0, ai_period_start: now, created_at: now, updated_at: now,
  };
  await store.insertUser(u);
  return u;
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
      const { email, password } = await readJson(request);
      const em = String(email || '').toLowerCase().trim();
      if (!isEmail(em)) return err('a valid email is required');
      if (!password || String(password).length < 8) return err('password must be at least 8 characters');
      if (await store.getUserByEmail(em)) return err('an account with this email already exists', 409);
      const user = await createUser(store, { email: em, tier: 'free', source: 'self' });
      const { hash, salt } = await hashPassword(String(password));
      await store.setPassword(user.id, hash, salt);
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

    // ---- billing: start a $5/mo Cloud checkout ----
    if (p === '/v1/billing/checkout' && method === 'POST') {
      const { email } = await readJson(request);
      const site = env.SITE_URL || 'https://attentify.ai';
      const session = await stripe.createCheckoutSession(env.STRIPE_SECRET, {
        priceId: env.STRIPE_PRICE_ID,
        successUrl: `${site}/success.html?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${site}/#pricing`,
        email,
      });
      return ok({ url: session.url, id: session.id });
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
      if (gate.error) return err(gate.error, gate.status);
      const { system, input, model } = await readJson(request);
      const out = await aiJson(env, { system, input, model });
      await bumpAI(store, gate.user);
      return ok(out);
    }

    // ---- AI proxy: streaming chat ----
    if (p === '/v1/ai/chat' && method === 'POST') {
      const gate = await gateAI(request, store);
      if (gate.error) return err(gate.error, gate.status);
      const { system, messages, model } = await readJson(request);
      const upstream = await aiChatStream(env, { system, messages, model });
      await bumpAI(store, gate.user);
      return new Response(upstream.body, {
        status: upstream.status,
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

// ── AI gating (tier + monthly quota) ─────────────────────────────────────────────
async function gateAI(request, store) {
  const user = await authUser(request, store);
  if (!user) return { error: 'invalid license key', status: 401 };
  if (user.status !== 'active') return { error: 'subscription inactive', status: 402 };
  const q = quotaState(user);
  if (q.remaining <= 0) return { error: `AI quota reached for the ${tierOf(user)} tier`, status: 429 };
  return { user };
}
async function bumpAI(store, user) {
  const q = quotaState(user);
  await store.updateUser(user.id, { ai_calls_used: q.used + 1, ai_period_start: q.periodStart });
}

// ── Stripe event handling ────────────────────────────────────────────────────────
async function handleStripeEvent(store, evt) {
  const o = evt.data?.object || {};
  switch (evt.type) {
    case 'checkout.session.completed': {
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
