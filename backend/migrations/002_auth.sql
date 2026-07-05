-- Migration 002 — website auth (email/password + sessions).
-- Apply to an EXISTING deployment that predates auth:
--   wrangler d1 execute pd-cloud --remote --file=./migrations/002_auth.sql
-- (Fresh installs get these from schema.sql instead; run only one of the two.)

ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN password_salt TEXT;

CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_exp  ON sessions(expires_at);
