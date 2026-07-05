# Attentify — Cloud backend

A single Cloudflare Worker + D1 database that powers the **$5/mo Cloud tier**:

- **Accounts** keyed by a pasteable license key (`pd_live_…`).
- **Stripe billing** — checkout, customer portal, signed webhooks.
- **Managed AI proxy** — Cloud users call `/v1/ai/*` and the model works with no API
  key of their own (the provider key lives only in this Worker). Free users get a small
  quota; Cloud gets a large monthly quota.
- **Managed auto-site-blocking** — curated + per-user rules synced down to the app.
- **Analytics** — the extension streams block/distraction/misprediction events; the
  Cloud tier can read a summary.
- **Admin API + CLI** — grant/comp accounts (free or cloud), list, look up, revoke.

It's tiny, serverless, and costs ~$0–5/mo to run. Everything local-first still works
without it — this only backs the optional Cloud features.

```
backend/
  src/index.js     router + Stripe events + admin
  src/store.js     D1 data access (swapped for an in-memory fake in tests)
  src/stripe.js    Stripe over fetch + webhook signature verification
  src/ai.js        OpenRouter proxy (json + streaming) + seed managed rules
  src/util.js      ids, license keys, tiers, quota, responses
  schema.sql       D1 schema
  wrangler.toml    Worker + D1 + vars
  scripts/admin.mjs  admin CLI
  test/            node --test suite (in-memory store, mocked Stripe/OpenRouter)
```

## API

| Method & path | Auth | Purpose |
|---|---|---|
| `GET /v1/health` | — | health check |
| `POST /v1/billing/checkout` | — | start a $5/mo Stripe Checkout → `{ url }` |
| `GET /v1/billing/session?session_id=` | — | success page fetches the issued license key |
| `POST /v1/billing/portal` | Bearer | Stripe billing portal (manage/cancel) → `{ url }` |
| `POST /v1/webhooks/stripe` | Stripe sig | subscription lifecycle → provisions/updates users |
| `GET /v1/me` | Bearer | `{ user: { tier, status, aiRemaining, … } }` |
| `POST /v1/ai/json` | Bearer | non-streaming managed AI (context engine) |
| `POST /v1/ai/chat` | Bearer | streaming managed AI (chat) |
| `GET /v1/rules` | Bearer | managed auto-blocking rules (Cloud) |
| `POST /v1/rules` | Bearer | add a managed rule (Cloud) |
| `POST /v1/analytics` | Bearer | ingest events (Cloud) |
| `GET /v1/analytics/summary?days=` | Bearer | analytics summary (Cloud) |
| `POST /v1/admin/grant` | X-Admin-Token | create/comp an account → returns license key |
| `POST /v1/admin/set-tier` · `/revoke` | X-Admin-Token | change/cancel a user |
| `GET /v1/admin/users` · `/lookup?email=` | X-Admin-Token | list / inspect |

`Bearer` = the user's license key in `Authorization: Bearer pd_live_…`.

## Setup (one-time)

```bash
cd backend
npm install                       # installs wrangler
npx wrangler login                # authenticate to your Cloudflare account

# 1. Create the database and paste the returned id into wrangler.toml
npx wrangler d1 create pd-cloud
npm run db:init                   # apply schema.sql to the remote DB
npm run db:init:local             # (and the local one for `wrangler dev`)

# 2. Secrets (prod). For local dev, put these in .dev.vars instead.
npx wrangler secret put OPENROUTER_KEY          # provider key for managed AI
npx wrangler secret put STRIPE_SECRET           # sk_live_… / sk_test_…
npx wrangler secret put STRIPE_WEBHOOK_SECRET   # whsec_… (step 4)
npx wrangler secret put ADMIN_TOKEN             # long random string

# 3. Provision Stripe automatically (creates the $5/mo product + price, idempotent).
#    Use a RESTRICTED key (rk_…) — least privilege — not a full sk_ secret key.
STRIPE_SECRET=rk_test_xxx node scripts/setup-stripe.mjs
#    → prints the price_id; paste it into wrangler.toml [vars] STRIPE_PRICE_ID

# 4. Deploy, then wire the webhook (the script can create it for you once deployed):
npm run deploy
STRIPE_SECRET=rk_test_xxx WORKER_URL=https://<your-worker>.workers.dev node scripts/setup-stripe.mjs
#    → prints the webhook signing secret → wrangler secret put STRIPE_WEBHOOK_SECRET → redeploy
#    Stripe dashboard → Developers → Webhooks → add endpoint:
#      https://<your-worker>.workers.dev/v1/webhooks/stripe
#    events: checkout.session.completed, customer.subscription.updated,
#            customer.subscription.deleted
#    copy the signing secret → wrangler secret put STRIPE_WEBHOOK_SECRET → redeploy
```

Finally, point the clients at the deployed Worker URL:
- Extension: `extension/background.js` → `CLOUD_API_DEFAULT` (or set per-user via the
  `set:cloud-api` message).
- Website: `website/app.js`, `success.html`, `account.html` → the `CLOUD_API` / `API` const.

## Local dev

```bash
cp .dev.vars.example .dev.vars     # fill in test keys
npm run db:init:local
npm run dev                        # wrangler dev → http://127.0.0.1:8787
npm test                           # logic tests (no network/account needed)
```

Use Stripe **test mode** keys + `stripe listen --forward-to localhost:8787/v1/webhooks/stripe`
to exercise the full purchase flow locally.

## Admin / giving people a free tier

```bash
export PD_API=https://<your-worker>.workers.dev
export PD_ADMIN_TOKEN=<the ADMIN_TOKEN you set>

node scripts/admin.mjs grant friend@example.com --tier cloud --days 365   # comp a year of Cloud
node scripts/admin.mjs grant beta@example.com                              # free-tier account
node scripts/admin.mjs users                                              # list everyone
node scripts/admin.mjs lookup friend@example.com
node scripts/admin.mjs set-tier friend@example.com free
node scripts/admin.mjs revoke spammer@example.com
```

`grant` prints the license key to hand to the user.

## Tiers & quota

| | Free | Cloud ($5/mo) |
|---|---|---|
| Managed AI calls / month | 60 (a taste) | 60,000 |
| Managed auto-blocking rules | — | ✓ |
| Analytics | — | ✓ |

Quota is a rolling 30-day window per user, enforced in the AI proxy.

## Security notes (validated against the Stripe best-practices skill)

- **Use a restricted Stripe key (`rk_…`), not `sk_…`.** Least privilege: grant only
  Checkout Sessions + Billing Portal (write), and Products/Prices/Customers/Subscriptions/
  Webhook Endpoints (as needed). A leaked RAK can do far less than a full secret key.
- **Secrets never live in source.** They're set via `wrangler secret put` (encrypted) and
  `.dev.vars` is git-ignored. Don't commit keys — repo exposure is the top cause of leaks.
- **Stripe webhooks are signature-verified** (HMAC-SHA256 via Web Crypto) and de-duplicated.
  For defense in depth you can also allowlist Stripe's IPs on the endpoint.
- **No `payment_method_types`** is sent on checkout — dynamic payment methods are enabled,
  configurable from the Stripe Dashboard (better conversion).
- **API version pinned** to `2026-05-27.dahlia` so behavior can't drift unexpectedly.
- License keys are bearer tokens stored in D1 (not hashed) so the success page and support
  can retrieve them — acceptable here; they grant only metered AI + the user's own data,
  never payment ability. Rotate by re-issuing if one leaks.
- The provider AI key never leaves the Worker — clients only ever send their license key.
- Admin routes require the long, secret `ADMIN_TOKEN` header.
