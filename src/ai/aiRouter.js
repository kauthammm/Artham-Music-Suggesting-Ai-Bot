const { SYSTEM_PROMPT } = require('./prompts');
const openaiProvider = require('./providers/openaiProvider');
const geminiProvider = require('./providers/geminiProvider');
const { generateLocalFallback } = require('./providers/localProvider');
const { extractMusicControl, getSongsForControl } = require('./musicControl');

const PROVIDERS = [
  { name: 'openai', client: openaiProvider },
  { name: 'gemini', client: geminiProvider }
];

function buildMessages(messages, userContext = {}) {
  const contextParts = [];
  if (userContext.mood) contextParts.push(`mood=${userContext.mood}`);
  if (userContext.language) contextParts.push(`language=${userContext.language}`);
  if (userContext.currentSong) contextParts.push(`currentSong=${userContext.currentSong.title || 'unknown'}`);

  const contextLine = contextParts.length ? `Context: ${contextParts.join(', ')}` : '';

  const systemMessages = [{ role: 'system', content: SYSTEM_PROMPT }];
  if (contextLine) {
    systemMessages.push({ role: 'system', content: contextLine });
  }

  return systemMessages.concat(messages || []);
}

async function runChat(messages, userContext = {}) {
  const conversation = buildMessages(messages, userContext);
  let lastError = null;

  for (const provider of PROVIDERS) {
    if (!provider.client.isConfigured || !provider.client.isConfigured()) {
      continue;
    }
    try {
      const result = await withRetry(
        () => provider.client.chat(conversation, { temperature: 0.7 }),
        2,
        { shouldRetry }
      );
      return await normalizeResult(result, provider.name);
    } catch (error) {
      lastError = error;
    }
  }

  return normalizeLocalFallback(messages, userContext, lastError);
}

async function streamChat(messages, userContext = {}, onToken) {
  const conversation = buildMessages(messages, userContext);
  let lastError = null;

  for (const provider of PROVIDERS) {
    if (!provider.client.isConfigured || !provider.client.isConfigured()) {
      continue;
    }

    try {
      if (provider.client.stream) {
        const result = await withRetry(
          () => provider.client.stream(conversation, {
            temperature: 0.7,
            onToken
          }),
          1,
          { shouldRetry }
        );
        return await normalizeResult(result, provider.name);
      }

      const result = await withRetry(
        () => provider.client.chat(conversation, { temperature: 0.7 }),
        2,
        { shouldRetry }
      );
      await streamText(result.fullResponse || '', onToken);
      return await normalizeResult(result, provider.name);
    } catch (error) {
      lastError = error;
    }
  }

  const fallback = normalizeLocalFallback(messages, userContext, lastError);
  await streamText(fallback.text || '', onToken);
  return fallback;
}

async function normalizeResult(raw, providerName) {
  const fullResponse = raw.fullResponse || raw.text || '';
  let musicControl = raw.musicControl || extractMusicControl(fullResponse);
  let text = raw.text || stripMusicControl(fullResponse);

  if (musicControl) {
    if (!musicControl.songs || musicControl.songs.length === 0) {
      musicControl.songs = await getSongsForControl(musicControl);
    }
  }

  return {
    text: text.trim(),
    fullResponse,
    musicControl,
    model: raw.model || providerName,
    provider: providerName,
    offlineFallback: raw.offlineFallback || false,
    fallbackReason: raw.fallbackReason || null
  };
}

function normalizeLocalFallback(messages, userContext, error) {
  const reason = classifyError(error);
  return generateLocalFallback(messages, userContext, reason);
}

function classifyError(error) {
  if (!error || !error.message) return 'offline';
  const msg = error.message.toLowerCase();
  if (msg.includes('401') || msg.includes('unauthorized') || msg.includes('invalid')) return 'no_key';
  if (msg.includes('429') || msg.includes('quota')) return 'quota_429';
  if (msg.includes('timeout') || msg.includes('network')) return 'network';
  return 'error';
}

function stripMusicControl(text) {
  return text.replace(/```music-control[\s\S]*?```/g, '').trim();
}

function shouldRetry(error) {
  if (!error) return true;
  const status = error.response?.status;
  if (status) {
    if (status === 429) return true;
    if (status >= 500) return true;
    return false; // 4xx are usually non-transient (invalid key, bad request, etc.)
  }

  const code = String(error.code || '').toUpperCase();
  if (['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENOTFOUND', 'ECONNABORTED'].includes(code)) return true;
  const msg = String(error.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('network')) return true;
  return false;
}

async function withRetry(fn, retries, options = {}) {
  const should = options.shouldRetry || (() => true);
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === retries) throw error;
      if (!should(error)) throw error;

      const delay = 300 * (attempt + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      attempt += 1;
    }
  }
  return null;
}

async function streamText(text, onToken) {
  if (!onToken || !text) return;
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    onToken(part);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

async function getWelcomeMessage() {
  const messages = [{ role: 'user', content: 'Hi, I just opened the app.' }];
  return runChat(messages);
}

module.exports = {
  runChat,
  streamChat,
  getWelcomeMessage
};
