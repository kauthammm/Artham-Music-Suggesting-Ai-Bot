const { getSongsByMoodAndLanguage } = require('../../songCatalog');

function detectMood(text) {
  const patterns = [
    { mood: 'happy', keywords: ['happy', 'joy', 'cheerful', 'upbeat', 'fun', 'celebrate', 'party'] },
    { mood: 'sad', keywords: ['sad', 'down', 'lonely', 'alone', 'heartbreak', 'cry', 'tears', 'blue'] },
    { mood: 'romantic', keywords: ['romantic', 'love', 'crush', 'date', 'valentine'] },
    { mood: 'energetic', keywords: ['workout', 'gym', 'run', 'dance', 'pump', 'motivated', 'motivation', 'focus', 'hype'] },
    { mood: 'relaxing', keywords: ['calm', 'relax', 'sleep', 'chill', 'soothing', 'meditate', 'focus', 'study'] },
    { mood: 'stressed', keywords: ['stressed', 'stress', 'overwhelmed', 'anxious', 'tension'] },
    { mood: 'angry', keywords: ['angry', 'mad', 'furious', 'irritated'] },
    { mood: 'nostalgic', keywords: ['nostalgic', 'memories', 'oldies', 'classic'] }
  ];

  for (const entry of patterns) {
    if (entry.keywords.some((k) => text.includes(k))) {
      return entry.mood;
    }
  }
  return null;
}

function detectLanguage(text) {
  const languages = ['tamil', 'hindi', 'malayalam', 'telugu', 'kannada', 'english'];
  return languages.find((lang) => text.includes(lang)) || null;
}

function buildResponse(text, mood, language) {
  const parts = [];
  parts.push('I am in offline mode, but I can still help with music and chat.');

  if (mood && language) {
    parts.push(`I detected a ${mood} vibe and ${capitalize(language)} preference.`);
    parts.push('Starting a matching playlist for you.');
  } else if (mood) {
    parts.push(`I detected a ${mood} mood. Tell me a language (Tamil, Hindi, Telugu, Malayalam, Kannada, English).`);
  } else if (language) {
    parts.push(`Got ${capitalize(language)}. Tell me your mood (happy, sad, romantic, energetic, relaxing).`);
  } else {
    parts.push('Tell me a mood and language, like "romantic tamil" or "workout english".');
  }

  return parts.join(' ');
}

function generateLocalFallback(messages, userContext = {}, reason = null) {
  const lastUserMessage = messages.slice().reverse().find((m) => m.role === 'user')?.content || '';
  const lower = lastUserMessage.toLowerCase();

  const mood = detectMood(lower) || userContext.mood || null;
  const language = detectLanguage(lower) || userContext.language || null;

  const isMusicIntent = /song|songs|music|playlist|play|listen/.test(lower) || !!mood || !!language;

  let musicControl = null;
  if (isMusicIntent && mood && language) {
    musicControl = {
      action: 'play',
      mode: 'playlist',
      mood,
      language: capitalize(language),
      songs: getSongsByMoodAndLanguage(mood, capitalize(language))
    };
  }

  let responseText = buildResponse(lower, mood, language);
  if (!isMusicIntent) {
    responseText = 'I am in offline mode but can still answer questions. Ask about music or any topic.';
  }

  if (reason) {
    responseText += ` (Offline reason: ${reason})`;
  }

  let fullResponse = responseText;
  if (musicControl) {
    fullResponse += `\n\n\`\`\`music-control\n${JSON.stringify(musicControl, null, 2)}\n\`\`\``;
  }

  return {
    text: responseText,
    fullResponse,
    musicControl,
    model: 'local-fallback',
    provider: 'local',
    offlineFallback: true,
    fallbackReason: reason || 'offline'
  };
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
  generateLocalFallback
};
