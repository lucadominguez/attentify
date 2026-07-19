#!/usr/bin/env node
// Provisions everything Stripe needs, idempotently:
//   • an "Attentify Cloud" product + a $9.99/month recurring Price (lookup: attentify_cloud_monthly)
//   • an "Attentify Credits" product + three one-time Prices: $5 / $10 / $20
//     (lookups: attentify_credits_5/10/20; each carries credit_micros in metadata)
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
const LOOKUP = 'attentify_cloud_monthly';
// $5/$10/$20 packs → face-value micro-USD credited on purchase (markup is applied at debit time).
const CREDIT_PACKS = [
  { usd: 5,  micros: 5_000_000,  lookup: 'attentify_credits_5',  varName: 'STRIPE_PRICE_CREDITS_5'  },
  { usd: 10, micros: 10_000_000, lookup: 'attentify_credits_10', varName: 'STRIPE_PRICE_CREDITS_10' },
  { usd: 20, micros: 20_000_000, lookup: 'attentify_credits_20', varName: 'STRIPE_PRICE_CREDITS_20' },
];
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

  // Reuse a price by lookup_key if present, else create product+price.
  async function ensurePrice(lookup, make) {
    const existing = await stripe('GET', `/prices?lookup_keys[0]=${lookup}&active=true&limit=1`);
    if (existing.data?.length) { console.log(`✓ Reusing price ${existing.data[0].id} (${lookup})`); return existing.data[0]; }
    return make();
  }

  // 1. $9.99/month subscription price.
  const price = await ensurePrice(LOOKUP, async () => {
    const product = await stripe('POST', '/products', {
      name: 'Attentify Cloud',
      description: 'Unlimited managed AI, more custom analytics, automatic site blocking.',
    });
    const pr = await stripe('POST', '/prices', {
      product: product.id, currency: 'usd', unit_amount: 999,
      recurring: { interval: 'month' }, lookup_key: LOOKUP,
      metadata: { app: 'attentify', tier: 'cloud' },
    });
    console.log(`✓ Created subscription price ${pr.id}  ($9.99/month)`);
    return pr;
  });

  // 2. One-time credit packs.
  let creditsProduct = null;
  const packPrices = [];
  for (const pk of CREDIT_PACKS) {
    const pr = await ensurePrice(pk.lookup, async () => {
      if (!creditsProduct) creditsProduct = await stripe('POST', '/products', {
        name: 'Attentify Credits', description: 'Pay-as-you-go AI credits.',
      });
      const p = await stripe('POST', '/prices', {
        product: creditsProduct.id, currency: 'usd', unit_amount: pk.usd * 100,
        lookup_key: pk.lookup, metadata: { app: 'attentify', kind: 'credits', credit_micros: String(pk.micros) },
      });
      console.log(`✓ Created credit price ${p.id}  ($${pk.usd})`);
      return p;
    });
    packPrices.push({ ...pk, id: pr.id });
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
  console.log('Put these in wrangler.toml  →  [vars]:');
  console.log(`   STRIPE_PRICE_ID = "${price.id}"`);
  for (const p of packPrices) console.log(`   ${p.varName} = "${p.id}"`);
  if (whSecret) {
    console.log('\nSet the webhook signing secret as a Worker secret:');
    console.log(`   wrangler secret put STRIPE_WEBHOOK_SECRET   # paste: ${whSecret}`);
  } else if (!WORKER) {
    console.log('\n(Re-run with WORKER_URL=https://<your-worker>.workers.dev to create the webhook too.)');
  }
  console.log('──────────────────────────────────────────────');
})().catch(e => { console.error('✗', e.message); process.exit(1); });
