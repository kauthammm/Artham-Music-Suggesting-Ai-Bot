/**
 * Simple Responder Module
 * Lightweight GPT-4 Free endpoint for quick responses.
 */

let Groq = null;
const { extractMusicControl, processChat, generateLocalFallback } = require('./openaiHandler');

// Simple key validator
function validateGroqKey(key) {
  if (!key) return false;
  if (key.startsWith('your-')) return false;
  return /^gsk_[A-Za-z0-9]{20,}/.test(key);
}

// Initialize Groq client (empty key allowed; we'll detect before use)
let groq = null;

// Lightweight system preface emphasizing brevity
const SIMPLE_SYSTEM_PROMPT = `You are Artham-Lite, a concise AI assistant.
- Provide short, direct answers (1-3 sentences).
- If user explicitly mentions mood+language and music terms, you MAY append a music-control JSON block as defined previously.
- Avoid verbose empathy unless user expresses emotion.
- If asked to expand, you can be longer, otherwise stay compact.`;

async function simpleRespond(userText) {
  // Check if API key is configured
  const hasKey = validateGroqKey(process.env.GROQ_API_KEY);
  if (!hasKey) {
    const fallback = generateLocalFallback([{ role: 'user', content: userText }], {});
    return {
      text: fallback.text,
      musicControl: fallback.musicControl,
      modelUsed: 'local-fallback',
      offlineFallback: true
    };
  }
  
  try {
    if (!Groq) {
      try {
        Groq = require('groq-sdk');
      } catch (err) {
        const fallback = generateLocalFallback([{ role: 'user', content: userText }], {}, 'no_key');
        return {
          text: fallback.text,
          musicControl: fallback.musicControl,
          modelUsed: 'local-fallback',
          offlineFallback: true
        };
      }
    }

    if (!groq) {
      groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
    }

    const messages = [
      { role: 'system', content: SIMPLE_SYSTEM_PROMPT },
      { role: 'user', content: userText }
    ];
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500
    });
    
    const full = completion.choices[0]?.message?.content || 'Sorry, please try again.';
    const musicControl = extractMusicControl(full);
    const displayText = full.replace(/```music-control[\s\S]*?```/g, '').trim();
    
    if (musicControl) {
      try {
        const enriched = await processChat([{ role: 'user', content: userText }], {
          mood: musicControl.mood,
          language: musicControl.language
        });
        musicControl.songs = enriched.musicControl?.songs || [];
      } catch (enrichErr) {
        console.warn('[simpleResponder-enrich-warning]', enrichErr.message);
      }
    }
    return { text: displayText, musicControl, modelUsed: 'groq-llama-3.3-70b' };
  } catch (err) {
    console.error('[simpleResponder-error]', err.message);
    const lower = (err.message || '').toLowerCase();
    if (lower.includes('401') || lower.includes('invalid api key')) {
      return {
        text: "❌ Invalid Groq API key.\nRegenerate at https://console.groq.com/keys and update .env (GROQ_API_KEY=...). Then restart server.",
        musicControl: null,
        modelUsed: 'fallback',
        invalidKey: true
      };
    }
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return {
        text: "⚠️ Network issue reaching Groq. Using offline fallback. Try again soon.",
        musicControl: null,
        modelUsed: 'fallback',
        networkIssue: true
      };
    }
    return {
      text: "⚠️ Temporary AI error. Offline fallback active. Details: " + err.message,
      musicControl: null,
      modelUsed: 'fallback',
      unknownError: true
    };
  }
}

module.exports = { simpleRespond };