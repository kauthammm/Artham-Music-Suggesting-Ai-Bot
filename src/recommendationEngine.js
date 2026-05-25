const { getSongsByMood, getSongsByLanguage, getSongsByMoodAndLanguage, SONGS } = require('./songCatalog');

const moodMap = [
  { mood: 'happy', keywords: ['happy', 'joy', 'cheerful', 'fun', 'party', 'celebrate'] },
  { mood: 'sad', keywords: ['sad', 'down', 'lonely', 'alone', 'heartbreak', 'cry', 'tears'] },
  { mood: 'romantic', keywords: ['romantic', 'love', 'crush', 'valentine', 'date'] },
  { mood: 'energetic', keywords: ['workout', 'gym', 'run', 'dance', 'pump', 'motivation'] },
  { mood: 'relaxing', keywords: ['calm', 'relax', 'sleep', 'chill', 'soothing', 'study', 'focus'] },
  { mood: 'stressed', keywords: ['stressed', 'stress', 'overwhelmed', 'anxious'] },
  { mood: 'angry', keywords: ['angry', 'mad', 'furious', 'rage'] },
  { mood: 'nostalgic', keywords: ['nostalgia', 'nostalgic', 'oldies', 'classic'] }
];

const languageMap = ['tamil', 'hindi', 'telugu', 'malayalam', 'kannada', 'english'];

const genreMap = [
  { genre: 'romantic', keywords: ['romantic', 'love', 'melody'] },
  { genre: 'dance', keywords: ['dance', 'party'] },
  { genre: 'workout', keywords: ['workout', 'gym'] },
  { genre: 'focus', keywords: ['focus', 'study'] },
  { genre: 'sleep', keywords: ['sleep', 'calm'] }
];

function analyzeMessage(text, context = {}) {
  const lower = (text || '').toLowerCase();
  const mood = detectMood(lower) || context.mood || null;
  const language = detectLanguage(lower) || context.language || null;
  const genre = detectGenre(lower) || null;
  const energy = detectEnergy(lower);

  return {
    mood,
    language,
    genre,
    energy
  };
}

function detectMood(text) {
  for (const entry of moodMap) {
    if (entry.keywords.some((k) => text.includes(k))) {
      return entry.mood;
    }
  }
  return null;
}

function detectLanguage(text) {
  return languageMap.find((lang) => text.includes(lang)) || null;
}

function detectGenre(text) {
  for (const entry of genreMap) {
    if (entry.keywords.some((k) => text.includes(k))) {
      return entry.genre;
    }
  }
  return null;
}

function detectEnergy(text) {
  if (/(energy|energetic|hype|pump|workout)/.test(text)) return 'high';
  if (/(calm|relax|sleep|chill|soft)/.test(text)) return 'low';
  return 'medium';
}

function buildPlaylist({ mood, language }, limit = 15) {
  let songs = [];

  if (mood && language) {
    songs = getSongsByMoodAndLanguage(mood, capitalize(language));
  } else if (mood) {
    songs = getSongsByMood(mood);
  } else if (language) {
    songs = getSongsByLanguage(capitalize(language));
  } else {
    songs = SONGS.slice(0, limit);
  }

  if (songs.length > limit) {
    songs = songs.slice(0, limit);
  }

  const titleParts = [];
  if (mood) titleParts.push(capitalize(mood));
  if (language) titleParts.push(capitalize(language));

  return {
    success: true,
    mood: mood || 'mixed',
    language: language ? capitalize(language) : 'Mixed',
    count: songs.length,
    songs: songs.map((song, index) => ({
      ...song,
      position: index + 1
    })),
    title: titleParts.length ? `${titleParts.join(' ')} Mix` : 'Artham Mix',
    description: `${songs.length} songs curated by Artham`
  };
}

function capitalize(value) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

module.exports = {
  analyzeMessage,
  buildPlaylist
};
