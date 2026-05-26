const axios = require('axios');

const { config, isPlaceholder } = require('../../config');

const OPENAI_API_KEY = config.openai.apiKey;
const OPENAI_MODEL = config.openai.model;

function isConfigured() {
  if (!OPENAI_API_KEY) return false;
  if (isPlaceholder(OPENAI_API_KEY)) return false;
  return OPENAI_API_KEY.startsWith('sk-');
}

async function chat(messages, options = {}) {
  const payload = {
    model: OPENAI_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 900,
    stream: false
  };

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: options.timeoutMs ?? 20000
  });

  const content = response.data?.choices?.[0]?.message?.content || '';
  return {
    fullResponse: content,
    model: OPENAI_MODEL,
    provider: 'openai'
  };
}

async function stream(messages, options = {}) {
  const payload = {
    model: OPENAI_MODEL,
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 900,
    stream: true
  };

  const response = await axios.post('https://api.openai.com/v1/chat/completions', payload, {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    responseType: 'stream',
    timeout: options.timeoutMs ?? 30000
  });

  return new Promise((resolve, reject) => {
    let full = '';
    let buffer = '';
    let done = false;

    response.data.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.replace(/^data:\s*/, '');
        if (data === '[DONE]') {
          done = true;
          resolve({
            fullResponse: full,
            model: OPENAI_MODEL,
            provider: 'openai'
          });
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            full += delta;
            if (options.onToken) options.onToken(delta);
          }
        } catch (err) {
          // Ignore malformed chunks
        }
      }
    });

    response.data.on('error', (err) => {
      if (!done) reject(err);
    });

    response.data.on('end', () => {
      if (!done) {
        resolve({
          fullResponse: full,
          model: OPENAI_MODEL,
          provider: 'openai'
        });
      }
    });
  });
}

module.exports = {
  isConfigured,
  chat,
  stream
};
