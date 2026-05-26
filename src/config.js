const path = require('path');

// Load .env if present (no-op if missing)
try {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
} catch (_) {
  // dotenv is a dependency; this is just extra safety.
}

function normalizeBool(value, defaultValue = false) {
  if (value == null) return defaultValue;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(v)) return false;
  return defaultValue;
}

function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim().toLowerCase();
  return v.includes('your-') || v.includes('replace') || v.includes('here');
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  heartbeatLog: normalizeBool(process.env.HEARTBEAT_LOG, true),

  logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  enableDebugEndpoints: process.env.ENABLE_DEBUG_ENDPOINTS
    ? normalizeBool(process.env.ENABLE_DEBUG_ENDPOINTS, false)
    : (process.env.NODE_ENV !== 'production'),

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  },

  groq: {
    apiKey: process.env.GROQ_API_KEY || ''
  },

  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY || '',
    baseUrl: process.env.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3'
  },

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID || '',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET || '',
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || ''
  }
};

function validateEnv() {
  const warnings = [];

  const providers = {
    openaiConfigured: !!config.openai.apiKey && !isPlaceholder(config.openai.apiKey),
    geminiConfigured: !!config.gemini.apiKey && !isPlaceholder(config.gemini.apiKey),
    groqConfigured: !!config.groq.apiKey && !isPlaceholder(config.groq.apiKey),
    youtubeConfigured: !!config.youtube.apiKey && !isPlaceholder(config.youtube.apiKey),
    spotifyConfigured: !!config.spotify.clientId && !!config.spotify.clientSecret && !isPlaceholder(config.spotify.clientId)
  };

  if (!providers.openaiConfigured && !providers.geminiConfigured) {
    warnings.push('No LLM API key configured (OPENAI_API_KEY or GEMINI_API_KEY). App will run in offline fallback mode.');
  }

  if (!providers.youtubeConfigured) {
    warnings.push('YOUTUBE_API_KEY not configured; YouTube search/metadata enrichment will use fallback search only.');
  }

  if (!providers.groqConfigured) {
    warnings.push('GROQ_API_KEY not configured; `simple:` mode uses offline fallback.');
  }

  if (!providers.spotifyConfigured) {
    warnings.push('Spotify OAuth not configured; Spotify routes will require valid env vars to work end-to-end.');
  }

  if (!Number.isFinite(config.port) || config.port <= 0) {
    warnings.push(`Invalid PORT value: ${process.env.PORT}`);
  }

  return { warnings, providers };
}

module.exports = {
  config,
  validateEnv,
  isPlaceholder,
  normalizeBool
};
