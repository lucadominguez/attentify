// D1-backed data access. Every query the Worker needs lives here so the router can
// be tested against an in-memory fake with the same method surface.

export class D1Store {
  constructor(db) { this.db = db; }

  async getUserByLicense(key) {
    return this.db.prepare('SELECT * FROM users WHERE license_key = ?').bind(key).first();
  }
  async getUserById(id) {
    return this.db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
  }
  async getUserByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  }

  // ── Password + sessions (website auth) ──────────────────────────────────────
  async setPassword(userId, hash, salt) {
    await this.db.prepare('UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?')
      .bind(hash, salt, Date.now(), userId).run();
  }
  async createSession(s) {
    await this.db.prepare('INSERT INTO sessions (token,user_id,created_at,expires_at,user_agent) VALUES (?,?,?,?,?)')
      .bind(s.token, s.user_id, s.created_at, s.expires_at, s.user_agent ?? null).run();
    return s;
  }
  async getUserBySession(tokenStr, now = Date.now()) {
    const row = await this.db.prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > ?`
    ).bind(tokenStr, now).first();
    return row || null;
  }
  async deleteSession(tokenStr) {
    await this.db.prepare('DELETE FROM sessions WHERE token = ?').bind(tokenStr).run();
  }
  async deleteSessionsForUser(userId) {
    await this.db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();
  }
  async getUserByCustomer(customer) {
    return this.db.prepare('SELECT * FROM users WHERE stripe_customer = ?').bind(customer).first();
  }
  async getUserBySub(sub) {
    return this.db.prepare('SELECT * FROM users WHERE stripe_sub = ?').bind(sub).first();
  }

  async insertUser(u) {
    await this.db.prepare(
      `INSERT INTO users (id,email,license_key,tier,status,source,stripe_customer,stripe_sub,
        current_period_end,ai_calls_used,ai_period_start,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(u.id, u.email, u.license_key, u.tier, u.status, u.source, u.stripe_customer ?? null,
      u.stripe_sub ?? null, u.current_period_end ?? null, u.ai_calls_used ?? 0,
      u.ai_period_start ?? 0, u.created_at, u.updated_at).run();
    return u;
  }

  async updateUser(id, patch) {
    const keys = Object.keys(patch);
    if (!keys.length) return;
    const set = keys.map(k => `${k} = ?`).join(', ');
    await this.db.prepare(`UPDATE users SET ${set}, updated_at = ? WHERE id = ?`)
      .bind(...keys.map(k => patch[k]), Date.now(), id).run();
  }

  async listUsers(limit = 100) {
    const r = await this.db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ?').bind(limit).all();
    return r.results || [];
  }

  // ── Credit balance + ledger ─────────────────────────────────────────────────
  // Atomic, never-negative debit: the MAX(0, …) clamp means concurrent calls that
  // both passed the >0 gate can at worst slightly over-serve, never overdraw.
  async debitCredits(userId, micros) {
    await this.db.prepare('UPDATE users SET credit_micros = MAX(0, credit_micros - ?), updated_at = ? WHERE id = ?')
      .bind(micros, Date.now(), userId).run();
    const row = await this.db.prepare('SELECT credit_micros FROM users WHERE id = ?').bind(userId).first();
    return row ? row.credit_micros : 0;
  }
  async addCredits(userId, micros) {
    await this.db.prepare('UPDATE users SET credit_micros = credit_micros + ?, updated_at = ? WHERE id = ?')
      .bind(micros, Date.now(), userId).run();
    const row = await this.db.prepare('SELECT credit_micros FROM users WHERE id = ?').bind(userId).first();
    return row ? row.credit_micros : 0;
  }
  async addLedger(e) {
    await this.db.prepare(
      'INSERT INTO credit_ledger (user_id,ts,kind,micros,balance_after,model,meta) VALUES (?,?,?,?,?,?,?)'
    ).bind(e.user_id, e.ts || Date.now(), e.kind, e.micros | 0, e.balance_after ?? null,
      e.model ?? null, e.meta ? JSON.stringify(e.meta) : null).run();
  }
  async listLedger(userId, limit = 50) {
    const r = await this.db.prepare('SELECT * FROM credit_ledger WHERE user_id = ? ORDER BY ts DESC LIMIT ?')
      .bind(userId, limit).all();
    return r.results || [];
  }

  // ── Trial anti-abuse: one grant per device fingerprint ──────────────────────
  async fingerprintGranted(fp) {
    const row = await this.db.prepare('SELECT fingerprint FROM trial_grants WHERE fingerprint = ?').bind(fp).first();
    return !!row;
  }
  async recordFingerprint(fp, userId) {
    await this.db.prepare('INSERT OR IGNORE INTO trial_grants (fingerprint,user_id,ts) VALUES (?,?,?)')
      .bind(fp, userId, Date.now()).run();
  }

  async insertEvent(e) {
    await this.db.prepare('INSERT INTO events (user_id,type,domain,label,value,meta,ts) VALUES (?,?,?,?,?,?,?)')
      .bind(e.user_id, e.type, e.domain ?? null, e.label ?? null, e.value ?? null,
        e.meta ? JSON.stringify(e.meta) : null, e.ts).run();
  }

  async analyticsSummary(userId, sinceTs) {
    const totals = await this.db.prepare(
      'SELECT type, COUNT(*) AS n FROM events WHERE user_id = ? AND ts >= ? GROUP BY type'
    ).bind(userId, sinceTs).all();
    const topDomains = await this.db.prepare(
      `SELECT domain, COUNT(*) AS n FROM events WHERE user_id = ? AND ts >= ? AND domain IS NOT NULL
       GROUP BY domain ORDER BY n DESC LIMIT 10`
    ).bind(userId, sinceTs).all();
    const byDay = await this.db.prepare(
      `SELECT CAST(ts/86400000 AS INTEGER) AS day, COUNT(*) AS n FROM events
       WHERE user_id = ? AND ts >= ? GROUP BY day ORDER BY day`
    ).bind(userId, sinceTs).all();
    return { totals: totals.results || [], topDomains: topDomains.results || [], byDay: byDay.results || [] };
  }

  async managedRulesFor(userId) {
    const r = await this.db.prepare(
      'SELECT * FROM managed_rules WHERE (user_id IS NULL OR user_id = ?) AND enabled = 1'
    ).bind(userId).all();
    return (r.results || []).map(row => ({ ...JSON.parse(row.rule), _id: row.id }));
  }
  async insertManagedRule(r) {
    await this.db.prepare('INSERT INTO managed_rules (id,user_id,rule,enabled,created_at) VALUES (?,?,?,1,?)')
      .bind(r.id, r.user_id ?? null, JSON.stringify(r.rule), r.created_at).run();
  }

  async seenEvent(id) {
    const row = await this.db.prepare('SELECT id FROM processed_events WHERE id = ?').bind(id).first();
    return !!row;
  }
  async markEvent(id) {
    await this.db.prepare('INSERT OR IGNORE INTO processed_events (id,ts) VALUES (?,?)').bind(id, Date.now()).run();
  }

  // ── Diagnostics: issues + usage ──────────────────────────────────────────────
  async insertIssue(i) {
    await this.db.prepare(
      `INSERT OR REPLACE INTO issues (id,install_id,version,ts,kind,category,severity,title,description,context,status,received_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      i.id, i.install_id ?? null, i.version ?? null, i.ts || Date.now(),
      i.kind || 'bug_manual', i.category ?? null, i.severity ?? 'medium',
      (i.title || '').slice(0, 300), (i.description || '').slice(0, 6000),
      i.context != null ? JSON.stringify(i.context).slice(0, 40000) : null,
      'open', Date.now()
    ).run();
  }
  async listIssues({ limit = 200, kind } = {}) {
    const r = kind
      ? await this.db.prepare('SELECT * FROM issues WHERE kind = ? ORDER BY ts DESC LIMIT ?').bind(kind, limit).all()
      : await this.db.prepare('SELECT * FROM issues ORDER BY ts DESC LIMIT ?').bind(limit).all();
    return (r.results || []).map(row => ({ ...row, context: row.context ? safeParse(row.context) : null }));
  }
  async upsertUsage(installId, stat) {
    await this.db.prepare(
      `INSERT INTO usage (install_id,day,model,input_tokens,output_tokens,cost_usd,calls,updated_at)
       VALUES (?,?,?,?,?,?,?,?)
       ON CONFLICT(install_id,day,model) DO UPDATE SET
         input_tokens = excluded.input_tokens,
         output_tokens = excluded.output_tokens,
         cost_usd = excluded.cost_usd,
         calls = excluded.calls,
         updated_at = excluded.updated_at`
    ).bind(installId, stat.day, stat.model,
      stat.input_tokens || 0, stat.output_tokens || 0, stat.cost_usd || 0, stat.calls || 0, Date.now()).run();
  }
  async usageByModel({ sinceDay } = {}) {
    const r = sinceDay
      ? await this.db.prepare(
          `SELECT model, SUM(input_tokens) input_tokens, SUM(output_tokens) output_tokens,
                  SUM(cost_usd) cost_usd, SUM(calls) calls, COUNT(DISTINCT install_id) installs
           FROM usage WHERE day >= ? GROUP BY model ORDER BY cost_usd DESC`).bind(sinceDay).all()
      : await this.db.prepare(
          `SELECT model, SUM(input_tokens) input_tokens, SUM(output_tokens) output_tokens,
                  SUM(cost_usd) cost_usd, SUM(calls) calls, COUNT(DISTINCT install_id) installs
           FROM usage GROUP BY model ORDER BY cost_usd DESC`).all();
    return r.results || [];
  }
  async usageByDay({ days = 30 } = {}) {
    const r = await this.db.prepare(
      `SELECT day, SUM(cost_usd) cost_usd, SUM(input_tokens+output_tokens) tokens, SUM(calls) calls
       FROM usage GROUP BY day ORDER BY day DESC LIMIT ?`).bind(days).all();
    return r.results || [];
  }
}

function safeParse(s) { try { return JSON.parse(s); } catch { return s; } }
