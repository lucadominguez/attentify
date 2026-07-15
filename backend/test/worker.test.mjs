// End-to-end logic tests for the Worker router using an in-memory store and mocked
// Stripe + OpenRouter network. Run with: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { router } from '../src/index.js';
import { FakeStore } from './fake-store.mjs';

const ENV = {
  STRIPE_SECRET: 'sk_test_x', STRIPE_PRICE_ID: 'price_x', STRIPE_WEBHOOK_SECRET: 'whsec_test',
  ADMIN_TOKEN: 'admintok', OPENROUTER_KEY: 'sk-or-x', SITE_URL: 'https://site.test',
};

// ---- mock fetch for Stripe + OpenRouter ----
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (url.includes('api.stripe.com/v1/checkout/sessions/')) {
    return jres({ id: 'cs_1', customer: 'cus_1', subscription: 'sub_1', customer_details: { email: 'buyer@x.com' } });
  }
  if (url.endsWith('api.stripe.com/v1/checkout/sessions')) {
    return jres({ id: 'cs_1', url: 'https://checkout.stripe/cs_1' });
  }
  if (url.includes('api.stripe.com/v1/billing_portal/sessions')) {
    return jres({ url: 'https://billing.stripe/portal' });
  }
  if (url.includes('openrouter.ai')) {
    return jres({ content: [{ text: '{"intent":"coding","distractionProbability":0.1}' }] });
  }
  throw new Error('unexpected fetch ' + url);
};
const jres = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });

// helpers
const req = (method, path, { body, headers } = {}) =>
  new Request('https://api.test' + path, {
    method, headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
const call = async (store, method, path, opts) => {
  const res = await router(req(method, path, opts), ENV, store);
  return { status: res.status, body: await res.json().catch(() => ({})) };
};
const admin = (extra = {}) => ({ headers: { 'X-Admin-Token': 'admintok' }, ...extra });
const bearer = (k, extra = {}) => ({ ...extra, headers: { Authorization: 'Bearer ' + k, ...(extra.headers || {}) } });

test('health check', async () => {
  const s = new FakeStore();
  const r = await call(s, 'GET', '/v1/health');
  assert.equal(r.status, 200); assert.equal(r.body.ok, true);
});

test('admin grant free → /v1/me reflects free tier', async () => {
  const s = new FakeStore();
  const g = await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'A@X.com' } }));
  assert.equal(g.body.granted, 'free');
  const key = g.body.user.license_key;
  assert.match(key, /^pd_live_/);
  const me = await call(s, 'GET', '/v1/me', bearer(key));
  assert.equal(me.status, 200);
  assert.equal(me.body.user.tier, 'free');
  assert.equal(me.body.user.email, 'a@x.com'); // normalized lowercase
});

test('admin endpoints require the admin token', async () => {
  const s = new FakeStore();
  const r = await call(s, 'POST', '/v1/admin/grant', { body: { email: 'b@x.com' } });
  assert.equal(r.status, 403);
});

test('cloud grant unlocks managed rules; free gets none', async () => {
  const s = new FakeStore();
  const cloud = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'c@x.com', tier: 'cloud' } }))).body.user.license_key;
  const free = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'd@x.com' } }))).body.user.license_key;
  const cr = await call(s, 'GET', '/v1/rules', bearer(cloud));
  assert.ok(cr.body.rules.length >= 5, 'cloud gets seed rules');
  const fr = await call(s, 'GET', '/v1/rules', bearer(free));
  assert.equal(fr.body.rules.length, 0, 'free gets no managed rules');
});

test('AI proxy works for cloud user and increments quota', async () => {
  const s = new FakeStore();
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'e@x.com', tier: 'cloud' } }))).body.user.license_key;
  const r = await call(s, 'POST', '/v1/ai/json', bearer(key, { body: { system: 'sys', input: 'hi' } }));
  assert.equal(r.status, 200);
  assert.match(r.body.text, /intent/);
  const me = await call(s, 'GET', '/v1/me', bearer(key));
  assert.equal(me.body.user.aiUsed, 1);
});

test('AI quota is enforced (free tier)', async () => {
  const s = new FakeStore();
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'f@x.com' } }))).body.user.license_key;
  // exhaust the free quota directly
  const u = await s.getUserByLicense(key);
  u.ai_calls_used = 60; u.ai_period_start = Date.now();
  const r = await call(s, 'POST', '/v1/ai/json', bearer(key, { body: { input: 'hi' } }));
  assert.equal(r.status, 429);
});

test('invalid license key is rejected', async () => {
  const s = new FakeStore();
  const r = await call(s, 'GET', '/v1/me', bearer('pd_live_nope'));
  assert.equal(r.status, 401);
});

test('billing checkout returns a Stripe URL', async () => {
  const s = new FakeStore();
  const r = await call(s, 'POST', '/v1/billing/checkout', { body: { email: 'buy@x.com' } });
  assert.equal(r.status, 200);
  assert.match(r.body.url, /checkout\.stripe/);
});

test('Stripe webhook (valid signature) provisions a cloud user', async () => {
  const s = new FakeStore();
  const payload = JSON.stringify({
    id: 'evt_1', type: 'checkout.session.completed',
    data: { object: { customer: 'cus_9', subscription: 'sub_9', customer_details: { email: 'paid@x.com' } } },
  });
  const t = Math.floor(Date.now() / 1000);
  const sig = await hmac(`${t}.${payload}`, ENV.STRIPE_WEBHOOK_SECRET);
  const res = await router(new Request('https://api.test/v1/webhooks/stripe', {
    method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${sig}` }, body: payload,
  }), ENV, s);
  assert.equal(res.status, 200);
  const u = await s.getUserByEmail('paid@x.com');
  assert.ok(u, 'user provisioned'); assert.equal(u.tier, 'cloud'); assert.equal(u.stripe_customer, 'cus_9');
  // duplicate event is ignored
  const dup = await router(new Request('https://api.test/v1/webhooks/stripe', {
    method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${sig}` }, body: payload,
  }), ENV, s);
  assert.equal((await dup.json()).duplicate, true);
});

test('Stripe webhook with bad signature is rejected', async () => {
  const s = new FakeStore();
  const res = await router(new Request('https://api.test/v1/webhooks/stripe', {
    method: 'POST', headers: { 'Stripe-Signature': 't=1,v1=deadbeef' }, body: '{}',
  }), ENV, s);
  assert.equal(res.status, 400);
});

test('subscription canceled webhook downgrades to free', async () => {
  const s = new FakeStore();
  // provision via grant with a known customer id
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'g@x.com', tier: 'cloud' } }))).body.user.license_key;
  const u = await s.getUserByLicense(key); u.stripe_customer = 'cus_g';
  const payload = JSON.stringify({ id: 'evt_2', type: 'customer.subscription.deleted', data: { object: { id: 'sub_g', customer: 'cus_g', status: 'canceled' } } });
  const t = Math.floor(Date.now() / 1000);
  const sig = await hmac(`${t}.${payload}`, ENV.STRIPE_WEBHOOK_SECRET);
  await router(new Request('https://api.test/v1/webhooks/stripe', { method: 'POST', headers: { 'Stripe-Signature': `t=${t},v1=${sig}` }, body: payload }), ENV, s);
  const after = await s.getUserByEmail('g@x.com');
  assert.equal(after.tier, 'free'); assert.equal(after.status, 'canceled');
});

test('analytics ingest + summary for cloud user', async () => {
  const s = new FakeStore();
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'h@x.com', tier: 'cloud' } }))).body.user.license_key;
  const ing = await call(s, 'POST', '/v1/analytics', bearer(key, { body: { events: [
    { type: 'block', domain: 'youtube.com' }, { type: 'block', domain: 'youtube.com' }, { type: 'misprediction', domain: 'x.com' },
  ] } }));
  assert.equal(ing.body.stored, 3);
  const sum = await call(s, 'GET', '/v1/analytics/summary?days=30', bearer(key));
  assert.equal(sum.status, 200);
  const blocks = sum.body.totals.find(t => t.type === 'block');
  assert.equal(blocks.n, 2);
  assert.equal(sum.body.topDomains[0].domain, 'youtube.com');
});

test('analytics summary blocked for free tier (402)', async () => {
  const s = new FakeStore();
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'i@x.com' } }))).body.user.license_key;
  const r = await call(s, 'GET', '/v1/analytics/summary', bearer(key));
  assert.equal(r.status, 402);
});

test('admin users list + lookup', async () => {
  const s = new FakeStore();
  await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'j@x.com', tier: 'cloud' } }));
  const list = await call(s, 'GET', '/v1/admin/users', admin());
  assert.ok(list.body.count >= 1);
  const look = await call(s, 'GET', '/v1/admin/lookup?email=j@x.com', admin());
  assert.equal(look.body.user.tier, 'cloud');
});

// ── Website auth (email/password + sessions) ──────────────────────────────────
test('signup creates a user and returns a working session token', async () => {
  const s = new FakeStore();
  const r = await call(s, 'POST', '/v1/auth/signup', { body: { email: 'New@X.com', password: 'hunter2hunter' } });
  assert.equal(r.status, 200);
  assert.match(r.body.token, /^ses_/);
  assert.equal(r.body.user.email, 'new@x.com');
  assert.equal(r.body.user.tier, 'free');
  // session token authenticates protected routes just like a license key
  const me = await call(s, 'GET', '/v1/me', bearer(r.body.token));
  assert.equal(me.status, 200);
  assert.equal(me.body.user.email, 'new@x.com');
  // /v1/auth/session restores the login
  const sess = await call(s, 'GET', '/v1/auth/session', bearer(r.body.token));
  assert.equal(sess.status, 200);
  assert.equal(sess.body.user.email, 'new@x.com');
});

test('signup rejects weak passwords and duplicate emails', async () => {
  const s = new FakeStore();
  const weak = await call(s, 'POST', '/v1/auth/signup', { body: { email: 'a@b.com', password: 'short' } });
  assert.equal(weak.status, 400);
  await call(s, 'POST', '/v1/auth/signup', { body: { email: 'dup@x.com', password: 'longenough1' } });
  const dup = await call(s, 'POST', '/v1/auth/signup', { body: { email: 'dup@x.com', password: 'longenough1' } });
  assert.equal(dup.status, 409);
});

test('login succeeds with correct password, fails otherwise', async () => {
  const s = new FakeStore();
  await call(s, 'POST', '/v1/auth/signup', { body: { email: 'log@x.com', password: 'correcthorse' } });
  const good = await call(s, 'POST', '/v1/auth/login', { body: { email: 'log@x.com', password: 'correcthorse' } });
  assert.equal(good.status, 200);
  assert.match(good.body.token, /^ses_/);
  const bad = await call(s, 'POST', '/v1/auth/login', { body: { email: 'log@x.com', password: 'wrongpass1' } });
  assert.equal(bad.status, 401);
  const noUser = await call(s, 'POST', '/v1/auth/login', { body: { email: 'ghost@x.com', password: 'whatever12' } });
  assert.equal(noUser.status, 401);
});

test('logout invalidates the session', async () => {
  const s = new FakeStore();
  const tok = (await call(s, 'POST', '/v1/auth/signup', { body: { email: 'out@x.com', password: 'password123' } })).body.token;
  await call(s, 'POST', '/v1/auth/logout', bearer(tok));
  const me = await call(s, 'GET', '/v1/me', bearer(tok));
  assert.equal(me.status, 401);
});

test('a license-key user can set a password and then log in with it', async () => {
  const s = new FakeStore();
  const key = (await call(s, 'POST', '/v1/admin/grant', admin({ body: { email: 'lic@x.com', tier: 'cloud' } }))).body.user.license_key;
  const setp = await call(s, 'POST', '/v1/auth/set-password', bearer(key, { body: { password: 'brandnewpass' } }));
  assert.equal(setp.status, 200);
  const login = await call(s, 'POST', '/v1/auth/login', { body: { email: 'lic@x.com', password: 'brandnewpass' } });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.tier, 'cloud');
});

// helper: HMAC-SHA256 hex (Web Crypto, available in Node 18+)
async function hmac(data, secret) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Social sign-in (OAuth) ───────────────────────────────────────────────────────
// Raw-response call so we can inspect redirect status + Location.
const callRaw = (store, method, path, env = ENV, opts) => router(req(method, path, opts), env, store);
const GENV = { ...ENV, GOOGLE_CLIENT_ID: 'gid', GOOGLE_CLIENT_SECRET: 'gsecret' };

test('providers endpoint reflects configured credentials', async () => {
  const s = new FakeStore();
  const none = await call(s, 'GET', '/v1/auth/providers');
  assert.deepEqual(none.body.providers, []);
  const res = await callRaw(s, 'GET', '/v1/auth/providers', GENV);
  const body = await res.json();
  assert.deepEqual(body.providers, ['google']);
});

test('oauth start redirects to the provider with a signed state', async () => {
  const s = new FakeStore();
  const cb = 'http://127.0.0.1:53112/cb';
  const res = await callRaw(s, 'GET', `/v1/auth/oauth/google/start?cb=${encodeURIComponent(cb)}&nonce=abc`, GENV);
  assert.equal(res.status, 302);
  const loc = new URL(res.headers.get('location'));
  assert.equal(loc.origin + loc.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
  assert.equal(loc.searchParams.get('client_id'), 'gid');
  assert.match(loc.searchParams.get('redirect_uri'), /\/v1\/auth\/oauth\/google\/callback$/);
  assert.ok(loc.searchParams.get('state').includes('.'), 'state is signed');
});

test('oauth start rejects a non-loopback callback', async () => {
  const s = new FakeStore();
  const res = await callRaw(s, 'GET', '/v1/auth/oauth/google/start?cb=https://evil.com/cb&nonce=abc', GENV);
  assert.equal(res.status, 400);
});

test('oauth start 404s for an unconfigured provider', async () => {
  const s = new FakeStore();
  const res = await callRaw(s, 'GET', '/v1/auth/oauth/google/start?cb=http://127.0.0.1:5/cb&nonce=a', ENV);
  assert.equal(res.status, 404);
});

test('oauth callback exchanges the code, upserts the user, and returns the token to loopback', async () => {
  const s = new FakeStore();
  const cb = 'http://127.0.0.1:53112/cb';
  // Drive a real start to get a valid signed state.
  const start = await callRaw(s, 'GET', `/v1/auth/oauth/google/start?cb=${encodeURIComponent(cb)}&nonce=xyz`, GENV);
  const state = new URL(start.headers.get('location')).searchParams.get('state');

  // Mock Google's token + userinfo endpoints for this test only.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    url = String(url);
    if (url === 'https://oauth2.googleapis.com/token') return jres({ access_token: 'gat_1', token_type: 'Bearer' });
    if (url === 'https://openidconnect.googleapis.com/v1/userinfo') return jres({ email: 'Social@Example.com', email_verified: true });
    return realFetch(url, init);
  };
  try {
    const res = await callRaw(s, 'GET', `/v1/auth/oauth/google/callback?code=CODE&state=${encodeURIComponent(state)}`, GENV);
    assert.equal(res.status, 302);
    const loc = new URL(res.headers.get('location'));
    assert.equal(loc.origin + loc.pathname, cb);
    assert.equal(loc.searchParams.get('nonce'), 'xyz');
    const token = loc.searchParams.get('token');
    assert.ok(token && token.startsWith('ses_'), 'a session token is returned');
    // The user was created (email lowercased) and the session resolves to them.
    const sess = await call(s, 'GET', '/v1/auth/session', bearer(token));
    assert.equal(sess.status, 200);
    assert.equal(sess.body.user.email, 'social@example.com');
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('oauth callback with a tampered state shows the close page (no redirect)', async () => {
  const s = new FakeStore();
  const res = await callRaw(s, 'GET', '/v1/auth/oauth/google/callback?code=C&state=forged.deadbeef', GENV);
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/html/);
});
