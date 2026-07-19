// Server-side AI proxy. Cloud users (and free users within a small quota) call these
// instead of bringing their own key — the provider key lives only here, in env.

const OR_URL = 'https://openrouter.ai/api/v1/messages';
// DeepSeek is what the account's OpenRouter keys currently serve (Anthropic/Google are
// not enabled on that account). Cheap and reliable; the app also passes explicit models.
const DEFAULT_MODEL = 'deepseek/deepseek-chat';

// Two provider keys so app vs extension spend is separable in the OpenRouter
// dashboard and can be rotated independently. The client identifies itself with the
// X-Attentify-Client header; OPENROUTER_KEY is the legacy single-key fallback.
export function providerKey(env, client) {
  if (client === 'ext') return env.OPENROUTER_KEY_EXT || env.OPENROUTER_KEY || '';
  return env.OPENROUTER_KEY_APP || env.OPENROUTER_KEY || '';
}
function headers(env, client) {
  return {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    Authorization: `Bearer ${String(providerKey(env, client)).trim()}`,
    'HTTP-Referer': 'https://attentify.ca',
    'X-Title': client === 'ext' ? 'Attentify Extension' : 'Attentify App',
  };
}

// Pull token usage out of a provider response, tolerant of Anthropic- and OpenAI-style shapes.
function readUsage(u = {}) {
  return {
    inputTokens: u.input_tokens ?? u.prompt_tokens ?? 0,
    outputTokens: u.output_tokens ?? u.completion_tokens ?? 0,
  };
}

// Non-streaming single-shot → { text, model, inputTokens, outputTokens }. Used by the
// context engine. The token counts let the caller meter the exact cost of the call.
export async function aiJson(env, { system, input, model, maxTokens = 400 }, client) {
  const chosenModel = model || DEFAULT_MODEL;
  const res = await fetch(OR_URL, {
    method: 'POST',
    headers: headers(env, client),
    body: JSON.stringify({
      model: chosenModel,
      max_tokens: maxTokens,
      system: system || '',
      messages: [{ role: 'user', content: String(input || '') }],
    }),
  });
  if (!res.ok) throw new Error(`provider ${res.status}: ${(await res.text()).slice(0, 140)}`);
  const data = await res.json();
  const text = data.content?.map(b => b.text).join('') || data.choices?.[0]?.message?.content || '';
  return { text, model: chosenModel, ...readUsage(data.usage) };
}

// Tee an SSE body: pass it straight through while scraping token usage from the events.
// Returns { stream, usage } where usage resolves after the stream ends.
function teeUsage(body, model) {
  let resolveUsage;
  const usage = new Promise((r) => { resolveUsage = r; });
  const decoder = new TextDecoder();
  let inTok = 0, outTok = 0, buf = '';
  const stream = body.pipeThrough(new TransformStream({
    transform(chunk, controller) {
      controller.enqueue(chunk);                          // passthrough, unbuffered
      buf += decoder.decode(chunk, { stream: true });
      let nl;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === 'message_start' && evt.message?.usage) {
            const s = readUsage(evt.message.usage); inTok = s.inputTokens || inTok; outTok = s.outputTokens || outTok;
          } else if (evt.type === 'message_delta' && evt.usage) {
            outTok = evt.usage.output_tokens || outTok;   // cumulative
          } else if (evt.usage) {
            const s = readUsage(evt.usage); inTok = s.inputTokens || inTok; outTok = s.outputTokens || outTok;
          }
        } catch { /* keepalive / partial line */ }
      }
    },
    flush() { resolveUsage({ model, inputTokens: inTok, outputTokens: outTok }); },
  }));
  return { stream, usage };
}

// Streaming chat (custom shape used by the extension). Returns { status, stream, usage }.
export async function aiChatStream(env, { system, messages, model, maxTokens = 1024 }, client) {
  const chosenModel = model || DEFAULT_MODEL;
  const upstream = await fetch(OR_URL, {
    method: 'POST',
    headers: headers(env, client),
    body: JSON.stringify({
      model: chosenModel,
      max_tokens: maxTokens,
      stream: true,
      system: system || '',
      messages: (messages || []).filter(m => m && m.role && m.content).slice(-12),
    }),
  });
  if (!upstream.ok || !upstream.body) {
    return { status: upstream.status, stream: upstream.body, usage: Promise.resolve({ model: chosenModel, inputTokens: 0, outputTokens: 0 }) };
  }
  return { status: upstream.status, ...teeUsage(upstream.body, chosenModel) };
}

// Transparent Anthropic-messages proxy: forwards the FULL request body (tools, system,
// stream, etc.) to OpenRouter unchanged, so the desktop app can keep using the Anthropic
// SDK — only the base URL and key change. Meters real usage either way.
//   → { kind:'stream', status, stream, usage:Promise }  when body.stream is truthy
//   → { kind:'json',   status, body:string, usage:object } otherwise
export async function aiProxy(env, bodyObj, client) {
  const model = bodyObj.model || DEFAULT_MODEL;
  const upstream = await fetch(OR_URL, {
    method: 'POST',
    headers: headers(env, client),
    body: JSON.stringify({ ...bodyObj, model }),
  });
  if (bodyObj.stream) {
    if (!upstream.ok || !upstream.body) {
      return { kind: 'stream', status: upstream.status, stream: upstream.body, usage: Promise.resolve({ model, inputTokens: 0, outputTokens: 0 }) };
    }
    return { kind: 'stream', status: upstream.status, ...teeUsage(upstream.body, model) };
  }
  const text = await upstream.text();
  let data = {}; try { data = JSON.parse(text); } catch { /* pass raw text through */ }
  return { kind: 'json', status: upstream.status, body: text, usage: { model, ...readUsage(data.usage) } };
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
