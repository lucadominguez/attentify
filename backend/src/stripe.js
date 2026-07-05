// Minimal Stripe client over fetch (no SDK — keeps the Worker tiny) + webhook
// signature verification using Web Crypto (available in Workers & Node 18+).

const API = 'https://api.stripe.com/v1';
const STRIPE_VERSION = '2026-05-27.dahlia';   // pin to the latest API version (best practice)

function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v == null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

async function call(secret, method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${String(secret).trim()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': STRIPE_VERSION,
    },
    body: body ? form(body).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `Stripe ${res.status}`);
  return data;
}

export const stripe = {
  createCheckoutSession: (secret, { priceId, successUrl, cancelUrl, email, clientRef }) =>
    call(secret, 'POST', '/checkout/sessions', {
      mode: 'subscription',
      'line_items': [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      client_reference_id: clientRef || undefined,
      allow_promotion_codes: true,
    }),
  getCheckoutSession: (secret, id) => call(secret, 'GET', `/checkout/sessions/${id}`),
  createPortalSession: (secret, { customer, returnUrl }) =>
    call(secret, 'POST', '/billing_portal/sessions', { customer, return_url: returnUrl }),
};

// Verify a Stripe webhook signature header: "t=...,v1=...".
export async function verifyStripeSig(payload, header, secret, toleranceSec = 300) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map(p => p.split('=')));
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(String(secret).trim()),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`));
  const hex = [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
  // constant-time-ish compare
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}
