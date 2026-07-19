-- Migration 003 — credit-balance billing model.
-- Apply to an EXISTING deployment:
--   wrangler d1 execute pd-cloud --remote --file=./migrations/003_credits.sql
-- (Fresh installs get these from schema.sql instead; run only one of the two.)

ALTER TABLE users ADD COLUMN credit_micros    INTEGER NOT NULL DEFAULT 0;  -- balance in micro-USD (1 micro = $0.000001)
ALTER TABLE users ADD COLUMN trial_granted    INTEGER NOT NULL DEFAULT 0;  -- 1 once the $0.25 trial has been granted
ALTER TABLE users ADD COLUMN sub_used_micros  INTEGER NOT NULL DEFAULT 0;  -- subscriber fair-use spend this window
ALTER TABLE users ADD COLUMN sub_period_start INTEGER NOT NULL DEFAULT 0;  -- epoch ms; fair-use window start

-- Every credit movement, for the account page + auditing.
CREATE TABLE IF NOT EXISTS credit_ledger (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       TEXT NOT NULL,
  ts            INTEGER NOT NULL,
  kind          TEXT NOT NULL,          -- grant | purchase | debit | refund | adjust
  micros        INTEGER NOT NULL,       -- signed: credits are +, debits are -
  balance_after INTEGER,
  model         TEXT,                   -- model that incurred a debit, if any
  meta          TEXT                    -- JSON blob
);
CREATE INDEX IF NOT EXISTS idx_ledger_user ON credit_ledger(user_id, ts);

-- One trial grant per device/install fingerprint (blocks farming free credit by
-- re-signing-up). Paired with per-email uniqueness on users.
CREATE TABLE IF NOT EXISTS trial_grants (
  fingerprint TEXT PRIMARY KEY,
  user_id     TEXT,
  ts          INTEGER NOT NULL
);
