// Server-side AI proxy. Cloud users (and free users within a small quota) call these
// instead of bringing their own key — the provider key lives only here, in env.

const OR_URL = 'https://openrouter.ai/api/v1/messages';
const DEFAULT_MODEL = 'anthropic/claude-haiku-4.5';

function headers(env) {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    Authorization: `Bearer ${String(env.OPENROUTER_KEY || '').trim()}`,
    'HTTP-Referer': 'https://attentify.ai',
    'X-Title': 'Attentify Cloud',
  };
}

// Non-streaming single-shot → { text }. Used by the context engine.
export async function aiJson(env, { system, input, model, maxTokens = 400 }) {
  const res = await fetch(OR_URL, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      max_tokens: maxTokens,
      system: system || '',
      messages: [{ role: 'user', content: String(input || '') }],
    }),
  });
  if (!res.ok) throw new Error(`provider ${res.status}: ${(await res.text()).slice(0, 140)}`);
  const data = await res.json();
  const text = data.content?.map(b => b.text).join('') || data.choices?.[0]?.message?.content || '';
  return { text };
}

// Streaming passthrough → returns the upstream SSE Response body directly so the
// client streams tokens with no buffering.
export async function aiChatStream(env, { system, messages, model, maxTokens = 1024 }) {
  const upstream = await fetch(OR_URL, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({
      model: model || DEFAULT_MODEL,
      max_tokens: maxTokens,
      stream: true,
      system: system || '',
      messages: (messages || []).filter(m => m && m.role && m.content).slice(-12),
    }),
  });
  return upstream;
}

// Curated "automatic site blocking" rules cloud users get synced on top of the
// extension's built-ins. Same shape the extension already understands.
export const SEED_RULES = [
  { id: 'cloud-yt-comments', domain: 'youtube.com', displayName: 'YouTube comments', severity: 'low',
    selectors: ['ytd-comments#comments'], urlPatterns: [], antiBypassSearchTerms: [] },
  { id: 'cloud-news-trending', domain: 'news.google.com', displayName: 'Google News "For you"', severity: 'medium',
    selectors: ['[aria-label="For you"]'], urlPatterns: [], antiBypassSearchTerms: [] },
  { id: 'cloud-amazon-reco', domain: 'amazon.com', displayName: 'Amazon recommendations', severity: 'low',
    selectors: ['[data-cel-widget*="rhf"]', '#rhf'], urlPatterns: [], antiBypassSearchTerms: [] },
  { id: 'cloud-twitch-reco', domain: 'twitch.tv', displayName: 'Twitch recommended channels', severity: 'medium',
    selectors: ['[aria-label="Recommended Channels"]'], urlPatterns: [], antiBypassSearchTerms: [] },
  { id: 'cloud-pinterest-feed', domain: 'pinterest.com', displayName: 'Pinterest home feed', severity: 'medium',
    selectors: ['[data-test-id="homefeed-feed"]'], urlPatterns: [], antiBypassSearchTerms: [] },
];
