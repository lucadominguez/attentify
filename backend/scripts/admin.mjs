#!/usr/bin/env node
// Admin CLI for the Attentify cloud backend.
//
//   PD_API=https://...workers.dev  PD_ADMIN_TOKEN=xxx  node scripts/admin.mjs <cmd>
//
// Commands:
//   grant <email> [--tier free|cloud] [--days N]   create/comp an account, prints license key
//   set-tier <email> <free|cloud>                  change a user's tier
//   revoke <email>                                 drop a user to free + canceled
//   lookup <email>                                 show a user
//   users [--limit N]                              list recent users

const API = (process.env.PD_API || 'http://127.0.0.1:8787').replace(/\/$/, '');
const TOKEN = process.env.PD_ADMIN_TOKEN || '';
if (!TOKEN) { console.error('Set PD_ADMIN_TOKEN (and optionally PD_API).'); process.exit(1); }

const args = process.argv.slice(2);
const cmd = args[0];
const flag = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };

async function call(method, path, body) {
  const res = await fetch(API + path, {
    method,
    headers: { 'X-Admin-Token': TOKEN, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) { console.error('✗', res.status, data.error || data); process.exit(1); }
  return data;
}

const out = (d) => console.log(JSON.stringify(d, null, 2));

switch (cmd) {
  case 'grant': {
    const email = args[1]; if (!email) bail('grant <email> [--tier] [--days]');
    const r = await call('POST', '/v1/admin/grant', { email, tier: flag('tier', 'free'), days: flag('days') ? +flag('days') : undefined });
    console.log(`✓ Granted ${r.granted} to ${email}`);
    console.log(`  License key: ${r.user.license_key}`);
    break;
  }
  case 'set-tier': {
    const [, email, tier] = args; if (!email || !tier) bail('set-tier <email> <free|cloud>');
    out(await call('POST', '/v1/admin/set-tier', { email, tier })); break;
  }
  case 'revoke': {
    const email = args[1]; if (!email) bail('revoke <email>');
    out(await call('POST', '/v1/admin/revoke', { email })); break;
  }
  case 'lookup': {
    const email = args[1]; if (!email) bail('lookup <email>');
    out(await call('GET', '/v1/admin/lookup?email=' + encodeURIComponent(email))); break;
  }
  case 'users': {
    const r = await call('GET', '/v1/admin/users?limit=' + (flag('limit', '100')));
    console.log(`${r.count} user(s):`);
    for (const u of r.users) console.log(`  ${u.email.padEnd(28)} ${u.tier.padEnd(6)} ${u.status.padEnd(9)} ${u.license_key}`);
    break;
  }
  default:
    bail('grant | set-tier | revoke | lookup | users');
}

function bail(usage) { console.error('Usage: node scripts/admin.mjs ' + usage); process.exit(1); }
