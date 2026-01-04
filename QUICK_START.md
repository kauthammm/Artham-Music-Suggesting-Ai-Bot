# 🚀 Quick Start Guide - Artham AI

## Prerequisites
- Node.js installed (v14+)
- OpenAI API key (for general AI conversations)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Configure OpenAI API Key

Edit `.env` file and add your real OpenAI API key:
```
OPENAI_API_KEY=sk-your-real-key-here
```

**Where to get your key:**
1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key and paste it in `.env`

## Step 3: Start the Server
```bash
npm start
```

Server runs on: http://localhost:3000

## Step 4: Test Features

### Test General AI (ChatGPT-like):
Open http://localhost:3000 and try:
- "hi, can we talk?"
- "tell me a joke"
- "help me with homework"
- "what is javascript"

### Test Typo Handling:
- "i nned hlp pls"
- "can we tlk"
- "tell me a jke"

### Test Music (Spotify-style):
1. Click mood button (e.g., "Romantic")
2. Click language button (e.g., "Tamil")
3. See concrete playlist: "Romantic Tamil Songs - 12 songs"
4. Click "Play All" to start streaming

## Test API Endpoints Directly

### Get specific playlist:
```bash
curl http://localhost:3000/api/playlist/romantic/tamil
```

### Get all playlists:
```bash
curl http://localhost:3000/api/playlists
```

### Get catalog stats:
```bash
curl http://localhost:3000/api/stats
```

## Features Overview

### ✅ General AI Assistant
- Answers ANY question (coding, jokes, advice, study help)
- Handles typos gracefully
- Natural conversation flow

### ✅ Spotify-Style Music
- 50+ songs across 6 languages
- Concrete playlists with exact counts
- Play All, Shuffle, Queue controls
- Online streaming (Spotify/YouTube)
- Hover effects and animations

### ✅ Clean Architecture
- Modular services (openaiHandler, playlistService, songCatalog)
- RESTful API endpoints
- Separation of concerns

## Troubleshooting

### OpenAI API Errors:
**Problem:** "Incorrect API key provided"
**Solution:** Update OPENAI_API_KEY in `.env` with valid key from OpenAI

### No Songs Playing:
**Problem:** Clicking Play All does nothing
**Solution:** Check browser console for errors. Ensure unified-music-player.js is loaded.

### Playlist Not Showing:
**Problem:** Clicking mood+language shows loading forever
**Solution:** Check browser console for API errors. Verify server is running on port 3000.

### Server Won't Start:
**Problem:** "Port 3000 already in use"
**Solution:** Kill existing process or change PORT in .env

## Next Steps

1. **Add More Songs:** Edit `src/songCatalog.js` to expand catalog
2. **Customize System Prompt:** Edit `src/openaiHandler.js` to change AI personality
3. **Adjust Styling:** Edit `public/playlist-ui.css` to customize appearance
4. **Add Features:** Check IMPLEMENTATION_SUMMARY.md for enhancement ideas

## Support

For issues or questions, check:
- `IMPLEMENTATION_SUMMARY.md` - Full technical documentation
- `src/openaiHandler.js` - AI configuration
- `src/playlistService.js` - Playlist logic
- `src/songCatalog.js` - Music database

---

**Enjoy Artham AI! 🎵🤖**
