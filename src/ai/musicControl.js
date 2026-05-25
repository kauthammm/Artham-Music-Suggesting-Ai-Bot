const { getSongsByMood, getSongsByLanguage, getSongsByMoodAndLanguage, searchSongs, getSongById } = require('../songCatalog');

function extractMusicControl(text) {
  const musicControlRegex = /```music-control\s*([\s\S]*?)\s*```/;
  const match = text.match(musicControlRegex);

  if (match && match[1]) {
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      return null;
    }
  }
  return null;
}

async function getSongsForControl(control) {
  const { mode, mood, language, songId, searchQuery } = control || {};

  if (mode === 'single' && songId) {
    const song = getSongById(songId);
    return song ? [song] : [];
  }

  if (mode === 'playlist') {
    if (mood && language) return getSongsByMoodAndLanguage(mood, language);
    if (mood) return getSongsByMood(mood);
    if (language) return getSongsByLanguage(language);
  }

  if (mode === 'search' && searchQuery) {
    return searchSongs(searchQuery);
  }

  return [];
}

module.exports = {
  extractMusicControl,
  getSongsForControl
};
