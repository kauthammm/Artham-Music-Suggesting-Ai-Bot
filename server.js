require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Server } = require('socket.io');
const fs = require('fs');
const youtubeSearch = require('youtube-search-api');
const axios = require('axios');
const spotifyAuth = require('./spotify-auth');
const { simpleRespond } = require('./src/simpleResponder');

// Import OpenAI chat handler and song catalog
const { processChat, getWelcomeMessage } = require('./src/openaiHandler');
const { SONGS, getSongsByMood, getSongsByLanguage, getSongsByMoodAndLanguage, getSongById, searchSongs } = require('./src/songCatalog');
const { getPlaylistForMoodAndLanguage, getAllAvailablePlaylists, getCatalogStats } = require('./src/playlistService');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Add diagnostic handlers
server.on('error', (err) => {
  console.error('[server-error]', err.message);
});
server.on('close', () => {
  console.warn('[server-close] HTTP server closed');
});

// YouTube API Configuration - Add your API key here
const YOUTUBE_API_CONFIG = {
    API_KEY: process.env.YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY_HERE', // Replace with your actual API key
    BASE_URL: 'https://www.googleapis.com/youtube/v3',
    MAX_RESULTS: 10
};

// Enhanced YouTube API search function with your deployed API
async function searchYouTubeWithAPI(searchQuery, maxResults = 5) {
    try {
        const apiKey = process.env.YOUTUBE_API_KEY;
        const baseUrl = process.env.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';
        
        console.log('🔍 Using deployed YouTube API for:', searchQuery);
        console.log('🔑 API Key configured:', apiKey ? 'Yes' : 'No');
        
        if (!apiKey) {
            console.log('⚠️ No API key found, using hardcoded videos');
            return [];
        }
        
        // Enhanced search parameters for better results
        const searchUrl = `${baseUrl}/search`;
        const params = {
            part: 'snippet',
            q: `${searchQuery} tamil song official video`,
            type: 'video',
            maxResults: maxResults,
            key: apiKey,
            regionCode: 'IN',
            relevanceLanguage: 'ta',
            videoCategoryId: '10', // Music category
            videoEmbeddable: true,
            videoSyndicated: true,
            order: 'relevance',
            safeSearch: 'none'
        };
        
        console.log('📡 Making API request to:', searchUrl);
        
        const response = await axios.get(searchUrl, {
            params: params,
            timeout: 10000, // 10 second timeout
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Artham-Music-Bot/1.0'
            }
        });
        
        if (response.data && response.data.items && response.data.items.length > 0) {
            console.log(`✅ Found ${response.data.items.length} videos from YouTube API`);
            
            // Process and validate results
            const validVideos = response.data.items
                .filter(item => item.id && item.id.videoId && item.snippet)
                .map(item => ({
                    videoId: item.id.videoId,
                    title: item.snippet.title,
                    channelTitle: item.snippet.channelTitle,
                    description: item.snippet.description,
                    thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                    publishedAt: item.snippet.publishedAt,
                    embedUrl: `https://www.youtube.com/embed/${item.id.videoId}?autoplay=1&rel=0&showinfo=0`
                }));
                
            console.log(`✅ Processed ${validVideos.length} valid videos`);
            return validVideos;
        } else {
            console.log('❌ No results from YouTube API');
            return [];
        }
    } catch (error) {
        console.error('❌ YouTube API Error:', error.response?.data || error.message);
        return [];
    }
}

// Fallback search when API is not available
async function fallbackYouTubeSearch(searchQuery) {
    try {
        console.log('🔄 Using fallback YouTube search for:', searchQuery);
        const results = await youtubeSearch.GetListByKeyword(searchQuery, false, 5);
        
        if (results && results.items && results.items.length > 0) {
            console.log(`✅ Found ${results.items.length} results from fallback search`);
            return results.items.map(item => ({
                videoId: item.id,
                title: item.title,
                channelTitle: item.channelTitle,
                description: item.description,
                thumbnail: item.thumbnail.url,
                publishedAt: item.publishedAt
            }));
        }
        return [];
    } catch (error) {
        console.error('❌ Fallback search error:', error.message);
        return [];
    }
}

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Basic health endpoint for liveness checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Lightweight simple chat endpoint (Artham-Lite)
app.post('/api/simple-chat', async (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ success: false, error: 'Missing text' });
  }
  try {
    const result = await simpleRespond(text);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[simple-chat-error]', err.message);
    res.status(500).json({ success: false, error: 'Failed to process simple chat' });
  }
});

// Debug endpoint to verify Groq connectivity
app.get('/api/debug-groq', async (req, res) => {
  const testPrompt = 'Return only the word READY if you received this.';
  try {
    const { GROQ_API_KEY } = process.env;
    const hasKey = !!GROQ_API_KEY && !GROQ_API_KEY.startsWith('your-');
    if (!hasKey) {
      return res.json({ success: false, configured: false, message: 'No Groq API key configured. Get FREE key: https://console.groq.com/keys' });
    }
    
    const Groq = require('groq-sdk');
    const groq = new Groq({ apiKey: GROQ_API_KEY });
    
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: testPrompt }],
      temperature: 0.7,
      max_tokens: 50
    });
    
    const content = completion.choices[0]?.message?.content || '';
    
    res.json({ success: true, configured: true, model: 'llama-3.3-70b-versatile', response: content, message: 'Groq FREE AI working! ✨' });
  } catch (e) {
    res.status(500).json({ success: false, configured: true, error: e.message });
  }
});

// Heartbeat log every 30s (helps detect silent exits)
setInterval(() => {
  if (process.env.HEARTBEAT_LOG === 'false') return;
  console.log('[heartbeat] server alive', new Date().toISOString());
}, 30000);

// Spotify authentication routes
app.use('/api/spotify', spotifyAuth);

// Additional Spotify Data & Broadcast Routes (requires Bearer access token from auth flow)
// Helper to extract access token
function getSpotifyAccessToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.replace('Bearer ', '').trim();
}

// Fetch a playlist's tracks and optionally shuffle a subset
app.get('/api/spotify/playlist/:playlistId', async (req, res) => {
  const accessToken = getSpotifyAccessToken(req);
  if (!accessToken) {
    return res.status(401).json({ success: false, error: 'Missing Bearer access token' });
  }
  const { playlistId } = req.params;
  const limit = parseInt(req.query.limit || '100', 10);
  try {
    // Get playlist metadata (optional) then tracks
    const tracksResp = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit }
    });
    const items = tracksResp.data.items || [];
    const tracks = items
      .filter(it => it.track && !it.track.is_local)
      .map((it, idx) => ({
        id: it.track.id,
        title: it.track.name,
        artist: (it.track.artists || []).map(a => a.name).join(', '),
        album: it.track.album?.name,
        durationMs: it.track.duration_ms,
        provider: 'spotify',
        position: idx + 1,
        previewUrl: it.track.preview_url,
        externalUrl: it.track.external_urls?.spotify
      }));
    res.json({ success: true, playlistId, count: tracks.length, tracks });
  } catch (err) {
    console.error('[spotify-playlist-error]', err.response?.data || err.message);
    res.status(400).json({ success: false, error: 'Failed to fetch playlist tracks' });
  }
});

// Get a shuffled recommendations set (20-25 default) using seed params or genre fallback
app.get('/api/spotify/shuffle', async (req, res) => {
  const accessToken = getSpotifyAccessToken(req);
  if (!accessToken) {
    return res.status(401).json({ success: false, error: 'Missing Bearer access token' });
  }
  const count = Math.min(Math.max(parseInt(req.query.count || '25', 10), 1), 50); // clamp 1..50
  const seedGenres = req.query.seed_genres || 'pop';
  const seedArtists = req.query.seed_artists || '';
  const seedTracks = req.query.seed_tracks || '';
  try {
    const params = {
      limit: count,
      seed_genres: seedGenres
    };
    if (seedArtists) params.seed_artists = seedArtists;
    if (seedTracks) params.seed_tracks = seedTracks;
    const recResp = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    });
    const rawTracks = recResp.data.tracks || [];
    // Shuffle again to ensure randomness
    const shuffled = rawTracks.sort(() => Math.random() - 0.5).map((t, idx) => ({
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map(a => a.name).join(', '),
      album: t.album?.name,
      durationMs: t.duration_ms,
      provider: 'spotify',
      position: idx + 1,
      previewUrl: t.preview_url,
      externalUrl: t.external_urls?.spotify
    }));
    res.json({ success: true, type: 'recommendation_shuffle', count: shuffled.length, tracks: shuffled });
  } catch (err) {
    console.error('[spotify-shuffle-error]', err.response?.data || err.message);
    res.status(400).json({ success: false, error: 'Failed to get shuffled recommendations' });
  }
});

// Broadcast a global shuffled playlist to all connected clients via Socket.IO
app.post('/api/spotify/broadcast-shuffle', async (req, res) => {
  const accessToken = getSpotifyAccessToken(req);
  if (!accessToken) {
    return res.status(401).json({ success: false, error: 'Missing Bearer access token' });
  }
  const count = Math.min(Math.max(parseInt(req.body?.count || '25', 10), 1), 50);
  try {
    const recResp = await axios.get('https://api.spotify.com/v1/recommendations', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { limit: count, seed_genres: req.body?.seed_genres || 'pop' }
    });
    const tracks = (recResp.data.tracks || []).map((t, idx) => ({
      id: t.id,
      title: t.name,
      artist: (t.artists || []).map(a => a.name).join(', '),
      album: t.album?.name,
      durationMs: t.duration_ms,
      provider: 'spotify',
      position: idx + 1,
      previewUrl: t.preview_url,
      externalUrl: t.external_urls?.spotify
    }));
    io.emit('global_playlist', { success: true, generatedAt: Date.now(), count: tracks.length, tracks });
    res.json({ success: true, broadcast: true, count: tracks.length });
  } catch (err) {
    console.error('[spotify-broadcast-error]', err.response?.data || err.message);
    res.status(400).json({ success: false, error: 'Failed to broadcast shuffled playlist' });
  }
});

// ===== NEW API ROUTES FOR SONG CATALOG =====

// Get all songs
app.get('/api/songs', (req, res) => {
  res.json({ success: true, songs: SONGS });
});

// Get songs by mood
app.get('/api/songs/mood/:mood', (req, res) => {
  const songs = getSongsByMood(req.params.mood);
  res.json({ success: true, mood: req.params.mood, songs });
});

// Get songs by language
app.get('/api/songs/language/:language', (req, res) => {
  const songs = getSongsByLanguage(req.params.language);
  res.json({ success: true, language: req.params.language, songs });
});

// Get song by ID
app.get('/api/songs/:id', (req, res) => {
  const song = getSongById(req.params.id);
  if (song) {
    res.json({ success: true, song });
  } else {
    res.status(404).json({ success: false, error: 'Song not found' });
  }
});

// Search songs
app.get('/api/songs/search/:query', (req, res) => {
  const songs = searchSongs(req.params.query);
  res.json({ success: true, query: req.params.query, songs });
});

// ===== PLAYLIST API ROUTES (Spotify-style) =====

// Get playlist for specific mood + language combination
app.get('/api/playlist/:mood/:language', (req, res) => {
  const playlist = getPlaylistForMoodAndLanguage(req.params.mood, req.params.language);
  res.json(playlist);
});

// Get all available playlists
app.get('/api/playlists', (req, res) => {
  const playlists = getAllAvailablePlaylists();
  res.json({ success: true, playlists, count: playlists.length });
});

// Get catalog statistics
app.get('/api/stats', (req, res) => {
  const stats = getCatalogStats();
  res.json({ success: true, stats });
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Diagnostics route: combines stats + playlist counts + uptime
app.get('/diagnostics', (req, res) => {
  try {
    const stats = getCatalogStats();
    const playlists = getAllAvailablePlaylists();
    const uptimeSec = process.uptime();
    res.json({
      success: true,
      time: new Date().toISOString(),
      uptimeSeconds: Math.round(uptimeSec),
      totalSongs: stats.totalSongs,
      languages: stats.byLanguage,
      moods: stats.byMood,
      playlistTotal: playlists.length,
      topPlaylists: playlists.slice(0, 10),
      memoryMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Full diagnostics with all playlists
app.get('/diagnostics/full', (req, res) => {
  try {
    const stats = getCatalogStats();
    const playlists = getAllAvailablePlaylists();
    res.json({
      success: true,
      time: new Date().toISOString(),
      stats,
      playlists,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Audio streaming route
app.get('/audio/:filename', (req, res) => {
    const filename = req.params.filename;
    console.log('Audio request for:', filename);
    
    // For demo purposes, redirect to working audio sources
    const audioSources = {
        'sample1.mp3': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3',
        'sample2.mp3': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_1MG.mp3',
        'sample3.mp3': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_2MG.mp3',
        'tamil1.mp3': 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
        'tamil2.mp3': 'https://archive.org/download/SampleAudio0424/SampleAudio_0.4s_1MB_mp3.mp3'
    };
    
    if (audioSources[filename]) {
        res.redirect(audioSources[filename]);
    } else {
        res.status(404).send('Audio file not found');
    }
});

// Generate audio route for Tamil songs
app.get('/generate-audio/:songId', (req, res) => {
    const songId = req.params.songId;
    console.log('Generating audio for song:', songId);
    
    // Map song IDs to working audio sources
    const songAudioMap = {
        'tamil-happy-1': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3',
        'tamil-happy-2': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_1MG.mp3',
        'tamil-sad-1': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_2MG.mp3',
        'tamil-relaxed-1': 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
        'ar-rahman-1': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3',
        'anirudh-1': 'https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_1MG.mp3'
    };
    
    if (songAudioMap[songId]) {
        res.redirect(songAudioMap[songId]);
    } else {
        // Default audio
        res.redirect('https://file-examples.com/storage/fef1c3d0e2dbeaf2a46761a/2017/11/file_example_MP3_700KB.mp3');
    }
});

// YouTube search route - searches for specific songs
// Enhanced YouTube search endpoint with deployed API integration
app.post('/search-youtube', async (req, res) => {
    const { songTitle, artist, movie } = req.body;
    
    console.log('🎵 YouTube search request:', { songTitle, artist, movie });
    console.log('🔑 Using deployed YouTube API');
    
    // First, try your deployed YouTube API for real-time search
    try {
        const apiSearchQuery = `${songTitle} ${artist || ''} ${movie || ''} tamil song official video`.trim();
        console.log('🔍 Searching deployed API for:', apiSearchQuery);
        
        const apiResults = await searchYouTubeWithAPI(apiSearchQuery, 5);
        
        if (apiResults && apiResults.length > 0) {
            console.log(`✅ Found ${apiResults.length} results from deployed API`);
            
            // Return the best match from API
            const bestMatch = findBestVideoMatch(apiResults, songTitle, artist);
            if (bestMatch) {
                console.log('🎬 Best API match:', bestMatch.title);
                res.json({
                    success: true,
                    videoId: bestMatch.videoId,
                    title: bestMatch.title,
                    channelTitle: bestMatch.channelTitle,
                    thumbnail: bestMatch.thumbnail,
                    embedUrl: bestMatch.embedUrl,
                    searchQuery: apiSearchQuery,
                    source: 'deployed_api',
                    allResults: apiResults
                });
                return;
            }
        }
    } catch (error) {
        console.error('❌ Deployed API search failed:', error.message);
    }
    
    // Fallback to hardcoded working videos if API fails
    console.log('🔄 Using hardcoded video database as fallback...');
    
    // First, check our hardcoded working videos - These are verified embeddable videos
    const workingVideos = {
        'Why This Kolaveri Di': 'YR12Z8f1Dh8',
        'Vaathi Coming': 'bhZGhtKAKTU', 
        'Arabic Kuthu': 'vkqiC4KPeDs',
        'Rowdy Baby': 'x6Q7c9RyMzk',
        'Vaseegara': 'dzQ99-AqjJI',
        'Hosanna': 'CiFX5rJnhLk',
        'Aaluma Doluma': 'HiqmZLOuCMY',
        'Naakka Mukka': 'kK4xXZQ89Hc',
        'Selfie Pulla': 'vKtx8TiXUCs',
        'Marana Mass': 'vmgkwhwVZ0s',
        'Pathala Pathala': 'KJQ2wNdPjrM',
        'Chinna Chinna Aasai': 'jJ2s6FMu9jM',
        'Kadhal Rojave': 'hfbQFWnGw2Y',
        'Uyire Uyire': 'WZVn9N_jCJc',
        'Vennilave Vennilave': 'gQNDm3S7FLc',
        'Snehidhane': 'SZRcnKDMHqA',
        'Nenjukkul Peidhidum': 'yDKNs6gFUzg',
        'Mundhinam Paarthene': 'vfKGjZNIa5Y',
        'Munbe Vaa': 'IuLNbp6Wy6k',
        'Kanne Kalaimane': 'kCyA-oYp57Y',
        'Mandram Vantha': 'J7W1WJd74fM',
        'Mandram Vantha Thendralukku': 'J7W1WJd74fM',
        'Poove Poochudava': 'x6Q7c9RyMzk',
        'Thendral Vanthu': 'dzQ99-AqjJI',
        'Kathalae Kathalae': 'CiFX5rJnhLk',
        'Pachai Nirame': 'SZRcnKDMHqA',
        // More working videos for better coverage
        'Enna Sona': 'b4WDbFCahoE',
        'Mersalaayitten': 'xNcdGVJXJaU',
        'Anbe Anbe': 'IQlr2Jjf-6E',
        'Oru Maalai': 'QBZOeItPJb8'
    };
    
    // Check for exact match first
    for (const [title, videoId] of Object.entries(workingVideos)) {
        if (title.toLowerCase() === songTitle.toLowerCase() || 
            songTitle.toLowerCase().includes(title.toLowerCase()) ||
            title.toLowerCase().includes(songTitle.toLowerCase())) {
            console.log('✅ Found hardcoded video:', title, '-> Video ID:', videoId);
            res.json({
                success: true,
                videoId: videoId,
                title: title,
                channelTitle: 'Verified Tamil Songs',
                thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                searchQuery: songTitle,
                source: 'hardcoded'
            });
            return;
        }
    }

    // Create comprehensive search query
    const searchQueries = [
        `${songTitle} ${artist} ${movie || ''} tamil song official video`,
        `${songTitle} ${artist} tamil song`,
        `${songTitle} ${artist} official video`,
        `${songTitle} tamil song`
    ];
    
    // Try each search query until we find results
    for (const query of searchQueries) {
        console.log('🔍 Trying search query:', query);
        
        const results = await searchYouTubeWithAPI(query.trim(), 3);
        
        if (results && results.length > 0) {
            // Find the best match
            const bestMatch = findBestVideoMatch(results, songTitle, artist);
            
            if (bestMatch) {
                console.log('✅ Best match found:', bestMatch.title);
                
                res.json({
                    success: true,
                    videoId: bestMatch.videoId,
                    title: bestMatch.title,
                    channelTitle: bestMatch.channelTitle,
                    thumbnail: bestMatch.thumbnail,
                    searchQuery: query,
                    allResults: results // Send all results for fallback
                });
                return;
            }
        }
    }
    
    // If no results found, try fallback with hardcoded video
    console.log('❌ No YouTube API results, using hardcoded fallback');
    
    // Use a popular Tamil song as ultimate fallback
    const fallbackVideos = {
        'happy': { videoId: 'vkqiC4KPeDs', title: 'Arabic Kuthu' },
        'sad': { videoId: 'CiFX5rJnhLk', title: 'Hosanna' },
        'romantic': { videoId: 'gQNDm3S7FLc', title: 'Vennilave Vennilave' },
        'default': { videoId: 'YR12Z8f1Dh8', title: 'Why This Kolaveri Di' }
    };
    
    // Try to match song mood/type or use default
    let fallback = fallbackVideos.default;
    if (songTitle.toLowerCase().includes('love') || songTitle.toLowerCase().includes('kadhal')) {
        fallback = fallbackVideos.romantic;
    } else if (songTitle.toLowerCase().includes('sad') || artist.toLowerCase().includes('rahman')) {
        fallback = fallbackVideos.sad;
    } else if (songTitle.toLowerCase().includes('dance') || artist.toLowerCase().includes('anirudh')) {
        fallback = fallbackVideos.happy;
    }
    
    res.json({
        success: true,
        videoId: fallback.videoId,
        title: `${fallback.title} (Similar to: ${songTitle})`,
        channelTitle: 'Tamil Songs Collection',
        searchQuery: songTitle,
        source: 'smart_fallback'
    });
});

// New endpoint: Get multiple video options for a song using deployed API
app.post('/get-video-options', async (req, res) => {
    const { songTitle, artist, movie } = req.body;
    
    console.log('🎬 Getting video options for:', { songTitle, artist, movie });
    
    try {
        // Search using your deployed API for multiple options
        const searchQueries = [
            `${songTitle} ${artist || ''} tamil song official video`,
            `${songTitle} ${artist || ''} tamil song`,
            `${songTitle} tamil song lyrics video`,
            `${songTitle} ${movie || ''} tamil song`
        ];
        
        let allOptions = [];
        
        // Try each search query to get diverse results
        for (const query of searchQueries) {
            try {
                const results = await searchYouTubeWithAPI(query.trim(), 3);
                if (results && results.length > 0) {
                    allOptions = [...allOptions, ...results];
                }
            } catch (error) {
                console.log(`⚠️ Query "${query}" failed:`, error.message);
            }
        }
        
        // Remove duplicates based on video ID
        const uniqueOptions = allOptions.filter((video, index, self) => 
            index === self.findIndex(v => v.videoId === video.videoId)
        );
        
        // Score and sort the options
        const scoredOptions = uniqueOptions.map(video => ({
            ...video,
            score: calculateVideoScore(video, songTitle, artist)
        })).sort((a, b) => b.score - a.score);
        
        console.log(`✅ Found ${scoredOptions.length} unique video options`);
        
        res.json({
            success: true,
            options: scoredOptions.slice(0, 10), // Return top 10 options
            searchQueries: searchQueries,
            source: 'deployed_api_multi'
        });
        
    } catch (error) {
        console.error('❌ Error getting video options:', error);
        
        // Fallback to hardcoded videos
        const fallbackOptions = getFallbackVideoOptions(songTitle, artist);
        
        res.json({
            success: true,
            options: fallbackOptions,
            source: 'hardcoded_fallback'
        });
    }
});

// Function to calculate video relevance score
function calculateVideoScore(video, songTitle, artist) {
    let score = 0;
    const title = video.title.toLowerCase();
    const songLower = songTitle.toLowerCase();
    const artistLower = (artist || '').toLowerCase();
    
    // Exact title match gets highest score
    if (title === songLower) score += 20;
    else if (title.includes(songLower)) score += 15;
    
    // Artist match
    if (artistLower && (title.includes(artistLower) || video.channelTitle.toLowerCase().includes(artistLower))) {
        score += 10;
    }
    
    // Prefer official content
    if (title.includes('official')) score += 8;
    if (title.includes('video')) score += 5;
    if (title.includes('song')) score += 3;
    
    // Music channel preference
    const channel = video.channelTitle.toLowerCase();
    if (channel.includes('music') || channel.includes('records') || channel.includes('entertainment')) {
        score += 5;
    }
    
    return score;
}

// Get fallback video options from hardcoded database
function getFallbackVideoOptions(songTitle, artist) {
    const workingVideos = {
        'Why This Kolaveri Di': 'YR12Z8f1Dh8',
        'Vaathi Coming': 'bhZGhtKAKTU',
        'Arabic Kuthu': 'vkqiC4KPeDs',
        'Rowdy Baby': 'x6Q7c9RyMzk',
        'Vaseegara': 'dzQ99-AqjJI',
        'Hosanna': 'CiFX5rJnhLk',
        'Aaluma Doluma': 'HiqmZLOuCMY'
    };
    
    return Object.entries(workingVideos).map(([title, videoId]) => ({
        videoId: videoId,
        title: title,
        channelTitle: 'Tamil Songs Collection',
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&showinfo=0`,
        score: title.toLowerCase().includes(songTitle.toLowerCase()) ? 10 : 5
    })).sort((a, b) => b.score - a.score);
}

// Function to find the best matching video from search results
function findBestVideoMatch(results, songTitle, artist) {
    if (!results || results.length === 0) return null;
    
    // Score each result based on title similarity
    const scoredResults = results.map(result => {
        let score = 0;
        const title = result.title.toLowerCase();
        const songLower = songTitle.toLowerCase();
        const artistLower = artist.toLowerCase();
        
        // Higher score for exact title match
        if (title.includes(songLower)) score += 10;
        
        // Higher score for artist match
        if (title.includes(artistLower) || result.channelTitle.toLowerCase().includes(artistLower)) score += 8;
        
        // Prefer official videos
        if (title.includes('official')) score += 5;
        if (title.includes('video')) score += 3;
        
        // Prefer music channels
        const channel = result.channelTitle.toLowerCase();
        if (channel.includes('music') || channel.includes('records') || channel.includes('entertainment')) score += 4;
        
        // Penalty for covers, remixes, or karaoke
        if (title.includes('cover') || title.includes('remix') || title.includes('karaoke')) score -= 5;
        
        return { ...result, score };
    });
    
    // Sort by score and return the best match
    scoredResults.sort((a, b) => b.score - a.score);
    console.log('🎯 Top scored results:', scoredResults.slice(0, 3).map(r => ({ title: r.title, score: r.score })));
    
    return scoredResults[0];
}

// New endpoint to get multiple video options for a song
app.post('/get-video-options', async (req, res) => {
    const { songTitle, artist, movie } = req.body;
    
    console.log('🎬 Getting video options for:', songTitle, 'by', artist);
    
    const searchQuery = `${songTitle} ${artist} ${movie || ''} tamil song`;
    const results = await searchYouTubeWithAPI(searchQuery, 8);
    
    if (results && results.length > 0) {
        // Filter and score results
        const videoOptions = results.map((result, index) => {
            const score = calculateVideoScore(result, songTitle, artist);
            return {
                videoId: result.videoId,
                title: result.title,
                channelTitle: result.channelTitle,
                thumbnail: result.thumbnail,
                score: score,
                rank: index + 1
            };
        }).sort((a, b) => b.score - a.score);
        
        res.json({
            success: true,
            songTitle,
            artist,
            options: videoOptions,
            totalFound: results.length
        });
    } else {
        res.json({
            success: false,
            message: 'No video options found',
            songTitle,
            artist
        });
    }
});

// Helper function to calculate video relevance score
function calculateVideoScore(video, songTitle, artist) {
    let score = 0;
    const title = video.title.toLowerCase();
    const channel = video.channelTitle.toLowerCase();
    const songLower = songTitle.toLowerCase();
    const artistLower = artist.toLowerCase();
    
    // Title matching
    if (title.includes(songLower)) score += 15;
    if (title === songLower) score += 25; // Exact match bonus
    
    // Artist matching
    if (title.includes(artistLower)) score += 12;
    if (channel.includes(artistLower)) score += 10;
    
    // Quality indicators
    if (title.includes('official')) score += 8;
    if (title.includes('hd') || title.includes('4k')) score += 5;
    if (title.includes('video')) score += 4;
    if (title.includes('full song')) score += 6;
    
    // Channel quality
    if (channel.includes('music') || channel.includes('records')) score += 6;
    if (channel.includes('entertainment') || channel.includes('studios')) score += 4;
    
    // Penalties
    if (title.includes('cover') || title.includes('remix')) score -= 8;
    if (title.includes('karaoke') || title.includes('instrumental')) score -= 10;
    if (title.includes('reaction') || title.includes('review')) score -= 15;
    
    return Math.max(0, score); // Ensure non-negative score
}

// Audio streaming endpoint for songs
app.get('/stream-audio/:songId', (req, res) => {
    const songId = req.params.songId;
    console.log('Audio stream request for:', songId);
    
    // For demo purposes, we'll redirect to a working audio source
    // In production, you would have actual audio files or streaming service integration
    
    const audioSources = {
        'kanne-kalaimane': 'https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview125/v4/c8/f5/36/c8f53685-23e4-8e8d-d47e-3f3e55b8c7d6/mzaf_5642583598156119396.plus.aac.p.m4a',
        'pachai-nirame': 'https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview115/v4/ff/a2/d4/ffa2d421-b9c6-d2e2-43fa-3c14f8a6e8b5/mzaf_2847093869205986301.plus.aac.p.m4a',
        'mundhinam-paarthene': 'https://audio-ssl.itunes.apple.com/apple-assets-us-std-000001/AudioPreview125/v4/d1/8a/42/d18a42cc-5dc6-b6c4-8b8e-4b4c87e2f1a8/mzaf_3456789012345678901.plus.aac.p.m4a'
    };
    
    const audioUrl = audioSources[songId];
    if (audioUrl) {
        res.redirect(audioUrl);
    } else {
        res.status(404).json({ error: 'Audio not found' });
    }
});

// Get alternative audio sources for a song
app.post('/get-audio-sources', (req, res) => {
    const { songTitle, artist } = req.body;
    console.log('Getting audio sources for:', songTitle, 'by', artist);
    
    // Generate alternative audio sources with working demo URLs
    const sources = {
        primary: {
            type: 'youtube-audio',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(songTitle + ' ' + artist + ' audio only')}`
        },
        fallbacks: [
            {
                type: 'soundcloud',
                url: `https://soundcloud.com/search?q=${encodeURIComponent(songTitle + ' ' + artist)}`
            },
            {
                type: 'spotify',
                url: `https://open.spotify.com/search/${encodeURIComponent(songTitle + ' ' + artist)}`
            },
            {
                type: 'jiosaavn',
                url: `https://www.jiosaavn.com/search/${encodeURIComponent(songTitle)}`
            }
        ],
        embedSources: getDirectAudioSources(songTitle, artist)
    };
    
    res.json({
        success: true,
        sources: sources
    });
});

// Get direct audio sources for immediate playback
function getDirectAudioSources(songTitle, artist) {
    // Legal demo audio sources for testing (public domain/royalty-free)
    const demoSources = [
        'https://www.soundjay.com/misc/sounds/magic_chime_02.mp3',
        'https://www.soundjay.com/misc/sounds/magic_wand_03.mp3',
        'https://www.soundjay.com/misc/sounds/bell_tree_02.mp3',
        'https://www.soundjay.com/misc/sounds/ding_1.mp3',
        'https://www.soundjay.com/misc/sounds/temple_bell_1.mp3'
    ];
    
    // Add legitimate preview sources (these are legal 30-second previews)
    const previewSources = [
        // iTunes preview API (legal previews)
        `https://itunes.apple.com/search?term=${encodeURIComponent(songTitle + ' ' + artist)}&media=music&limit=1`,
        
        // Spotify preview API (legal 30-second previews)
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(songTitle + ' ' + artist)}&type=track&limit=1`,
        
        // Last.fm API for track info
        `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(songTitle)}&artist=${encodeURIComponent(artist)}&api_key=demo&format=json`
    ];
    
    // Return mix of demo and preview sources
    return [...demoSources, ...previewSources];
}

// Add route to get iTunes preview
app.get('/itunes-preview/:song/:artist', async (req, res) => {
    try {
        const { song, artist } = req.params;
        const searchTerm = encodeURIComponent(`${song} ${artist}`);
        
        // This would require actual iTunes API implementation
        // For now, return demo audio
        const demoAudio = 'https://www.soundjay.com/misc/sounds/magic_chime_02.mp3';
        
        res.json({
            success: true,
            previewUrl: demoAudio,
            duration: 30,
            source: 'demo'
        });
    } catch (error) {
        console.error('iTunes preview error:', error);
        res.status(500).json({ error: 'Preview not available' });
    }
});

// Add route for streaming demo audio
app.get('/demo-audio/:trackId', (req, res) => {
    const trackId = req.params.trackId;
    
    // Map of demo tracks (public domain/royalty-free)
    const demoTracks = {
        'demo1': 'https://www.soundjay.com/misc/sounds/magic_chime_02.mp3',
        'demo2': 'https://www.soundjay.com/misc/sounds/magic_wand_03.mp3',
        'demo3': 'https://www.soundjay.com/misc/sounds/bell_tree_02.mp3',
        'demo4': 'https://www.soundjay.com/misc/sounds/ding_1.mp3',
        'demo5': 'https://www.soundjay.com/misc/sounds/temple_bell_1.mp3'
    };
    
    const audioUrl = demoTracks[trackId];
    if (audioUrl) {
        // Redirect to the actual audio file
        res.redirect(audioUrl);
    } else {
        res.status(404).json({ error: 'Demo track not found' });
    }
});

// Enhanced YouTube search function with dynamic results
function searchYouTubeForSong(songTitle, artist, movie) {
    console.log('Searching for:', songTitle, 'by', artist, 'from', movie);
    
    // Create search combinations for better matching
    const searchCombinations = [
        `${songTitle} ${artist}`,
        `${songTitle} ${movie}`,
        `${songTitle} ${artist} ${movie}`,
        `${songTitle} tamil song`,
        `${artist} ${songTitle}`
    ];
    
    // Enhanced video database with more accurate mappings
    const videoDatabase = {
        // Exact song matches
        'why this kolaveri di': { videoId: 'YR12Z8f1Dh8', title: 'Why This Kolaveri Di Official Video' },
        'vaathi coming': { videoId: 'bhZGhtKAKTU', title: 'Vaathi Coming Official Video' },
        'arabic kuthu': { videoId: 'vkqiC4KPeDs', title: 'Arabic Kuthu Official Video' },
        'rowdy baby': { videoId: 'x6Q7c9RyMzk', title: 'Rowdy Baby Official Video' },
        'vaseegara': { videoId: 'dzQ99-AqjJI', title: 'Vaseegara Official Video' },
        'hosanna': { videoId: 'CiFX5rJnhLk', title: 'Hosanna Official Video' },
        'aaluma doluma': { videoId: 'HiqmZLOuCMY', title: 'Aaluma Doluma Official Video' },
        'selfie pulla': { videoId: 'vKtx8TiXUCs', title: 'Selfie Pulla Official Video' },
        'marana mass': { videoId: 'vmgkwhwVZ0s', title: 'Marana Mass Official Video' },
        'chinna chinna aasai': { videoId: 'jJ2s6FMu9jM', title: 'Chinna Chinna Aasai Official Video' },
        'kadhal rojave': { videoId: 'hfbQFWnGw2Y', title: 'Kadhal Rojave Official Video' },
        'vennilave vennilave': { videoId: 'gQNDm3S7FLc', title: 'Vennilave Vennilave Official Video' },
        'uyire uyire': { videoId: 'WZVn9N_jCJc', title: 'Uyire Uyire Official Video' },
        'snehidhane': { videoId: 'SZRcnKDMHqA', title: 'Snehidhane Official Video' },
        'nenjukkul peidhidum': { videoId: 'yDKNs6gFUzg', title: 'Nenjukkul Peidhidum Official Video' },
        'mundhinam paarthene': { videoId: 'vfKGjZNIa5Y', title: 'Mundhinam Paarthene Official Video' },
        'munbe vaa': { videoId: 'IuLNbp6Wy6k', title: 'Munbe Vaa Official Video' },
        'kanne kalaimane': { videoId: 'kCyA-oYp57Y', title: 'Kanne Kalaimane Official Video' },
        'rakkamma kaiya thattu': { videoId: 'F5DzBp5rNI4', title: 'Rakkamma Kaiya Thattu Official Video' },
        'mandram vantha': { videoId: 'J7W1WJd74fM', title: 'Mandram Vantha Official Video' },
        'naakka mukka': { videoId: 'kK4xXZQ89Hc', title: 'Naakka Mukka Official Video' },
        'mukkala mukkabala': { videoId: 'dZo3yNkePx4', title: 'Mukkala Mukkabala Official Video' },
        'pachai nirame': { videoId: 'VGi5Qb8gF0I', title: 'Pachai Nirame Official Video' }
    };
    
    // Try to find exact match
    const normalizedTitle = songTitle.toLowerCase().trim();
    if (videoDatabase[normalizedTitle]) {
        console.log('Found exact match for:', normalizedTitle);
        return videoDatabase[normalizedTitle];
    }
    
    // Try to find partial matches
    for (const [key, value] of Object.entries(videoDatabase)) {
        if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
            console.log('Found partial match:', key, 'for', normalizedTitle);
            return value;
        }
    }
    
    // Try artist-based matching
    const normalizedArtist = artist.toLowerCase();
    if (normalizedArtist.includes('anirudh')) {
        return { videoId: 'YR12Z8f1Dh8', title: `${songTitle} - Anirudh Ravichander` };
    } else if (normalizedArtist.includes('rahman')) {
        return { videoId: 'CiFX5rJnhLk', title: `${songTitle} - A.R. Rahman` };
    } else if (normalizedArtist.includes('harris')) {
        return { videoId: 'dzQ99-AqjJI', title: `${songTitle} - Harris Jayaraj` };
    } else if (normalizedArtist.includes('yuvan')) {
        return { videoId: 'x6Q7c9RyMzk', title: `${songTitle} - Yuvan Shankar Raja` };
    } else if (normalizedArtist.includes('ilaiyaraaja')) {
        return { videoId: 'kCyA-oYp57Y', title: `${songTitle} - Ilaiyaraaja` };
    }
    
    // Default fallback
    console.log('Using default for:', songTitle);
    return { videoId: 'YR12Z8f1Dh8', title: `${songTitle} - Tamil Song` };
}

// Enhanced Music Knowledge Database with comprehensive data
const musicDatabase = {
  artists: {
    'ilaiyaraaja': {
      name: 'Ilaiyaraaja (Isaignani)',
      languages: ['Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Hindi'],
      occupation: 'Music Director',
      famousSongs: ['Rakkamma Kaiya Thattu', 'Sundari Kannal Oru Sethi', 'Potri Paadadi Penne', 'Kanne Kalaimane', 'Mandram Vantha Thendralukku'],
      movies: ['Thalapathi', 'Thevar Magan', 'Moondram Pirai', 'Mouna Ragam', 'Nayakan'],
      awards: ['Padma Bhushan', 'Padma Vibhushan'],
      genre: ['Classical', 'Film Score', 'Folk'],
      birthYear: 1943,
      description: 'A maestro who has composed over 7,000 songs, known for intricate orchestration, soulful melodies, and fusion of folk and Western classical elements.'
    },
    'a.r. rahman': {
      name: 'A.R. Rahman (Isaipuyal)',
      languages: ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'English'],
      occupation: 'Music Director',
      famousSongs: ['Chinna Chinna Aasai', 'Kadhal Rojave', 'Uyire Uyire', 'Thaiyya Thaiyya', 'Vennilave Vennilave'],
      movies: ['Roja', 'Bombay', 'Uyire', 'Minsara Kanavu', 'Alaipayuthey'],
      awards: ['Academy Award', 'Grammy Award', 'BAFTA', 'Padma Bhushan'],
      genre: ['Film Score', 'World Music', 'Pop'],
      birthYear: 1967,
      description: 'A global icon who redefined Tamil and Indian film music with innovative sound, blending technology with traditional melodies.'
    },
    'yuvan shankar raja': {
      name: 'Yuvan Shankar Raja (Little Maestro)',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      occupation: 'Music Director',
      famousSongs: ['Iragai Pole', 'Ninaithu Ninaithu Parthen', 'Oru Kal Oru Kannadi', 'Idhu Varai', 'Pogathey Pogathey'],
      movies: ['Naan Mahaan Alla', '7G Rainbow Colony', 'Siva Manasula Sakthi', 'Goa', 'Deepavali'],
      awards: ['Filmfare Awards South', 'Vijay Awards'],
      genre: ['Contemporary', 'Rock', 'Hip-Hop', 'Melody'],
      birthYear: 1979,
      description: 'Known for experimental and versatile style, trendsetter with Western-influenced tracks and soulful melodies.'
    },
    'anirudh ravichander': {
      name: 'Anirudh Ravichander (Rockstar)',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      occupation: 'Music Director',
      famousSongs: ['Why This Kolaveri Di', 'Ethir Neechal', 'Aaluma Doluma', 'Marana Mass', 'Vaathi Coming'],
      movies: ['3', 'Ethir Neechal', 'Vedalam', 'Petta', 'Master'],
      awards: ['Filmfare Awards South', 'Vijay Awards', 'Edison Awards'],
      genre: ['Contemporary', 'Electronic', 'Pop', 'Rock'],
      birthYear: 1990,
      description: 'Young and dynamic music director who gained fame with "Why This Kolaveri Di", known for contemporary, youth-oriented music.'
    },
    'harris jayaraj': {
      name: 'Harris Jayaraj (The Melody King)',
      languages: ['Tamil', 'Telugu', 'Hindi'],
      occupation: 'Music Director',
      famousSongs: ['Vaseegara', 'Ondra Renda', 'Anbe En Anbe', 'Mundhinam Paarthene', 'Hasili Fisiliye'],
      movies: ['Minnale', 'Kaakha Kaakha', 'Dhaam Dhoom', 'Vaaranam Aayiram', 'Aadhavan'],
      awards: ['Filmfare Awards South', 'Tamil Nadu State Film Awards'],
      genre: ['Melody', 'Contemporary', 'Romantic'],
      birthYear: 1975,
      description: 'Fresh and modern sound characterized by lush arrangements and catchy melodies, favorite among younger generation.'
    },
    'santhosh narayanan': {
      name: 'Santhosh Narayanan',
      languages: ['Tamil', 'Telugu', 'Malayalam'],
      occupation: 'Music Director',
      famousSongs: ['Aasai Oru Pulveli', 'Kaasu Panam', 'Naan Nee', 'Neruppu Da', 'Ey Sandakaara'],
      movies: ['Attakathi', 'Soodhu Kavvum', 'Madras', 'Kabali', 'Irudhi Suttru'],
      awards: ['National Film Awards', 'Filmfare Awards South'],
      genre: ['Folk', 'Jazz', 'Electronic', 'Indie'],
      birthYear: 1983,
      description: 'Known for unique and rustic sound, incorporates folk elements, jazz, and electronic music into compositions.'
    },
    's.p. balasubrahmanyam': {
      name: 'S.P. Balasubrahmanyam (SPB)',
      languages: ['Telugu', 'Tamil', 'Hindi', 'Kannada', 'Malayalam'],
      occupation: 'Playback Singer',
      famousSongs: ['Ithu Oru Ponmalai', 'Mandram Vandha', 'Enna Satham Intha Neram', 'Kadhal Rojave', 'Sangeetha Jathi Mullai'],
      movies: ['Nizhalgal', 'Mouna Ragam', 'Punnagai Mannan', 'Roja', 'Kadhal Oviyam'],
      awards: ['Padma Shri', 'Padma Bhushan', 'National Film Awards'],
      genre: ['Playback Singing', 'Classical', 'Devotional'],
      birthYear: 1946,
      description: 'Legendary playback singer who recorded over 40,000 songs in various languages. Expressive voice and versatility are unparalleled.'
    },
    'k.j. yesudas': {
      name: 'K.J. Yesudas (Gaana Gandharvan)',
      languages: ['Tamil', 'Malayalam', 'Telugu', 'Kannada', 'Hindi'],
      occupation: 'Playback Singer',
      famousSongs: ['Kanne Kalaimane', 'Raja Raja Chozhan', 'Deivam Thantha Veedu', 'Poove Sempoove', 'Amma Endru'],
      movies: ['Moondram Pirai', 'Rettai Vaal Kuruvi', 'Aval Oru Thodar Kathai', 'Solla Thudikuthu Manasu', 'Mannan'],
      awards: ['Padma Shri', 'Padma Bhushan', 'National Film Awards'],
      genre: ['Carnatic', 'Classical', 'Devotional'],
      birthYear: 1946,
      description: 'Carnatic musician and playback singer with divine voice, rendered countless classical and melodious hits.'
    }
  },
  movies: {
    'roja': {
      name: 'Roja',
      year: 1992,
      language: 'Tamil',
      musicDirector: 'A.R. Rahman',
      famousSongs: ['Chinna Chinna Aasai', 'Roja Jaaneman', 'Kadhal Rojave', 'Tamizha Tamizha'],
      director: 'Mani Ratnam',
      genre: 'Romance/Drama',
      singers: ['S.P. Balasubrahmanyam', 'K.S. Chithra']
    },
    'lagaan': {
      name: 'Lagaan',
      year: 2001,
      language: 'Hindi',
      musicDirector: 'A.R. Rahman',
      famousSongs: ['Ghanan Ghanan', 'Mitwa', 'Radha Kaise Na Jale', 'Chale Chalo'],
      director: 'Ashutosh Gowariker',
      genre: 'Drama/Sports',
      singers: ['A.R. Rahman', 'Udit Narayan', 'Alka Yagnik']
    },
    'mughal-e-azam': {
      name: 'Mughal-E-Azam',
      year: 1960,
      language: 'Hindi',
      musicDirector: 'Naushad',
      famousSongs: ['Pyar Kiya To Darna Kya', 'Teri Mehfil Mein', 'Mohe Panghat Pe'],
      director: 'K. Asif',
      genre: 'Romance/Drama',
      singers: ['Lata Mangeshkar', 'Mohammad Rafi']
    },
    'nayakan': {
      name: 'Nayakan',
      year: 1987,
      language: 'Tamil',
      musicDirector: 'Ilaiyaraaja',
      famousSongs: ['Thenpandi Cheemayile', 'Nila Adhu Vanathumele'],
      director: 'Mani Ratnam',
      genre: 'Crime/Drama',
      singers: ['S.P. Balasubrahmanyam', 'S. Janaki']
    }
  }
};

// External Music API Integration
async function searchMusicBrainz(query, type = 'artist') {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://musicbrainz.org/ws/2/${type}?query=${encodedQuery}&fmt=json&limit=3`;
    
    const response = await axios.get(url, {
      timeout: 5000,
      headers: {
        'User-Agent': 'MusicChatbot/1.0'
      }
    });
    
    return response.data;
  } catch (error) {
    console.log('MusicBrainz API error:', error.message);
    return null;
  }
}

// Enhanced Music Information Function
async function getEnhancedMusicInfo(query) {
  const lowerQuery = query.toLowerCase();
  
  // Check local database first
  for (const [key, artist] of Object.entries(musicDatabase.artists)) {
    if (lowerQuery.includes(key) || lowerQuery.includes(artist.name.toLowerCase())) {
      let response = `🎵 ${artist.name} is a ${artist.occupation.toLowerCase()} `;
      
      if (artist.birthYear) {
        response += `born in ${artist.birthYear}. `;
      }
      
      if (artist.description) {
        response += `${artist.description} `;
      }
      
      response += `\n\n🎬 Famous Movies: ${artist.movies.slice(0, 5).join(', ')}`;
      response += `\n🎵 Hit Songs: ${artist.famousSongs.slice(0, 5).join(', ')}`;
      response += `\n🏆 Awards: ${artist.awards.join(', ')}`;
      response += `\n🌍 Languages: ${artist.languages.join(', ')}`;
      
      return {
        type: 'artist_info',
        result: response,
        details: artist
      };
    }
  }
  
  // Check movies
  for (const [key, movie] of Object.entries(musicDatabase.movies)) {
    if (lowerQuery.includes(key) || lowerQuery.includes(movie.name.toLowerCase())) {
      let response = `🎬 ${movie.name} (${movie.year}) is a ${movie.genre} film `;
      response += `directed by ${movie.director}. `;
      response += `\n\n🎵 Music Director: ${movie.musicDirector}`;
      response += `\n🎵 Famous Songs: ${movie.famousSongs.join(', ')}`;
      response += `\n🎤 Singers: ${movie.singers.join(', ')}`;
      response += `\n🌍 Language: ${movie.language}`;
      
      return {
        type: 'movie_info',
        result: response,
        details: movie
      };
    }
  }
  
  // Try external API
  try {
    const artistMatch = lowerQuery.match(/(?:who is|tell me about|info about)\s+(.+?)(?:\s|$)/);
    if (artistMatch) {
      const artistName = artistMatch[1];
      const mbResult = await searchMusicBrainz(artistName, 'artist');
      
      if (mbResult && mbResult.artists && mbResult.artists.length > 0) {
        const artist = mbResult.artists[0];
        return {
          type: 'external_artist',
          result: `🎵 ${artist.name} is a ${artist.type || 'musical artist'} ${artist.country ? `from ${artist.country}` : ''}. ${artist.disambiguation || ''}`,
          details: artist
        };
      }
    }
  } catch (error) {
    console.log('External API error:', error.message);
  }
  
  // Fallback suggestion
  return {
    type: 'suggestion',
    result: `I don't have detailed information about "${query}" in my database. 🎵 \n\nYou can ask me about:\n• Indian music legends like A.R. Rahman, Ilaiyaraaja, Lata Mangeshkar\n• Classic movies like Roja, Lagaan, Mughal-E-Azam\n• Songs and composers\n\nOr try asking: "Play some Tamil sad songs" or "I want A.R. Rahman music"`
  };
}

// Conversation responses
const conversationResponses = {
  greetings: [
    "Hello! I'm your music companion. What kind of music are you in the mood for today? 🎵",
    "Hi there! Ready to discover some amazing music? Tell me your mood or favorite artist! 🎶",
    "Welcome! I'm here to help you find the perfect songs. What's your vibe today? 🎧"
  ],
  musicQuestions: [
    "What genre do you prefer?",
    "Any favorite artists or composers?", 
    "Which language would you like - Tamil, Hindi, Telugu, or others?",
    "Are you looking for classic hits or modern tracks?"
  ],
  followUpQuestions: [
    "Would you like more songs like this?",
    "Should I suggest similar artists?",
    "Want to explore this artist's other hits?",
    "Interested in songs from the same movie or album?"
  ],
  platformSuggestions: [
    "Which platform would you like to use? I can provide links for YouTube, Spotify, Apple Music, and more!",
    "I recommend trying Spotify for high-quality streaming, or YouTube for music videos!",
    "You can listen on your preferred platform - I support YouTube, Spotify, Apple Music, JioSaavn, and others!"
  ],
  casual: [
    "That's interesting! Tell me about your music preferences.",
    "Cool! What kind of music matches your current mood?",
    "Nice! Let's find some great music for you."
  ]
};

function getRandomResponse(responses) {
  return responses[Math.floor(Math.random() * responses.length)];
}

// Enhanced Natural Language Processing for Music Chatbot
function analyzeUserMessage(text) {
  const lowerText = text.toLowerCase();
  
  // Intent classification
  const intents = {
    greeting: {
      patterns: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up'],
      responses: [
        "Hey there! 😊 What kind of music vibe are you looking for today?",
        "Hello! 🎵 I'm excited to help you discover some amazing music. What's your mood like?",
        "Hi! 🎶 Ready to find your perfect soundtrack? Tell me what you're feeling!"
      ]
    },
    
    moodInquiry: {
      patterns: ['how are you', 'how\'s it going', 'what\'s up', 'how do you feel'],
      responses: [
        "I'm doing great, thanks for asking! 🎵 I'm always excited about music. How are YOU feeling? That'll help me suggest the perfect songs!",
        "I'm fantastic! 😊 Music always keeps me energized. What about you - what's your current mood?",
        "I'm wonderful! 🎶 Ready to dive into some amazing music. How's your day going? That'll help me pick the right tunes!"
      ]
    },
    
    musicRequest: {
      patterns: ['play', 'music', 'song', 'listen', 'hear', 'recommend', 'suggest'],
      contextAnalysis: true
    },
    
    moodExpression: {
      patterns: ['i feel', 'i\'m feeling', 'i am', 'feeling', 'mood'],
      contextAnalysis: true
    },
    
    artistInquiry: {
      patterns: ['who is', 'tell me about', 'know about', 'heard of'],
      contextAnalysis: true
    },
    
    thanks: {
      patterns: ['thank', 'thanks', 'appreciate', 'grateful'],
      responses: [
        "You're so welcome! 🎵 Music is meant to be shared and enjoyed. Need anything else?",
        "My pleasure! 😊 That's what I'm here for - helping you find amazing music!",
        "Happy to help! 🎶 Feel free to ask for more recommendations anytime!"
      ]
    },
    
    goodbye: {
      patterns: ['bye', 'goodbye', 'see you', 'later', 'gtg', 'gotta go'],
      responses: [
        "See you later! 🎵 Hope you enjoy the music recommendations!",
        "Goodbye! 🎶 Come back anytime for more musical discoveries!",
        "Take care! 😊 Keep the music playing!"
      ]
    }
  };
  
  // Check for exact intent matches first
  for (const [intent, data] of Object.entries(intents)) {
    if (data.patterns && !data.contextAnalysis) {
      const matches = data.patterns.some(pattern => 
        lowerText.includes(pattern) || 
        lowerText === pattern ||
        new RegExp(`\\b${pattern}\\b`).test(lowerText)
      );
      
      if (matches) {
        return {
          intent: intent,
          response: getRandomResponse(data.responses),
          confidence: 0.9
        };
      }
    }
  }
  
  // Advanced context analysis for complex requests
  return analyzeComplexRequest(text, lowerText);
}

function analyzeComplexRequest(text, lowerText) {
  // Check for artist mentions with aliases FIRST
  const artistAliases = {
    'yuvan': 'yuvan shankar raja',
    'anirudh': 'anirudh ravichander',
    'harris': 'harris jayaraj',
    'rahman': 'a.r. rahman',
    'a.r.rahman': 'a.r. rahman',
    'ar rahman': 'a.r. rahman',
    'ilaiyaraja': 'ilaiyaraaja',
    'raja': 'ilaiyaraaja',
    'spb': 's.p. balasubrahmanyam',
    'balu': 's.p. balasubrahmanyam',
    'kishore': 'kishore kumar',
    'lata': 'lata mangeshkar',
    'rafi': 'mohammad rafi',
    'yesudas': 'k.j. yesudas',
    'santhosh': 'santhosh narayanan'
  };

  // Check aliases first
  for (const [alias, fullName] of Object.entries(artistAliases)) {
    if (lowerText.includes(alias)) {
      const artist = musicDatabase.artists[fullName];
      if (artist) {
        return {
          intent: 'artist_discussion',
          artist: artist,
          response: `${artist.name}! Excellent choice! 🎵 They're absolutely legendary in ${artist.languages.join(', ')} music.\n\n🎬 **Famous Movies:** ${artist.movies.slice(0, 3).join(', ')}\n🎤 **Hit Songs:** ${artist.famousSongs.slice(0, 5).join(', ')}\n🏆 **Awards:** ${artist.awards.slice(0, 2).join(', ')}\n\nWould you like me to play their songs one by one? Just say "play ${alias} songs" and I'll start the playlist!`,
          action: 'artist_info',
          confidence: 0.9
        };
      }
    }
  }

  // Check for "play [artist] songs" requests
  for (const [alias, fullName] of Object.entries(artistAliases)) {
    if (lowerText.includes(`play ${alias}`) || lowerText.includes(`${alias} songs`) || lowerText.includes(`${alias} playlist`)) {
      return {
        intent: 'artist_playlist_request',
        artist: fullName,
        response: `🎵 Starting ${musicDatabase.artists[fullName]?.name || alias} playlist! I'll play their best songs one by one.`,
        action: 'play_artist_playlist',
        confidence: 0.95
      };
    }
  }

  // Check full artist names
  for (const [key, artist] of Object.entries(musicDatabase.artists)) {
    if (lowerText.includes(key) || lowerText.includes(artist.name.toLowerCase())) {
      return {
        intent: 'artist_discussion',
        artist: artist,
        response: `${artist.name}! Excellent taste! 🎵 They're absolutely legendary in ${artist.languages.join(', ')} music.\n\n🎬 **Famous Movies:** ${artist.movies.slice(0, 3).join(', ')}\n🎤 **Hit Songs:** ${artist.famousSongs.slice(0, 5).join(', ')}\n\nWould you like me to play their songs? Just ask for "${artist.name} playlist"!`,
        action: 'artist_info',
        confidence: 0.9
      };
    }
  }

  // Music mood detection with context
  const moodKeywords = {
    happy: {
      primary: ['happy', 'joyful', 'cheerful', 'upbeat', 'energetic', 'excited', 'celebration', 'party'],
      secondary: ['good mood', 'feeling great', 'positive', 'bright', 'sunny']
    },
    sad: {
      primary: ['sad', 'depressed', 'melancholy', 'down', 'blue', 'heartbroken', 'crying'],
      secondary: ['feeling low', 'not good', 'upset', 'emotional', 'lonely']
    },
    romantic: {
      primary: ['romantic', 'love', 'valentine', 'date', 'romance', 'heart'],
      secondary: ['in love', 'relationship', 'couple', 'anniversary', 'propose']
    },
    energetic: {
      primary: ['workout', 'gym', 'exercise', 'dance', 'party', 'energetic', 'pump up'],
      secondary: ['motivation', 'run', 'fitness', 'active', 'get moving']
    },
    relaxing: {
      primary: ['calm', 'peaceful', 'relax', 'chill', 'meditation', 'sleep', 'rest'],
      secondary: ['unwind', 'stress relief', 'quiet', 'soothing', 'zen']
    }
  };
  
  // Language detection with cultural context
  const languageKeywords = {
    tamil: {
      primary: ['tamil', 'kollywood', 'chennai'],
      secondary: ['tamil nadu', 'south indian', 'dravidian']
    },
    hindi: {
      primary: ['hindi', 'bollywood', 'mumbai'],
      secondary: ['indian', 'north indian', 'desi']
    },
    telugu: {
      primary: ['telugu', 'tollywood', 'hyderabad'],
      secondary: ['andhra', 'south indian', 'telangana']
    },
    malayalam: {
      primary: ['malayalam', 'mollywood', 'kerala'],
      secondary: ['south indian', 'kerala music']
    },
    kannada: {
      primary: ['kannada', 'sandalwood', 'bangalore'],
      secondary: ['karnataka', 'south indian']
    },
    english: {
      primary: ['english', 'hollywood', 'western'],
      secondary: ['international', 'american', 'british']
    }
  };
  
  // Detect mood with confidence scoring
  let detectedMood = null;
  let moodConfidence = 0;
  
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    const primaryMatches = keywords.primary.filter(keyword => lowerText.includes(keyword)).length;
    const secondaryMatches = keywords.secondary.filter(keyword => lowerText.includes(keyword)).length;
    
    const confidence = (primaryMatches * 0.8) + (secondaryMatches * 0.5);
    if (confidence > moodConfidence) {
      moodConfidence = confidence;
      detectedMood = mood;
    }
  }
  
  // Detect language with confidence scoring
  let detectedLanguage = null;
  let languageConfidence = 0;
  
  for (const [language, keywords] of Object.entries(languageKeywords)) {
    const primaryMatches = keywords.primary.filter(keyword => lowerText.includes(keyword)).length;
    const secondaryMatches = keywords.secondary.filter(keyword => lowerText.includes(keyword)).length;
    
    const confidence = (primaryMatches * 0.9) + (secondaryMatches * 0.4);
    if (confidence > languageConfidence) {
      languageConfidence = confidence;
      detectedLanguage = language;
    }
  }
  
  // Generate contextual response
  return generateContextualResponse(text, detectedMood, detectedLanguage, moodConfidence, languageConfidence);
}

function generateContextualResponse(originalText, mood, language, moodConfidence, languageConfidence) {
  const lowerText = originalText.toLowerCase();
  
  // Handle specific music requests with both mood and language
  if (mood && language && (moodConfidence > 0.3 || languageConfidence > 0.3)) {
    return {
      intent: 'curated_playlist_request',
      mood: mood,
      language: language,
      response: `Perfect match! 🎵 I'll create a curated ${mood} ${language} playlist for you with handpicked songs and auto-play on YouTube!`,
      action: 'generate_curated_playlist',
      confidence: Math.max(moodConfidence, languageConfidence)
    };
  }
  
  // Handle music requests with individual mood or language
  if (lowerText.includes('play') || lowerText.includes('listen') || lowerText.includes('want to hear') || lowerText.includes('music')) {
    if (mood && moodConfidence > 0.5) {
      return {
        intent: 'mood_music_request',
        mood: mood,
        response: `Got it! You're looking for ${mood} music. Which language would you prefer? I have great collections in Tamil, Hindi, Telugu, Malayalam, and more! 🎶`,
        followUp: 'language_preference',
        confidence: moodConfidence
      };
    } else if (language && languageConfidence > 0.5) {
      return {
        intent: 'language_music_request',
        language: language,
        response: `Great choice! ${language.charAt(0).toUpperCase() + language.slice(1)} music is amazing. What's your current mood? Happy, sad, romantic, or energetic? 🎵`,
        followUp: 'mood_preference',
        confidence: languageConfidence
      };
    }
  }
  
  // Handle mood expressions
  if (lowerText.includes('i feel') || lowerText.includes('i\'m feeling') || lowerText.includes('feeling')) {
    if (mood && moodConfidence > 0.4) {
      return {
        intent: 'mood_expression',
        mood: mood,
        response: `I can tell you're feeling ${mood}! Music is such a great way to match or change our mood. What language or artist would you like to explore? 🎵`,
        followUp: 'music_suggestion',
        confidence: moodConfidence
      };
    }
  }
  // Handle questions about the bot
  if (lowerText.includes('what can you do') || lowerText.includes('help me') || lowerText.includes('how do you work')) {
    return {
      intent: 'bot_inquiry',
      response: `I'm your personal music companion! 🎵 I can:\n\n• Understand your mood and suggest perfect songs\n• Recommend music in Tamil, Hindi, Telugu, Malayalam, Kannada & English\n• Tell you about famous artists and composers\n• Find music for any situation - workout, relaxation, romance, party\n• Search YouTube and provide links to all major platforms\n\nJust tell me how you're feeling or what you want to listen to!`,
      confidence: 0.95
    };
  }

  // Default intelligent response
  return {
    intent: 'general_inquiry',
    response: `I'd love to help you find the perfect music! 🎵 Could you tell me more about what you're looking for? For example:\n\n• Your current mood (happy, sad, energetic, etc.)\n• Language preference (Tamil, Hindi, Telugu, etc.)\n• Specific artist or type of music\n• The occasion (workout, relaxation, party, etc.)\n\nI'm here to understand exactly what you need! 😊`,
    confidence: 0.6
  };
}// Load playlists
let playlists = [];
try {
  const playlistData = fs.readFileSync(path.join(__dirname, 'data', 'playlists.json'), 'utf8');
  playlists = JSON.parse(playlistData);
} catch (error) {
  console.log('Could not load playlists:', error.message);
  playlists = [];
}

// Generate curated playlists based on mood and language
function generateCuratedPlaylist(mood, language) {
  const playlists = {
    // Tamil Playlists - Comprehensive Collection
    'happy-tamil': {
      title: `🎵 Happy Tamil Hits`,
      description: 'Upbeat Tamil songs to brighten your day',
      songs: [
        { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', movie: '3', search: 'Why This Kolaveri Di 3 Anirudh' },
        { title: 'Aaluma Doluma', artist: 'Anirudh Ravichander', movie: 'Vedalam', search: 'Aaluma Doluma Vedalam Anirudh' },
        { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', movie: 'Master', search: 'Vaathi Coming Master Anirudh' },
        { title: 'Mukkala Mukkabala', artist: 'A.R. Rahman', movie: 'Kaadhalan', search: 'Mukkala Mukkabala Kaadhalan AR Rahman' },
        { title: 'Selfie Pulla', artist: 'Anirudh Ravichander', movie: 'Kaththi', search: 'Selfie Pulla Kaththi Anirudh' },
        { title: 'Rakkamma Kaiya Thattu', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Rakkamma Kaiya Thattu Thalapathi Ilaiyaraaja' },
        { title: 'Maari Thara Local', artist: 'Anirudh Ravichander', movie: 'Maari', search: 'Maari Thara Local Anirudh' },
        { title: 'Ethir Neechal', artist: 'Anirudh Ravichander', movie: 'Ethir Neechal', search: 'Ethir Neechal Title Song Anirudh' }
      ]
    },
    'romantic-tamil': {
      title: `❤️ Romantic Tamil Songs`,
      description: 'Beautiful Tamil love songs for romantic moments',
      songs: [
        { title: 'Nenjukkul Peidhidum', artist: 'Yuvan Shankar Raja', movie: 'Vaaranam Aayiram', search: 'Nenjukkul Peidhidum Vaaranam Aayiram Harris Jayaraj' },
        { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu', search: 'Vennilave Vennilave Minsara Kanavu AR Rahman' },
        { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja', search: 'Kadhal Rojave Roja AR Rahman' },
        { title: 'Uyire Uyire', artist: 'A.R. Rahman', movie: 'Bombay', search: 'Uyire Uyire Bombay AR Rahman' },
        { title: 'Vaseegara', artist: 'Harris Jayaraj', movie: 'Minnale', search: 'Vaseegara Minnale Harris Jayaraj' },
        { title: 'Munbe Vaa', artist: 'Harris Jayaraj', movie: 'Sillunu Oru Kaadhal', search: 'Munbe Vaa Sillunu Oru Kaadhal Harris' },
        { title: 'Thalli Pogathey', artist: 'A.R. Rahman', movie: 'Achcham Yenbadhu Madamaiyada', search: 'Thalli Pogathey Achcham Yenbadhu Madamaiyada' },
        { title: 'Vinnaithandi Varuvaya', artist: 'A.R. Rahman', movie: 'Vinnaithandi Varuvaya', search: 'Vinnaithandi Varuvaya Title Song AR Rahman' }
      ]
    },
    'sad-tamil': {
      title: `💔 Emotional Tamil Songs`,
      description: 'Soulful Tamil songs for reflective moments',
      songs: [
        { title: 'Kanne Kalaimane', artist: 'Ilaiyaraaja', movie: 'Moondram Pirai', search: 'Kanne Kalaimane Moondram Pirai Ilaiyaraaja' },
        { title: 'Pachai Nirame', artist: 'A.R. Rahman', movie: 'Alaipayuthey', search: 'Pachai Nirame Alaipayuthey AR Rahman' },
        { title: 'Mundhinam Paarthene', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram', search: 'Mundhinam Paarthene Vaaranam Aayiram Harris' },
        { title: 'Yaaradi Nee Mohini', artist: 'Yuvan Shankar Raja', movie: 'Yaaradi Nee Mohini', search: 'Yaaradi Nee Mohini Title Song Yuvan' },
        { title: 'Kanave Kanave', artist: 'Harris Jayaraj', movie: 'David', search: 'Kanave Kanave David Harris Jayaraj' },
        { title: 'Maula Wa Sallim', artist: 'A.R. Rahman', movie: 'O Kadhal Kanmani', search: 'Maula Wa Sallim OK Kanmani AR Rahman' },
        { title: 'Potri Paadadi Penne', artist: 'Ilaiyaraaja', movie: 'Thevar Magan', search: 'Potri Paadadi Penne Thevar Magan Ilaiyaraaja' },
        { title: 'Sundari Kannal Oru Sethi', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Sundari Kannal Oru Sethi Thalapathi Ilaiyaraaja' }
      ]
    },
    'energetic-tamil': {
      title: `⚡ Energetic Tamil Beats`,
      description: 'High-energy Tamil songs for workouts and dance',
      songs: [
        { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', movie: 'Beast', search: 'Arabic Kuthu Beast Anirudh' },
        { title: 'Rowdy Baby', artist: 'Yuvan Shankar Raja', movie: 'Maari 2', search: 'Rowdy Baby Maari 2 Yuvan' },
        { title: 'Surviva', artist: 'Anirudh Ravichander', movie: 'Vivegam', search: 'Surviva Vivegam Anirudh' },
        { title: 'Naakka Mukka', artist: 'Vijay Antony', movie: 'Kadhalil Vizhunthen', search: 'Naakka Mukka Kadhalil Vizhunthen Vijay Antony' },
        { title: 'Urvasi Urvasi', artist: 'A.R. Rahman', movie: 'Kadhalan', search: 'Urvasi Urvasi Kadhalan AR Rahman' },
        { title: 'Marana Mass', artist: 'Anirudh Ravichander', movie: 'Petta', search: 'Marana Mass Petta Anirudh' },
        { title: 'Kaasu Panam', artist: 'Santhosh Narayanan', movie: 'Soodhu Kavvum', search: 'Kaasu Panam Soodhu Kavvum Santhosh Narayanan' },
        { title: 'Pathala Pathala', artist: 'Anirudh Ravichander', movie: 'Vikram', search: 'Pathala Pathala Vikram Anirudh' }
      ]
    },
    'relaxing-tamil': {
      title: `😌 Peaceful Tamil Melodies`,
      description: 'Calming Tamil songs for relaxation',
      songs: [
        { title: 'Ilamai Idho Idho', artist: 'Ilaiyaraaja', movie: 'Sakalakala Vallavan', search: 'Ilamai Idho Idho Sakalakala Vallavan Ilaiyaraaja' },
        { title: 'Mandram Vantha Thendralukku', artist: 'Ilaiyaraaja', movie: 'Mouna Ragam', search: 'Mandram Vantha Thendralukku Mouna Ragam Ilaiyaraaja' },
        { title: 'Mazhai Kuruvi', artist: 'A.R. Rahman', movie: 'Chekka Chivantha Vaanam', search: 'Mazhai Kuruvi CCV AR Rahman' },
        { title: 'Usure Pogudhey', artist: 'Harris Jayaraj', movie: 'Raavanan', search: 'Usure Pogudhey Raavanan Harris Jayaraj' },
        { title: 'Theeyae Theeyae', artist: 'A.R. Rahman', movie: 'Thiruda Thiruda', search: 'Theeyae Theeyae Thiruda Thiruda AR Rahman' },
        { title: 'Thenpandi Cheemayile', artist: 'Ilaiyaraaja', movie: 'Nayakan', search: 'Thenpandi Cheemayile Nayakan Ilaiyaraaja' },
        { title: 'Pudhu Vellai Mazhai', artist: 'A.R. Rahman', movie: 'Roja', search: 'Pudhu Vellai Mazhai Roja AR Rahman' },
        { title: 'Chinna Chinna Aasai', artist: 'A.R. Rahman', movie: 'Roja', search: 'Chinna Chinna Aasai Roja AR Rahman' }
      ]
    },

    // Music Director Specific Playlists
    'ilaiyaraaja-playlist': {
      title: `� Ilaiyaraaja Masterpieces`,
      description: 'Classic compositions by the Maestro Ilaiyaraaja',
      songs: [
        { title: 'Rakkamma Kaiya Thattu', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Rakkamma Kaiya Thattu Thalapathi Ilaiyaraaja' },
        { title: 'Sundari Kannal Oru Sethi', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Sundari Kannal Oru Sethi Thalapathi' },
        { title: 'Potri Paadadi Penne', artist: 'Ilaiyaraaja', movie: 'Thevar Magan', search: 'Potri Paadadi Penne Thevar Magan' },
        { title: 'Kanne Kalaimane', artist: 'Ilaiyaraaja', movie: 'Moondram Pirai', search: 'Kanne Kalaimane Moondram Pirai' },
        { title: 'Ilamai Idho Idho', artist: 'Ilaiyaraaja', movie: 'Sakalakala Vallavan', search: 'Ilamai Idho Idho Sakalakala Vallavan' },
        { title: 'Mandram Vantha Thendralukku', artist: 'Ilaiyaraaja', movie: 'Mouna Ragam', search: 'Mandram Vantha Thendralukku Mouna Ragam' },
        { title: 'Thenpandi Cheemayile', artist: 'Ilaiyaraaja', movie: 'Nayakan', search: 'Thenpandi Cheemayile Nayakan' },
        { title: 'Oruvan Oruvan Mudhalali', artist: 'Ilaiyaraaja', movie: 'Muthu', search: 'Oruvan Oruvan Mudhalali Muthu' },
        { title: 'Shenbagame Shenbagame', artist: 'Ilaiyaraaja', movie: 'Enga Ooru Pattukaran', search: 'Shenbagame Shenbagame Enga Ooru Pattukaran' },
        { title: 'Aasai Athigam Vachu', artist: 'Ilaiyaraaja', movie: 'Marupadiyum', search: 'Aasai Athigam Vachu Marupadiyum' }
      ]
    },

    'ar-rahman-playlist': {
      title: `🎵 A.R. Rahman Classics`,
      description: 'Iconic compositions by the Mozart of Madras',
      songs: [
        { title: 'Chinna Chinna Aasai', artist: 'A.R. Rahman', movie: 'Roja', search: 'Chinna Chinna Aasai Roja AR Rahman' },
        { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja', search: 'Kadhal Rojave Roja AR Rahman' },
        { title: 'Uyire Uyire', artist: 'A.R. Rahman', movie: 'Bombay', search: 'Uyire Uyire Bombay AR Rahman' },
        { title: 'Thaiyya Thaiyya', artist: 'A.R. Rahman', movie: 'Uyire', search: 'Thaiyya Thaiyya Uyire AR Rahman' },
        { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu', search: 'Vennilave Vennilave Minsara Kanavu' },
        { title: 'Snehidhane Snehidhane', artist: 'A.R. Rahman', movie: 'Alaipayuthey', search: 'Snehidhane Snehidhane Alaipayuthey' },
        { title: 'New York Nagaram', artist: 'A.R. Rahman', movie: 'Sillunu Oru Kaadhal', search: 'New York Nagaram Sillunu Oru Kaadhal' },
        { title: 'Hosanna', artist: 'A.R. Rahman', movie: 'Vinnaithaandi Varuvaayaa', search: 'Hosanna Vinnaithaandi Varuvaayaa' },
        { title: 'Aalaporaan Thamizhan', artist: 'A.R. Rahman', movie: 'Mersal', search: 'Aalaporaan Thamizhan Mersal AR Rahman' }
      ]
    }
  };

  const key = `${mood}-${language}`;
  let playlist = playlists[key];
  
  // If no specific mood playlist, check for artist-specific playlists
  if (!playlist && (mood.includes('ilaiyaraaja') || mood.includes('raja'))) {
    playlist = playlists['ilaiyaraaja-playlist'];
  } else if (!playlist && (mood.includes('rahman') || mood.includes('ar rahman'))) {
    playlist = playlists['ar-rahman-playlist'];
  }
  
  if (playlist) {
    return {
      ...playlist,
      mood: mood,
      language: language,
      autoPlay: true
    };
  }
  
  return null;
}

// Generate artist-specific playlists
function generateArtistPlaylist(artistKey) {
  const artistPlaylists = {
    'ilaiyaraaja': {
      title: `🎼 Ilaiyaraaja Masterpieces`,
      description: 'Classic compositions by the Maestro Ilaiyaraaja',
      artist: 'Ilaiyaraaja',
      songs: [
        { title: 'Rakkamma Kaiya Thattu', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Rakkamma Kaiya Thattu Thalapathi Ilaiyaraaja' },
        { title: 'Sundari Kannal Oru Sethi', artist: 'Ilaiyaraaja', movie: 'Thalapathi', search: 'Sundari Kannal Oru Sethi Thalapathi' },
        { title: 'Potri Paadadi Penne', artist: 'Ilaiyaraaja', movie: 'Thevar Magan', search: 'Potri Paadadi Penne Thevar Magan' },
        { title: 'Kanne Kalaimane', artist: 'Ilaiyaraaja', movie: 'Moondram Pirai', search: 'Kanne Kalaimane Moondram Pirai' },
        { title: 'Ilamai Idho Idho', artist: 'Ilaiyaraaja', movie: 'Sakalakala Vallavan', search: 'Ilamai Idho Idho Sakalakala Vallavan' },
        { title: 'Mandram Vantha Thendralukku', artist: 'Ilaiyaraaja', movie: 'Mouna Ragam', search: 'Mandram Vantha Thendralukku Mouna Ragam' },
        { title: 'Thenpandi Cheemayile', artist: 'Ilaiyaraaja', movie: 'Nayakan', search: 'Thenpandi Cheemayile Nayakan' },
        { title: 'Oruvan Oruvan Mudhalali', artist: 'Ilaiyaraaja', movie: 'Muthu', search: 'Oruvan Oruvan Mudhalali Muthu' },
        { title: 'Shenbagame Shenbagame', artist: 'Ilaiyaraaja', movie: 'Enga Ooru Pattukaran', search: 'Shenbagame Shenbagame Enga Ooru Pattukaran' },
        { title: 'Aasai Athigam Vachu', artist: 'Ilaiyaraaja', movie: 'Marupadiyum', search: 'Aasai Athigam Vachu Marupadiyum' }
      ]
    },
    'a.r. rahman': {
      title: `🎵 A.R. Rahman Classics`,
      description: 'Iconic compositions by the Mozart of Madras',
      artist: 'A.R. Rahman',
      songs: [
        { title: 'Chinna Chinna Aasai', artist: 'A.R. Rahman', movie: 'Roja', search: 'Chinna Chinna Aasai Roja AR Rahman' },
        { title: 'Kadhal Rojave', artist: 'A.R. Rahman', movie: 'Roja', search: 'Kadhal Rojave Roja AR Rahman' },
        { title: 'Uyire Uyire', artist: 'A.R. Rahman', movie: 'Bombay', search: 'Uyire Uyire Bombay AR Rahman' },
        { title: 'Thaiyya Thaiyya', artist: 'A.R. Rahman', movie: 'Uyire', search: 'Thaiyya Thaiyya Uyire AR Rahman' },
        { title: 'Vennilave Vennilave', artist: 'A.R. Rahman', movie: 'Minsara Kanavu', search: 'Vennilave Vennilave Minsara Kanavu' },
        { title: 'Snehidhane Snehidhane', artist: 'A.R. Rahman', movie: 'Alaipayuthey', search: 'Snehidhane Snehidhane Alaipayuthey' },
        { title: 'New York Nagaram', artist: 'A.R. Rahman', movie: 'Sillunu Oru Kaadhal', search: 'New York Nagaram Sillunu Oru Kaadhal' },
        { title: 'Hosanna', artist: 'A.R. Rahman', movie: 'Vinnaithaandi Varuvaayaa', search: 'Hosanna Vinnaithaandi Varuvaayaa' },
        { title: 'Aalaporaan Thamizhan', artist: 'A.R. Rahman', movie: 'Mersal', search: 'Aalaporaan Thamizhan Mersal AR Rahman' }
      ]
    },
    'yuvan shankar raja': {
      title: `🎸 Yuvan Shankar Raja Hits`,
      description: 'Contemporary compositions by the Little Maestro',
      artist: 'Yuvan Shankar Raja',
      songs: [
        { title: 'Iragai Pole', artist: 'Yuvan Shankar Raja', movie: 'Naan Mahaan Alla', search: 'Iragai Pole Naan Mahaan Alla Yuvan' },
        { title: 'Ninaithu Ninaithu Parthen', artist: 'Yuvan Shankar Raja', movie: '7G Rainbow Colony', search: 'Ninaithu Ninaithu Parthen 7G Rainbow Colony' },
        { title: 'Oru Kal Oru Kannadi', artist: 'Yuvan Shankar Raja', movie: 'Siva Manasula Sakthi', search: 'Oru Kal Oru Kannadi Siva Manasula Sakthi' },
        { title: 'Idhu Varai', artist: 'Yuvan Shankar Raja', movie: 'Goa', search: 'Idhu Varai Goa Yuvan' },
        { title: 'Pogathey Pogathey', artist: 'Yuvan Shankar Raja', movie: 'Deepavali', search: 'Pogathey Pogathey Deepavali Yuvan' },
        { title: 'Mun Paniya', artist: 'Yuvan Shankar Raja', movie: 'Nandha', search: 'Mun Paniya Nandha Yuvan' },
        { title: 'Aarariraro', artist: 'Yuvan Shankar Raja', movie: 'Raam', search: 'Aarariraro Raam Yuvan' },
        { title: 'En Kadhal Solla', artist: 'Yuvan Shankar Raja', movie: 'Paiyaa', search: 'En Kadhal Solla Paiyaa Yuvan' },
        { title: 'Rowdy Baby', artist: 'Yuvan Shankar Raja', movie: 'Maari 2', search: 'Rowdy Baby Maari 2 Yuvan' },
        { title: 'Anbe Peranbe', artist: 'Yuvan Shankar Raja', movie: 'NGK', search: 'Anbe Peranbe NGK Yuvan' }
      ]
    },
    'anirudh ravichander': {
      title: `🎤 Anirudh Ravichander Hits`,
      description: 'Modern chartbusters by the Rockstar',
      artist: 'Anirudh Ravichander',
      songs: [
        { title: 'Why This Kolaveri Di', artist: 'Anirudh Ravichander', movie: '3', search: 'Why This Kolaveri Di 3 Anirudh' },
        { title: 'Ethir Neechal', artist: 'Anirudh Ravichander', movie: 'Ethir Neechal', search: 'Ethir Neechal Title Song Anirudh' },
        { title: 'Aaluma Doluma', artist: 'Anirudh Ravichander', movie: 'Vedalam', search: 'Aaluma Doluma Vedalam Anirudh' },
        { title: 'Marana Mass', artist: 'Anirudh Ravichander', movie: 'Petta', search: 'Marana Mass Petta Anirudh' },
        { title: 'Vaathi Coming', artist: 'Anirudh Ravichander', movie: 'Master', search: 'Vaathi Coming Master Anirudh' },
        { title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', movie: 'Beast', search: 'Arabic Kuthu Beast Anirudh' },
        { title: 'Naa Ready', artist: 'Anirudh Ravichander', movie: 'Leo', search: 'Naa Ready Leo Anirudh' },
        { title: 'Chellamma', artist: 'Anirudh Ravichander', movie: 'Doctor', search: 'Chellamma Doctor Anirudh' },
        { title: 'Don\'u Don\'u Don\'u', artist: 'Anirudh Ravichander', movie: 'Maari', search: 'Donu Donu Donu Maari Anirudh' },
        { title: 'Pathala Pathala', artist: 'Anirudh Ravichander', movie: 'Vikram', search: 'Pathala Pathala Vikram Anirudh' }
      ]
    },
    'harris jayaraj': {
      title: `🎼 Harris Jayaraj Melodies`,
      description: 'Romantic melodies by the Melody King',
      artist: 'Harris Jayaraj',
      songs: [
        { title: 'Vaseegara', artist: 'Harris Jayaraj', movie: 'Minnale', search: 'Vaseegara Minnale Harris Jayaraj' },
        { title: 'Ondra Renda', artist: 'Harris Jayaraj', movie: 'Kaakha Kaakha', search: 'Ondra Renda Kaakha Kaakha Harris' },
        { title: 'Anbe En Anbe', artist: 'Harris Jayaraj', movie: 'Dhaam Dhoom', search: 'Anbe En Anbe Dhaam Dhoom Harris' },
        { title: 'Mundhinam Paarthene', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram', search: 'Mundhinam Paarthene Vaaranam Aayiram Harris' },
        { title: 'Hasili Fisiliye', artist: 'Harris Jayaraj', movie: 'Aadhavan', search: 'Hasili Fisiliye Aadhavan Harris' },
        { title: 'Engeyum Kaadhal', artist: 'Harris Jayaraj', movie: 'Engeyum Kaadhal', search: 'Engeyum Kaadhal Title Song Harris' },
        { title: 'Google Google', artist: 'Harris Jayaraj', movie: 'Thuppakki', search: 'Google Google Thuppakki Harris' },
        { title: 'Unakkenna Venum Sollu', artist: 'Harris Jayaraj', movie: 'Yennai Arindhaal', search: 'Unakkenna Venum Sollu Yennai Arindhaal' },
        { title: 'Venmathiye', artist: 'Harris Jayaraj', movie: 'Minnale', search: 'Venmathiye Minnale Harris' },
        { title: 'Anal Mele Panithuli', artist: 'Harris Jayaraj', movie: 'Vaaranam Aayiram', search: 'Anal Mele Panithuli Vaaranam Aayiram' }
      ]
    },
    's.p. balasubrahmanyam': {
      title: `🎤 SPB Legendary Hits`,
      description: 'Timeless classics by the legendary voice SPB',
      artist: 'S.P. Balasubrahmanyam',
      songs: [
        { title: 'Ithu Oru Ponmalai', artist: 'S.P. Balasubrahmanyam', movie: 'Nizhalgal', search: 'Ithu Oru Ponmalai Nizhalgal SPB' },
        { title: 'Mandram Vandha', artist: 'S.P. Balasubrahmanyam', movie: 'Mouna Ragam', search: 'Mandram Vandha Mouna Ragam SPB' },
        { title: 'Enna Satham Intha Neram', artist: 'S.P. Balasubrahmanyam', movie: 'Punnagai Mannan', search: 'Enna Satham Intha Neram Punnagai Mannan SPB' },
        { title: 'Kadhal Rojave', artist: 'S.P. Balasubrahmanyam', movie: 'Roja', search: 'Kadhal Rojave Roja SPB' },
        { title: 'Sangeetha Jathi Mullai', artist: 'S.P. Balasubrahmanyam', movie: 'Kadhal Oviyam', search: 'Sangeetha Jathi Mullai Kadhal Oviyam SPB' },
        { title: 'Ilaya Nila', artist: 'S.P. Balasubrahmanyam', movie: 'Payanangal Mudivathillai', search: 'Ilaya Nila Payanangal Mudivathillai SPB' },
        { title: 'Mannil Indha Kadhalandri', artist: 'S.P. Balasubrahmanyam', movie: 'Keladi Kanmani', search: 'Mannil Indha Kadhalandri Keladi Kanmani SPB' },
        { title: 'Sundari Kannal Oru Sethi', artist: 'S.P. Balasubrahmanyam', movie: 'Thalapathi', search: 'Sundari Kannal Oru Sethi Thalapathi SPB' },
        { title: 'Oruvan Oruvan Mudhalali', artist: 'S.P. Balasubrahmanyam', movie: 'Muthu', search: 'Oruvan Oruvan Mudhalali Muthu SPB' },
        { title: 'Anjali Anjali', artist: 'S.P. Balasubrahmanyam', movie: 'Duet', search: 'Anjali Anjali Duet SPB' }
      ]
    }
  };
  
  const playlist = artistPlaylists[artistKey];
  
  if (playlist) {
    return {
      ...playlist,
      autoPlay: true
    };
  }
  
  return null;
}

// Get curated playlists
function getCuratedPlaylists(mood, language) {
  return playlists.filter(playlist => 
    playlist.mood.toLowerCase() === mood.toLowerCase() && 
    playlist.language.toLowerCase() === language.toLowerCase()
  );
}

// YouTube search function
async function searchYouTube(query) {
  try {
    const results = await youtubeSearch.GetListByKeyword(query, false, 5);
    return results.items.map(item => ({
      title: item.title,
      videoId: item.id,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.thumbnail.url,
      channel: item.channelTitle,
      duration: item.length?.simpleText || 'Unknown'
    }));
  } catch (error) {
    console.log('YouTube search error:', error.message);
    return [];
  }
}

// Socket connection handler
// Store conversation history per socket
const conversationHistory = new Map();

io.on('connection', async (socket) => {
  console.log('Client connected:', socket.id);
  
  // Initialize conversation history for this socket
  conversationHistory.set(socket.id, []);
  
  // Send AI-generated welcome message
  try {
    console.log('[welcome] Generating welcome message...');
    const welcome = await getWelcomeMessage();
    console.log('[welcome] Welcome message generated:', welcome ? 'OK' : 'NULL');
    socket.emit('bot', {
      text: welcome.text,
      musicControl: welcome.musicControl,
      type: 'welcome'
    });
    console.log('[welcome] Welcome message sent to client');
  } catch (error) {
    console.error('[welcome] ERROR generating welcome:', error.message);
    console.error('[welcome] Stack:', error.stack);
    socket.emit('bot', {
      text: `🎵 Welcome! I'm Artham, your intelligent music companion!\n\n🔑 Setup Required:\nAdd your FREE Groq API key to .env file!\nGet it at: https://console.groq.com/keys\n\nHow are you feeling today? 🎧`,
      type: 'welcome'
    });
  }

  socket.on('chat', async (msg) => {
    if (!msg || !msg.text) return;
    
    const text = msg.text.trim();
    console.log('Received message:', text);
    
    // Get conversation history
    const history = conversationHistory.get(socket.id) || [];
    
    // Add user message to history
    history.push({ role: 'user', content: text });
    
    try {
      // Process with OpenAI (Artham AI)
      const response = await processChat(history, {
        currentSong: msg.currentSong,
        mood: msg.mood,
        language: msg.language
      });
      
      // Add assistant response to history
      history.push({ role: 'assistant', content: response.fullResponse || response.text });
      
      // Keep history manageable (last 20 messages)
      if (history.length > 20) {
        history.splice(0, history.length - 20);
      }
      
      conversationHistory.set(socket.id, history);
      
      // Send response to client
      socket.emit('bot', {
        text: response.text,
        musicControl: response.musicControl,
        type: 'ai_response'
      });
      
    } catch (error) {
      console.error('Error processing chat:', error);
      
      // Send error message to user
      socket.emit('bot', {
        text: error.message || '⚠️ An error occurred while processing your message. Please try again.',
        type: 'error',
        isError: true
      });
    }
  });

  socket.on('youtube search', async (data) => {
    console.log('YouTube search request:', data);
    
    try {
      const searchResults = await searchYouTubeWithAPI(data.query);
      
      if (searchResults && searchResults.length > 0) {
        // Send search results back to client
        socket.emit('bot', {
          text: `🔍 **Search Results for "${data.query}":**\n\nFound ${searchResults.length} videos:`,
          type: 'youtube_search_results',
          searchResults: searchResults,
          originalQuery: data.query
        });
      } else {
        socket.emit('bot', {
          text: `❌ Sorry, I couldn't find any videos for "${data.query}". Try searching with different keywords.`,
          type: 'search_error'
        });
      }
    } catch (error) {
      console.error('YouTube search error:', error);
      socket.emit('bot', {
        text: `❌ There was an error searching for "${data.query}". Please try again.`,
        type: 'search_error'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up conversation history
    conversationHistory.delete(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  try {
    const addr = server.address();
    console.log('[listen] address info:', addr);
    console.log(`Enhanced Music Chatbot Server running on http://localhost:${PORT}`);
    // Self-check /health after brief delay
    setTimeout(() => {
      http.get(`http://127.0.0.1:${PORT}/health`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => console.log('[self-check] /health response:', data));
      }).on('error', (e) => console.error('[self-check-error]', e.message));
    }, 500);
  } catch (e) {
    console.error('[listen-catch]', e.message);
  }
});