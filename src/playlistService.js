/**
 * Music Playlist Service
 * Generates concrete song lists for mood + language combinations
 * Replaces vague "I'll play songs" with actual Spotify-style lists
 */

const { SONGS, getSongsByMoodAndLanguage } = require('./songCatalog');

/**
 * Get a playlist with metadata for a mood + language combination
 * @param {string} mood - User's mood (happy, sad, romantic, etc.)
 * @param {string} language - Preferred language (Tamil, Hindi, etc.)
 * @returns {Object} Playlist object with songs, count, and metadata
 */
function getPlaylistForMoodAndLanguage(mood, language) {
  const songs = getSongsByMoodAndLanguage(mood, language);
  
  if (songs.length === 0) {
    // Try to find alternatives
    const alternatives = findAlternatives(mood, language);
    return {
      success: false,
      mood,
      language,
      count: 0,
      songs: [],
      message: `No ${language} ${mood} songs found right now.`,
      alternatives
    };
  }

  return {
    success: true,
    mood,
    language,
    count: songs.length,
    songs: songs.map((song, index) => ({
      ...song,
      position: index + 1
    })),
    title: `${capitalize(mood)} ${language} Songs`,
    description: `${songs.length} ${mood} songs in ${language}`
  };
}

/**
 * Find alternative mood/language combinations when exact match fails
 */
function findAlternatives(mood, language) {
  const alternatives = [];
  
  // Try same mood, different language
  const allLanguages = ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'English'];
  for (const lang of allLanguages) {
    if (lang !== language) {
      const songs = getSongsByMoodAndLanguage(mood, lang);
      if (songs.length > 0) {
        alternatives.push({
          mood,
          language: lang,
          count: songs.length,
          message: `Try ${mood} ${lang} songs (${songs.length} available)`
        });
      }
    }
  }
  
  // Try different mood, same language
  const allMoods = ['happy', 'sad', 'romantic', 'energetic', 'relaxing', 'angry', 'nostalgic'];
  for (const m of allMoods) {
    if (m !== mood) {
      const songs = getSongsByMoodAndLanguage(m, language);
      if (songs.length > 0) {
        alternatives.push({
          mood: m,
          language,
          count: songs.length,
          message: `Try ${m} ${language} songs (${songs.length} available)`
        });
        if (alternatives.length >= 3) break; // Limit alternatives
      }
    }
  }
  
  return alternatives;
}

/**
 * Get all available mood + language combinations with song counts
 * @returns {Array} List of all available playlists
 */
function getAllAvailablePlaylists() {
  const moods = ['happy', 'sad', 'romantic', 'energetic', 'relaxing', 'angry', 'nostalgic', 'stressed'];
  const languages = ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada', 'English'];
  
  const playlists = [];
  
  for (const mood of moods) {
    for (const language of languages) {
      const songs = getSongsByMoodAndLanguage(mood, language);
      if (songs.length > 0) {
        playlists.push({
          mood,
          language,
          count: songs.length,
          title: `${capitalize(mood)} ${language}`,
          description: `${songs.length} songs`
        });
      }
    }
  }
  
  return playlists.sort((a, b) => b.count - a.count);
}

/**
 * Get statistics about the music catalog
 */
function getCatalogStats() {
  const stats = {
    totalSongs: SONGS.length,
    byLanguage: {},
    byMood: {},
    byProvider: {}
  };
  
  SONGS.forEach(song => {
    // Count by language
    stats.byLanguage[song.language] = (stats.byLanguage[song.language] || 0) + 1;
    
    // Count by mood
    song.moods.forEach(mood => {
      stats.byMood[mood] = (stats.byMood[mood] || 0) + 1;
    });
    
    // Count by provider
    stats.byProvider[song.provider] = (stats.byProvider[song.provider] || 0) + 1;
  });
  
  return stats;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = {
  getPlaylistForMoodAndLanguage,
  getAllAvailablePlaylists,
  getCatalogStats,
  findAlternatives
};
