// In-memory implementation of the D1Store method surface, for unit tests.
export class FakeStore {
  constructor() { this.users = []; this.events = []; this.rules = []; this.processed = new Set(); this.sessions = []; this.ledger = []; this.fingerprints = new Set(); }

  async getUserByLicense(k) { return this.users.find(u => u.license_key === k) || null; }
  async getUserById(id) { return this.users.find(u => u.id === id) || null; }
  async getUserByEmail(e) { return this.users.find(u => u.email === e) || null; }
  async getUserByCustomer(c) { return c ? (this.users.find(u => u.stripe_customer === c) || null) : null; }
  async getUserBySub(s) { return s ? (this.users.find(u => u.stripe_sub === s) || null) : null; }
  async insertUser(u) { this.users.push({ ...u }); return u; }

  async setPassword(userId, hash, salt) {
    const u = this.users.find(x => x.id === userId);
    if (u) { u.password_hash = hash; u.password_salt = salt; u.updated_at = Date.now(); }
  }
  async createSession(s) { this.sessions.push({ ...s }); return s; }
  async getUserBySession(tok, now = Date.now()) {
    const s = this.sessions.find(x => x.token === tok && x.expires_at > now);
    return s ? (this.users.find(u => u.id === s.user_id) || null) : null;
  }
  async deleteSession(tok) { this.sessions = this.sessions.filter(x => x.token !== tok); }
  async deleteSessionsForUser(userId) { this.sessions = this.sessions.filter(x => x.user_id !== userId); }
  async updateUser(id, patch) {
    const u = this.users.find(x => x.id === id);
    if (u) Object.assign(u, patch, { updated_at: Date.now() });
  }
  async listUsers(limit = 100) { return this.users.slice().sort((a, b) => b.created_at - a.created_at).slice(0, limit); }

  async debitCredits(userId, micros) {
    const u = this.users.find(x => x.id === userId);
    if (u) u.credit_micros = Math.max(0, (u.credit_micros || 0) - micros);
    return u ? u.credit_micros : 0;
  }
  async addCredits(userId, micros) {
    const u = this.users.find(x => x.id === userId);
    if (u) u.credit_micros = (u.credit_micros || 0) + micros;
    return u ? u.credit_micros : 0;
  }
  async addLedger(e) { this.ledger.push({ ...e, ts: e.ts || Date.now() }); }
  async listLedger(userId, limit = 50) { return this.ledger.filter(l => l.user_id === userId).slice(-limit).reverse(); }
  async fingerprintGranted(fp) { return this.fingerprints.has(fp); }
  async recordFingerprint(fp) { this.fingerprints.add(fp); }

  async insertEvent(e) { this.events.push({ ...e }); }
  async analyticsSummary(userId, since) {
    const ev = this.events.filter(e => e.user_id === userId && e.ts >= since);
    const by = (key) => { const m = {}; for (const e of ev) { const k = e[key]; if (k == null) continue; m[k] = (m[k] || 0) + 1; } return m; };
    const totals = Object.entries(by('type')).map(([type, n]) => ({ type, n }));
    const topDomains = Object.entries(by('domain')).map(([domain, n]) => ({ domain, n })).sort((a, b) => b.n - a.n).slice(0, 10);
    const days = {}; for (const e of ev) { const d = Math.floor(e.ts / 86400000); days[d] = (days[d] || 0) + 1; }
    const byDay = Object.entries(days).map(([day, n]) => ({ day: +day, n }));
    return { totals, topDomains, byDay };
  }

  async managedRulesFor(userId) {
    return this.rules.filter(r => (r.user_id == null || r.user_id === userId) && r.enabled)
      .map(r => ({ ...r.rule, _id: r.id }));
  }
  async insertManagedRule(r) { this.rules.push({ ...r, enabled: 1 }); }

  async seenEvent(id) { return this.processed.has(id); }
  async markEvent(id) { this.processed.add(id); }
}
