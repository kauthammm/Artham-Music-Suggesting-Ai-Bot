const { musicDatabase } = require('../../src/musicDatabase');
const { analyzeUserMessage } = require('../../src/aiProcessor');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);
    
    // Analyze the message using your AI
    const analysis = analyzeUserMessage(message);
    
    let response = {
      analysis,
      timestamp: new Date().toISOString()
    };

    // If it's a playlist request, generate playlist
    if (analysis.action === 'generate_curated_playlist') {
      const playlist = generateCuratedPlaylist(analysis.mood, analysis.language);
      response.playlist = playlist;
    } else if (analysis.action === 'generate_artist_playlist') {
      const playlist = generateArtistPlaylist(analysis.artist);
      response.playlist = playlist;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Chat API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

// Helper functions (simplified versions of your server functions)
function generateCuratedPlaylist(mood, language) {
  const moodPlaylists = {
    happy: [
      { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', movie: '3' },
      { title: 'Aaluma Doluma', artist: 'Anirudh Ravichander', movie: 'Vedalam' },
      { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', movie: 'Master' }
    ],
    romantic: [
      { title: 'Nenjukkul Peidhidum', artist: 'Yuvan Shankar Raja', movie: 'Vaaranam Aayiram' },
      { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu' },
      { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja' }
    ],
    sad: [
      { title: 'Kanne Kalaimane', artist: 'Ilaiyaraaja', movie: 'Moondram Pirai' },
      { title: 'Pachai Nirame', artist: 'A.R. Rahman', movie: 'Alaipayuthey' },
      { title: 'Mundhinam Paarthene', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram' }
    ]
  };

  const songs = moodPlaylists[mood] || moodPlaylists.happy;
  
  return {
    title: `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${language} Songs`,
    songs: songs,
    mood: mood,
    language: language
  };
}

function generateArtistPlaylist(artist) {
  const artistSongs = {
    'a.r. rahman': [
      { title: 'Jai Ho', artist: 'A.R. Rahman', movie: 'Slumdog Millionaire' },
      { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu' },
      { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja' }
    ],
    'anirudh': [
      { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', movie: '3' },
      { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', movie: 'Master' },
      { title: 'Aaluma Doluma', artist: 'Anirudh Ravichander', movie: 'Vedalam' }
    ]
  };

  const songs = artistSongs[artist.toLowerCase()] || artistSongs['anirudh'];
  
  return {
    title: `${artist} Hits`,
    songs: songs,
    artist: artist
  };
}