exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { songTitle, artist, movie } = JSON.parse(event.body);
    
    // Simplified YouTube search - in production you'd use actual YouTube API
    const mockResults = [
      {
        videoId: 'D16oTBR6N50', // Why This Kolaveri Di
        title: `${songTitle} - ${artist}`,
        channelTitle: 'Think Music',
        thumbnail: 'https://img.youtube.com/vi/D16oTBR6N50/mqdefault.jpg'
      },
      {
        videoId: 'YUTIwixS5Mo', // Aaluma Doluma
        title: `${songTitle} Official Video`,
        channelTitle: 'Sony Music South',
        thumbnail: 'https://img.youtube.com/vi/YUTIwixS5Mo/mqdefault.jpg'
      }
    ];

    // Simple matching logic
    let bestMatch = mockResults[0];
    if (songTitle.toLowerCase().includes('aaluma')) {
      bestMatch = mockResults[1];
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        videoId: bestMatch.videoId,
        title: bestMatch.title,
        channelTitle: bestMatch.channelTitle,
        thumbnail: bestMatch.thumbnail,
        searchQuery: `${songTitle} ${artist} ${movie || ''}`
      })
    };
  } catch (error) {
    console.error('YouTube search error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Search failed' })
    };
  }
};