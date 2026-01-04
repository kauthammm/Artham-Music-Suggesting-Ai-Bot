/**
 * Gemini AI Chat Handler - Artham Music Companion
 * 
 * This module handles AI conversations with a music-focused personality.
 * The AI assistant (Artham) is empathetic, knowledgeable about music, and
 * can control the music player through structured JSON commands.
 * 
 * Uses Google Gemini API
 */

const { getSongsByMood, getSongsByLanguage, getSongsByMoodAndLanguage, searchSongs } = require('./songCatalog');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const isApiConfigured = GEMINI_API_KEY && GEMINI_API_KEY.length > 20;

// Function to call Gemini API
async function callGemini(messages) {
  const systemMsg = messages.find(m => m.role === 'system');
  const systemInstruction = systemMsg ? systemMsg.content : '';
  
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const text = m.role === 'system' ? systemInstruction + '\n\n' + m.content : m.content;
      return {
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: text }]
      };
    });

  // Add system instruction as first user message if exists
  if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
    contents[0].parts[0].text = systemInstruction + '\n\n' + contents[0].parts[0].text;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return {
    choices: [{
      message: {
        content: data.candidates[0]?.content?.parts[0]?.text || ''
      }
    }]
  };
}

// System prompt that defines Artham's personality and capabilities
const SYSTEM_PROMPT = `You are "artham", a mood-based music companion app.

Your purpose is to understand the user's emotional state and respond with:
• Empathy
• Short emotional validation
• Music suggestions that match the mood
• A calm, friendly, human-like tone

Rules:
- Always respond as the app "artham", not as an AI or assistant
- Do not explain how you work
- Keep replies warm, minimal, and emotionally intelligent
- Never sound robotic or technical
- Do not ask too many questions at once

Response Structure:
1. Acknowledge the user's mood in 1 short line
2. Give emotional reassurance (1 line)
3. Recommend music (songs / artists / genres / playlists)
4. End with a gentle closing line

Mood Mapping:
- Happy → upbeat, feel-good, energetic tracks
- Sad → soft, comforting, emotional songs
- Stressed → calm, lo-fi, instrumental, ambient music
- Angry → controlled energy, alternative rock, intense but focused
- Lonely → warm vocals, acoustic, soulful music
- Motivated → high-energy, inspiring, rhythmic music

Tone:
- Personal
- Comforting
- Simple English
- Like a close friend who understands music and emotions

Example Reply Style:
"That sounds heavy… I'm here with you.
Let the music carry some of that weight.
Try these tracks: [song list].
Take a breath, and press play."

Music Control System:
When you want to play music, include a JSON block at the END of your message in this exact format:

\`\`\`music-control
{
  "action": "play",
  "mode": "playlist",
  "mood": "happy",
  "language": "Tamil",
  "songId": null,
  "songs": []
}
\`\`\`

Available actions:
- "play" - Start playing music
- "pause" - Pause current playback
- "resume" - Resume paused music
- "next" - Skip to next song
- "previous" - Go to previous song

Available modes:
- "single" - Play one specific song (requires songId)
- "playlist" - Play multiple songs (requires mood and/or language)

Available moods:
- happy, sad, romantic, energetic, relaxing, angry, stressed, nostalgic, lonely, motivated

Available languages:
- Tamil, Hindi, Malayalam, Telugu, Kannada, English`;

/**
 * Process a chat message and generate AI response
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} userContext - Additional context (mood, currentSong, etc.)
 * @returns {Promise<Object>} - AI response with text and optional music control
 */
async function processChat(messages, userContext = {}) {
  // Validate API key configuration first
  if (!isApiConfigured) {
    return {
      text: "🔑 Gemini API key missing or invalid.\n\nPlease add your API key to the .env file.\n\nThen restart the server.",
      musicControl: null,
      model: 'fallback',
      needsApiKey: true
    };
  }

  try {
    let conversationMessages = [ { role: 'system', content: SYSTEM_PROMPT } ];
    if (userContext.mood || userContext.language || userContext.currentSong) {
      conversationMessages.push({ role: 'system', content: `Current context: ${JSON.stringify(userContext)}` });
    }
    conversationMessages = conversationMessages.concat(messages);

    const completion = await callGemini(conversationMessages);

    const responseText = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    const musicControl = extractMusicControl(responseText);
    const displayText = responseText.replace(/```music-control[\s\S]*?```/g, '').trim();
    if (musicControl) {
      musicControl.songs = await getSongsForControl(musicControl);
    }
    return { text: displayText, musicControl, fullResponse: responseText, model: 'gemini-2.0-flash' };
  } catch (error) {
    console.error('[gemini-error] processChat:', error.message);
    const raw = (error.message || '').toLowerCase();
    if (raw.includes('401') || raw.includes('invalid') || raw.includes('unauthorized')) {
      return {
        text: "❌ Invalid Gemini API key.\n\nPlease check your API key in the .env file and restart the server.",
        musicControl: null,
        model: 'fallback',
        invalidKey: true
      };
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      return {
        text: "⚠️ Network error reaching Gemini. Check your internet connection.",
        musicControl: null,
        model: 'fallback',
        networkIssue: true
      };
    }
    return {
      text: "⚠️ Unexpected AI error. Details: " + error.message,
      musicControl: null,
      model: 'fallback',
      unknownError: true
    };
  }
}

/**
 * Extract music-control JSON block from AI response
 * @param {string} text - Full AI response text
 * @returns {Object|null} - Parsed music control object or null
 */
function extractMusicControl(text) {
  const musicControlRegex = /```music-control\s*([\s\S]*?)\s*```/;
  const match = text.match(musicControlRegex);
  
  if (match && match[1]) {
    try {
      const controlData = JSON.parse(match[1]);
      return controlData;
    } catch (error) {
      console.error('Failed to parse music-control JSON:', error);
      return null;
    }
  }
  
  return null;
}

/**
 * Get actual songs based on music control parameters
 * @param {Object} control - Music control object
 * @returns {Promise<Array>} - Array of song objects
 */
async function getSongsForControl(control) {
  const { action, mode, mood, language, songId, searchQuery } = control;

  // Single song mode
  if (mode === 'single' && songId) {
    const { getSongById } = require('./songCatalog');
    const song = getSongById(songId);
    return song ? [song] : [];
  }

  // Playlist mode
  if (mode === 'playlist') {
    if (mood && language) {
      return getSongsByMoodAndLanguage(mood, language);
    } else if (mood) {
      return getSongsByMood(mood);
    } else if (language) {
      return getSongsByLanguage(language);
    }
  }

  // Search mode
  if (mode === 'search' && searchQuery) {
    return searchSongs(searchQuery);
  }

  return [];
}

/**
 * Generate a welcome message from Artham
 * @returns {Promise<Object>} - Welcome message response
 */
async function getWelcomeMessage() {
  if (!isApiConfigured) {
    return {
      text: "🎵 Welcome to artham.\n\nI'm here to understand your mood and share music that matches how you feel.\n\nHow are you feeling today?",
      musicControl: null,
      model: 'fallback',
      needsApiKey: true
    };
  }
  
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: 'Hi, I just opened the music app!' }
    ];
    
    const completion = await callGemini(messages);
    
    const responseText = completion.choices[0]?.message?.content || '';
    const musicControl = extractMusicControl(responseText);
    const displayText = responseText.replace(/```music-control[\s\S]*?```/g, '').trim();

    return {
      text: displayText,
      musicControl: musicControl,
      model: 'gemini-2.0-flash'
    };
  } catch (error) {
    console.error('Failed to generate welcome message:', error);
    return {
      text: "🎵 Welcome to artham.\n\nI'm here to understand your mood and share music that matches how you feel.\n\nHow are you feeling today?",
      musicControl: null
    };
  }
}

module.exports = {
  processChat,
  getWelcomeMessage,
  extractMusicControl,
  generateLocalFallback
};

// ---------------- Local Fallback Implementation ----------------
function generateLocalFallback(messages, userContext = {}, error = null) {
  const lastUserMessage = messages.slice().reverse().find(m => m.role === 'user')?.content || '';
  const lower = lastUserMessage.toLowerCase();

  // Simple mood detection
  const moods = ['happy','sad','romantic','energetic','relaxed','angry','nostalgic','stressed'];
  const detectedMood = moods.find(m => lower.includes(m)) || userContext.mood || null;

  // Language detection
  const languages = ['tamil','hindi','malayalam','telugu','kannada','english'];
  const detectedLanguage = languages.find(l => lower.includes(l)) || userContext.language || null;

  // Decide if this looks like a general (non-music) query
  const musicKeywords = ['song','songs','music','playlist','play','listen'];
  const isMusicIntent = musicKeywords.some(k => lower.includes(k)) || detectedMood || detectedLanguage;

  let textParts = [];
  if (isMusicIntent) {
    // Richer music fallback conversation
    textParts.push("🎶 I can build a playlist for you even without full AI access.");
    if (detectedMood && detectedLanguage) {
      textParts.push(`Preparing a ${detectedMood} ${capitalize(detectedLanguage)} set with mood-matching tracks.`);
      textParts.push("You can ask me to shuffle, skip, or suggest similar moods afterwards.");
    } else if (detectedMood) {
      textParts.push(`I detected the mood '${detectedMood}'. Add a language (Tamil / Hindi / Malayalam / Telugu / Kannada / English) and I'll generate songs.`);
    } else if (detectedLanguage) {
      textParts.push(`You chose ${capitalize(detectedLanguage)}. Tell me your mood (happy, sad, romantic, energetic, relaxed, angry, nostalgic, stressed) for a tailored playlist.`);
    } else {
      textParts.push("Tell me both mood + language, like: 'happy tamil music' or 'romantic hindi playlist'.");
    }
    textParts.push("Tip: Try 'show energetic tamil playlist' or 'suggest relaxing english songs'.");
  } else {
    // General assistant richer fallback
    textParts.push("🤖 I'm in simplified offline mode, but I can still help clearly.");
    if (lower.includes('joke')) {
      textParts.push("Here's a quick one: Why do programmers prefer dark mode? Because light attracts bugs! 😄 Want another?");
    } else if (/(python|javascript|java|code)/.test(lower)) {
      textParts.push("Ask me for syntax examples, debugging steps, or best practices. For example: 'Explain Python lists' or 'JS async vs sync'.");
    } else if (/help|how to|explain/.test(lower)) {
      textParts.push("Give me a topic and I'll outline it step by step. E.g. 'Explain REST APIs' or 'Help with basic SQL joins'.");
    } else if (lower.match(/hi|hello|hey/)) {
      textParts.push("I can chat, recommend music, or answer general questions. What would you like to do first?");
    } else {
      textParts.push("You can ask me about technology, study topics, life tips, or music moods. Prefix with 'simple:' for shorter replies.");
    }
    textParts.push("Music tip: Add mood + language to get songs (e.g., 'nostalgic tamil songs').");
  }

  // Build minimal musicControl if we have both mood & language
  let musicControl = null;
  if (isMusicIntent && detectedMood && detectedLanguage) {
    musicControl = {
      action: 'play',
      mode: 'playlist',
      mood: detectedMood,
      language: capitalize(detectedLanguage),
      songs: require('./songCatalog').getSongsByMoodAndLanguage(detectedMood, capitalize(detectedLanguage))
    };
  }

  if (error) {
    textParts.push("(Network unavailable for full AI so using enhanced local mode.)");
  }

  return {
    text: textParts.join(' '),
    musicControl,
    error: error ? error.message : null
  };
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
