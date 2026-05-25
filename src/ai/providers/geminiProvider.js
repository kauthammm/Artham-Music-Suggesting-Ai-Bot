const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function isConfigured() {
  if (!GEMINI_API_KEY) return false;
  if (GEMINI_API_KEY.toLowerCase().includes('your-')) return false;
  return GEMINI_API_KEY.length > 20;
}

function buildPrompt(messages) {
  return messages.map((msg) => {
    if (msg.role === 'system') return `System: ${msg.content}`;
    if (msg.role === 'assistant') return `Assistant: ${msg.content}`;
    return `User: ${msg.content}`;
  }).join('\n');
}

async function chat(messages, options = {}) {
  const prompt = buildPrompt(messages);

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 1024
      }
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: options.timeoutMs ?? 20000
    }
  );

  const content = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    fullResponse: content,
    model: GEMINI_MODEL,
    provider: 'gemini'
  };
}

module.exports = {
  isConfigured,
  chat
};
