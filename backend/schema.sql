-- Attentify — Cloud backend schema (Cloudflare D1 / SQLite)
-- Apply locally:  wrangler d1 execute pd-cloud --local --file=./schema.sql
-- Apply remote:   wrangler d1 execute pd-cloud --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,            -- usr_xxx
  email             TEXT UNIQUE NOT NULL,
  license_key       TEXT UNIQUE NOT NULL,        -- pd_live_xxx — pasted into the app
  tier              TEXT NOT NULL DEFAULT 'free', -- 'free' | 'cloud'
  status            TEXT NOT NULL DEFAULT 'active', -- 'active' | 'past_due' | 'canceled'
  source            TEXT NOT NULL DEFAULT 'self',  -- 'self' | 'stripe' | 'admin'
  stripe_customer   TEXT,
  stripe_sub        TEXT,
  current_period_end INTEGER,                    -- epoch ms; for comped accounts too
  ai_calls_used     INTEGER NOT NULL DEFAULT 0,
  ai_period_start   INTEGER NOT NULL DEFAULT 0,  -- epoch ms; legacy call-count window (no longer gates)
  -- Credit-balance billing. Balance is micro-USD (1 micro = $0.000001); users see it
  -- as "credits" (1 credit = $0.001). Subscribers draw against a fair-use ceiling
  -- (sub_used_micros) instead of the balance.
  credit_micros     INTEGER NOT NULL DEFAULT 0,
  trial_granted     INTEGER NOT NULL DEFAULT 0,
  sub_used_micros   INTEGER NOT NULL DEFAULT 0,
  sub_period_start  INTEGER NOT NULL DEFAULT 0,
  -- Password auth for website sign-in. Nullable: Stripe/admin-created users may not
  -- have set one yet — they can add it via /v1/auth/set-password. PBKDF2-SHA256
  -- (100k iterations); salt + hash stored as hex.
  password_hash     TEXT,
  password_salt     TEXT,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_license  ON users(license_key);
CREATE INDEX IF NOT EXISTS idx_users_customer ON users(stripe_customer);

-- Website login sessions. Token is the Bearer credential the browser holds; it is
-- separate from the license_key (which the desktop app uses). Both authenticate.
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,     -- ses_xxx
  user_id    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,     -- epoch ms
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expires_at);

-- Analytics / telemetry events (mispredictions, blocks, distraction reads, bug reports)
CREATE TABLE IF NOT EXISTS events (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id   TEXT NOT NULL,
  type      TEXT NOT NULL,        -- 'block' | 'misprediction' | 'distraction' | 'bug' | 'context'
  domain    TEXT,
  label     TEXT,
  value     REAL,                 -- e.g. distraction probability, count
  meta      TEXT,                 -- JSON blob
  ts        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id, ts);

-- Per-user managed blocking rules synced down to the app (the cloud "automatic
-- site blocking" feature). Seeded with curated rules; AI/admin can add more.
CREATE TABLE IF NOT EXISTS managed_rules (
  id         TEXT PRIMARY KEY,    -- rule_xxx
  user_id    TEXT,                -- NULL = global/curated rule served to all cloud users
  rule       TEXT NOT NULL,       -- JSON rule object {id,domain,displayName,selectors,...}
  enabled    INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rules_user ON managed_rules(user_id);

-- Idempotency for Stripe webhook events
CREATE TABLE IF NOT EXISTS processed_events (
  id  TEXT PRIMARY KEY,
  ts  INTEGER NOT NULL
);

-- Every credit movement (grant/purchase/debit/refund/adjust), for the account page + auditing.
CREATE TABLE IF NOT EXISTS credit_ledger (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL,
  ts            INTEGER NOT NULL,
  kind          TEXT NOT NULL,
  micros        INTEGER NOT NULL,       -- signed: credits +, debits -
  balance_after INTEGER,
  model         TEXT,
  meta          TEXT
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON credit_ledger(user_id, ts);

-- One trial grant per device/install fingerprint (anti-abuse; paired with per-email uniqueness).
CREATE TABLE IF NOT EXISTS trial_grants (
  fingerprint TEXT PRIMARY KEY,
  user_id     TEXT,
  ts          INTEGER NOT NULL
);

-- ── Diagnostics (beta self-improvement pipeline) ───────────────────────────────
-- Issues uploaded by installs: manual bug reports, auto crash/freeze captures, and
-- AI-detected friction. Identified by an anonymous install_id (no PII required).
CREATE TABLE IF NOT EXISTS issues (
  id          TEXT PRIMARY KEY,       -- issue id from the client
  install_id  TEXT,
  version     TEXT,
  ts          INTEGER NOT NULL,
  kind        TEXT NOT NULL,          -- bug_manual | crash | freeze | ai_friction
  category    TEXT,
  severity    TEXT,
  title       TEXT,
  description TEXT,
  context     TEXT,                   -- JSON blob
  status      TEXT NOT NULL DEFAULT 'open',
  received_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_issues_ts ON issues(ts);
CREATE INDEX IF NOT EXISTS idx_issues_kind ON issues(kind);

-- Per-install, per-model, per-day token usage + cost. Powers the admin token panel.
CREATE TABLE IF NOT EXISTS usage (
  install_id    TEXT NOT NULL,
  day           TEXT NOT NULL,        -- YYYY-MM-DD
  model         TEXT NOT NULL,
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd      REAL NOT NULL DEFAULT 0,
  calls         INTEGER NOT NULL DEFAULT 0,
  updated_at    INTEGER NOT NULL,
  PRIMARY KEY (install_id, day, model)
);
CREATE INDEX IF NOT EXISTS idx_usage_model ON usage(model);
CREATE INDEX IF NOT EXISTS idx_usage_day ON usage(day);
