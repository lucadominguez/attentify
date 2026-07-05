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
}
