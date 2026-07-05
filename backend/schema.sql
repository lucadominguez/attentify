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
  ai_period_start   INTEGER NOT NULL DEFAULT 0,  -- epoch ms; quota window start
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
