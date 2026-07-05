#!/usr/bin/env node
// Provisions everything Stripe needs for the Cloud tier, idempotently:
//   • a "Attentify Cloud" product
//   • a $5.00 / month recurring Price (lookup_key: pd_cloud_monthly)
//   • (optional) a webhook endpoint → <worker>/v1/webhooks/stripe
//
// Usage:
//   STRIPE_SECRET=rk_live_xxx [WORKER_URL=https://xxx.workers.dev] node scripts/setup-stripe.mjs
//
// Best practice (per the Stripe skill): use a RESTRICTED key (rk_) with only
// Checkout Sessions + Billing Portal (write), Customers + Subscriptions + Prices +
// Products + Webhook Endpoints (write/read) — not a full secret key.

const SECRET = process.env.STRIPE_SECRET;
const WORKER = (process.env.WORKER_URL || '').replace(/\/$/, '');
const API = 'https://api.stripe.com/v1';
const VERSION = '2026-05-27.dahlia';
const LOOKUP = 'pd_cloud_monthly';
const EVENTS = ['checkout.session.completed', 'customer.subscription.updated', 'customer.subscription.deleted', 'customer.subscription.created'];

if (!SECRET) { console.error('✗ Set STRIPE_SECRET (a restricted key rk_… is recommended).'); process.exit(1); }
if (!/^(sk|rk)_/.test(SECRET)) { console.error('✗ STRIPE_SECRET should start with rk_ (restricted, preferred) or sk_.'); process.exit(1); }

function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => out.append(`${key}[${i}]`, item));
    else if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}
async function stripe(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': VERSION },
    body: body ? form(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status} ${data?.error?.message || JSON.stringify(data)}`);
  return data;
}

(async () => {
  const mode = SECRET.includes('_test_') || SECRET.includes('_test') ? 'TEST' : 'LIVE';
  console.log(`→ Stripe ${mode} mode\n`);

  // 1. Price (idempotent via lookup_key) — reuse if it already exists.
  let price;
  const existing = await stripe('GET', `/prices?lookup_keys[0]=${LOOKUP}&active=true&limit=1`);
  if (existing.data?.length) {
    price = existing.data[0];
    console.log(`✓ Reusing existing price ${price.id} ($${(price.unit_amount / 100).toFixed(2)}/${price.recurring?.interval})`);
  } else {
    const product = await stripe('POST', '/products', {
      name: 'Attentify Cloud',
      description: 'Managed AI (no API key needed), automatic site blocking, and analytics.',
    });
    price = await stripe('POST', '/prices', {
      product: product.id, currency: 'usd', unit_amount: 500,
      recurring: { interval: 'month' }, lookup_key: LOOKUP,
      metadata: { app: 'attentify', tier: 'cloud' },
    });
    console.log(`✓ Created product ${product.id}`);
    console.log(`✓ Created price   ${price.id}  ($5.00/month)`);
  }

  // 2. Webhook endpoint (optional — needs the deployed Worker URL).
  let whSecret = null;
  if (WORKER) {
    const url = `${WORKER}/v1/webhooks/stripe`;
    const list = await stripe('GET', '/webhook_endpoints?limit=100');
    const found = list.data?.find(w => w.url === url);
    if (found) {
      console.log(`✓ Webhook already configured (${found.id}) — signing secret not re-shown by Stripe.`);
      console.log(`  If you don't have it saved, roll it in the Dashboard and re-set STRIPE_WEBHOOK_SECRET.`);
    } else {
      const wh = await stripe('POST', '/webhook_endpoints', { url, enabled_events: EVENTS, api_version: VERSION });
      whSecret = wh.secret;
      console.log(`✓ Created webhook ${wh.id} → ${url}`);
    }
  }

  // 3. Next steps
  console.log('\n──────────────────────────────────────────────');
  console.log('Put this in wrangler.toml  →  [vars] STRIPE_PRICE_ID:');
  console.log(`   ${price.id}`);
  if (whSecret) {
    console.log('\nSet the webhook signing secret as a Worker secret:');
    console.log(`   wrangler secret put STRIPE_WEBHOOK_SECRET   # paste: ${whSecret}`);
  } else if (!WORKER) {
    console.log('\n(Re-run with WORKER_URL=https://<your-worker>.workers.dev to create the webhook too.)');
  }
  console.log('──────────────────────────────────────────────');
})().catch(e => { console.error('✗', e.message); process.exit(1); });
