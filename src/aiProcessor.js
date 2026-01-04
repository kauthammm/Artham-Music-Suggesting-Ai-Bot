// AI Message Processing for Netlify Functions
function analyzeUserMessage(message) {
    const msgLower = message.toLowerCase();
    
    // Mood detection
    let mood = 'happy';
    if (msgLower.includes('sad') || msgLower.includes('cry') || msgLower.includes('emotional')) {
        mood = 'sad';
    } else if (msgLower.includes('romantic') || msgLower.includes('love') || msgLower.includes('heart')) {
        mood = 'romantic';
    } else if (msgLower.includes('energetic') || msgLower.includes('dance') || msgLower.includes('party')) {
        mood = 'happy';
    }
    
    // Language detection
    let language = 'tamil';
    if (msgLower.includes('hindi')) language = 'hindi';
    if (msgLower.includes('english')) language = 'english';
    if (msgLower.includes('telugu')) language = 'telugu';
    
    // Artist detection
    let artist = null;
    let action = 'generate_curated_playlist';
    
    if (msgLower.includes('a.r. rahman') || msgLower.includes('rahman')) {
        artist = 'A.R. Rahman';
        action = 'generate_artist_playlist';
    } else if (msgLower.includes('anirudh')) {
        artist = 'Anirudh Ravichander';
        action = 'generate_artist_playlist';
    } else if (msgLower.includes('ilaiyaraaja') || msgLower.includes('ilayaraja')) {
        artist = 'Ilaiyaraaja';
        action = 'generate_artist_playlist';
    } else if (msgLower.includes('yuvan')) {
        artist = 'Yuvan Shankar Raja';
        action = 'generate_artist_playlist';
    }
    
    // Generate response
    let response = "I'd love to help you find the perfect music! 🎵";
    if (action === 'generate_curated_playlist') {
        response = `Perfect! I'll create a ${mood} ${language} playlist for you with auto-play! 🎶`;
    } else if (action === 'generate_artist_playlist') {
        response = `Great choice! Here are the best ${artist} songs with YouTube playback! 🎵`;
    }
    
    return {
        intent: action === 'generate_curated_playlist' ? 'curated_playlist_request' : 'artist_playlist_request',
        mood: mood,
        language: language,
        artist: artist,
        action: action,
        response: response,
        confidence: 0.9
    };
}

module.exports = { analyzeUserMessage };