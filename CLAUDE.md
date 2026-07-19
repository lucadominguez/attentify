# Attentify platform (this repo = `attentify`)

## Product
Everything around the Windows desktop app: the cloud backend (accounts, metered
AI proxy, billing), the Chromium extension (surgical element blocking, works
fully standalone incl. Mac), and the marketing/app website. Free blocking;
AI is paid (trial credits → $9.99/mo unlimited or pay-as-you-go credit packs).

## Layout
- `backend/` — Cloudflare Worker `attentify-cloud` (src/index.js router,
  ai.js proxy, stripe.js, store.js over D1 `pd-cloud`, R2 `pd-downloads`).
  Migrations in `backend/migrations/`; tests in `backend/test/` (fake store +
  mocked network, real router).
- `extension/` — MV3, plain JS, **no build step**. `background.js` (service
  worker: rules, AI routing, accounts), `content.js` (scanner/blocker),
  `popup.*`. `config.js` is gitignored and must NEVER ship.
- `website/` — static, deployed to Cloudflare Pages project
  `productivity-daemon` (public name will move to `attentify.ca` after the DNS
  cutover). `website/ext/attentify-extension.zip` is the shipped extension.

## Canonical commands (verified)
- Backend tests: `cd backend && node --test` (keep `test/fake-store.mjs` method
  parity with `store.js` when adding store methods)
- Backend deploy: `cd backend && npx wrangler deploy`
- Website deploy: `npx wrangler pages deploy website
  --project-name=productivity-daemon --branch=main`
- Extension "build": rebuild the zip from exactly 7 files (background.js,
  config.example.js, content.js, manifest.json, popup.css, popup.html,
  popup.js) — PowerShell `Compress-Archive` (no zip/7z on this machine).
- Stripe provisioning: `backend/scripts/setup-stripe.mjs` (idempotent).

## Billing model invariants
- Balances are integer **micro-USD**; users see **credits** (1 = $0.001).
  Debit = real provider cost × 1.25 (`MARKUP_NUM/DEN`) — never surface the
  markup. Subscribers accrue against a hidden $8/mo fair-use ceiling instead.
- All client AI goes through the worker: `/v1/messages` (Anthropic-compatible
  passthrough, accepts `x-api-key`) or `/v1/ai/*`. Two provider keys chosen by
  `X-Attentify-Client` header (`app`/`ext`); keys exist ONLY as wrangler
  secrets. OpenRouter account currently serves **DeepSeek only**.
- Trial: $0.25 once per email AND per device fingerprint (`trial_grants`).
  Turnstile is enforced for **web** signups only (app/ext use the fingerprint).
- Stripe is **LIVE mode**. Price IDs in `wrangler.toml [vars]`; webhook credits
  packs via metadata `user_id` + `credit_micros`. Webhook idempotency via
  `processed_events`.

## Hard-won rules
- **Version-bump or it didn't ship**: the extension updater compares
  `manifest.json` versions — a rebuilt zip with the same version is invisible.
  Bump BOTH `extension/manifest.json` and `website/ext/manifest.json`.
- After a Pages/worker deploy, verify the **live** URL with a cache-busted GET
  (`?cb=…`). The deployed worker once sat months stale while local looked fine.
- `wrangler r2 object put` needs `--remote` (v4 defaults to local).
  `GET /download/win` is GET-only — HEAD 404s; verify with a real GET.
- Extension JS check: `node --check <file>` before shipping (no bundler exists
  to catch anything). Never write `*/` inside a CSS comment (it terminates the
  comment and can corrupt `:root` custom properties → invisible elements).
- No em dashes in user-facing copy (rewrite the sentence). Carve-outs: demo
  window titles in `website/app/pd-web-shim.js` `ev(...)` rows and the compiled
  TITLE_SUFFIX regexes — they intentionally contain em dashes.
- Search/SERP pages must never be auto-hidden/auto-blocked (both the daemon
  classifier and `content.js` `isSearchResultsPage()` enforce this).
- Never log per-page/debug events into the popup's "What Attentify did" feed.

## Definition of done
Committed + pushed (`origin master`) + deployed (worker and/or Pages as
affected) + live-verified + tracker updated. Extension changes additionally:
zip rebuilt + versions bumped.

## Pointers
- Live work tracker: `../OUTSTANDING.md` (in `Desktop/AI/`, outside this repo) —
  read at session start, update at end. Session transcripts: `../claude-logs/`.
- Domain plan: launch on `attentify.ca` (registered, NOT yet on Cloudflare);
  don't move consumer URLs off `attentify-cloud.ludomi2502.workers.dev` /
  `productivity-daemon.pages.dev` until the zone is live (tracker item D1).

Context verified against commit `efa832e` on 2026-07-19.
