const axios = require('axios');
const youtubeSearch = require('youtube-search-api');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_BASE_URL = process.env.YOUTUBE_API_BASE_URL || 'https://www.googleapis.com/youtube/v3';

const queryCache = new Map();
const videoCache = new Map();

// Prevent unbounded growth for long-running servers.
const MAX_QUERY_CACHE = parseInt(process.env.YOUTUBE_QUERY_CACHE_MAX || '500', 10);
const MAX_VIDEO_CACHE = parseInt(process.env.YOUTUBE_VIDEO_CACHE_MAX || '500', 10);

function pruneCache(cache, maxSize) {
  if (!Number.isFinite(maxSize) || maxSize <= 0) return;
  while (cache.size > maxSize) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

function hasApiKey() {
  return !!YOUTUBE_API_KEY && !YOUTUBE_API_KEY.toLowerCase().includes('your-');
}

function buildSearchQuery(song) {
  const title = song.title || '';
  const artist = song.artist || '';
  return `${title} ${artist} official audio`.trim();
}

async function searchVideo(query) {
  if (queryCache.has(query)) return queryCache.get(query);

  if (!hasApiKey()) {
    return searchVideoFallback(query);
  }

  try {
    const response = await axios.get(`${YOUTUBE_API_BASE_URL}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 1,
        key: YOUTUBE_API_KEY,
        videoCategoryId: '10',
        videoEmbeddable: true,
        order: 'relevance'
      },
      timeout: 10000
    });

    const item = response.data?.items?.[0];
    if (!item || !item.id?.videoId) return null;

    const result = {
      videoId: item.id.videoId,
      title: item.snippet?.title || query,
      channel: item.snippet?.channelTitle || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || ''
    };

    queryCache.set(query, result);
    pruneCache(queryCache, MAX_QUERY_CACHE);
    return result;
  } catch (err) {
    return searchVideoFallback(query);
  }
}

async function searchVideoFallback(query) {
  try {
    const results = await youtubeSearch.GetListByKeyword(query, false, 1);
    const item = results?.items?.[0];
    if (!item?.id) return null;
    const result = {
      videoId: item.id,
      title: item.title || query,
      channel: item.channelTitle || '',
      thumbnail: item.thumbnail?.url || ''
    };
    queryCache.set(query, result);
    pruneCache(queryCache, MAX_QUERY_CACHE);
    return result;
  } catch (err) {
    return null;
  }
}

async function fetchVideoDetails(videoIds) {
  if (!hasApiKey() || !videoIds.length) return [];

  const response = await axios.get(`${YOUTUBE_API_BASE_URL}/videos`, {
    params: {
      part: 'contentDetails,snippet',
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY
    },
    timeout: 10000
  });

  const items = response.data?.items || [];
  items.forEach((item) => {
    const durationMs = parseIsoDuration(item.contentDetails?.duration);
    videoCache.set(item.id, {
      durationMs,
      title: item.snippet?.title || '',
      channel: item.snippet?.channelTitle || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || ''
    });
    pruneCache(videoCache, MAX_VIDEO_CACHE);
  });

  return items;
}

async function resolveSongs(songs) {
  const resolved = songs.map((song) => ({ ...song }));

  const searchPromises = resolved.map(async (song) => {
    if (song.youtubeId) return song;
    const query = buildSearchQuery(song);
    try {
      const result = await searchVideo(query);
      if (result) {
        song.youtubeId = result.videoId;
        song.thumbnail = result.thumbnail || song.thumbnail;
        song.channel = result.channel || song.channel;
        song.youtubeTitle = result.title || song.youtubeTitle;
        song.searchQuery = query;
      }
    } catch (err) {
      // Ignore search errors, use fallback data
    }
    return song;
  });

  await Promise.all(searchPromises);

  const idsToFetch = resolved
    .map((song) => song.youtubeId)
    .filter((id) => id && !videoCache.has(id));

  if (idsToFetch.length) {
    await fetchVideoDetails(idsToFetch.slice(0, 50));
  }

  return resolved.map((song) => {
    if (!song.youtubeId) return song;
    const details = videoCache.get(song.youtubeId);
    if (!details) return song;
    return {
      ...song,
      durationMs: details.durationMs || song.durationMs,
      thumbnail: song.thumbnail || details.thumbnail,
      channel: song.channel || details.channel,
      youtubeTitle: song.youtubeTitle || details.title
    };
  });
}

function parseIsoDuration(duration) {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}

module.exports = {
  hasApiKey,
  resolveSongs,
  searchVideo,
  fetchVideoDetails,
  parseIsoDuration
};
