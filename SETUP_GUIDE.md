# Music Mood Chatbot - Setup Instructions

## What Changed

### OLD BEHAVIOR:
- ❌ Short, rule-based responses
- ❌ Scanned for local MP3 files  
- ❌ Showed "Song File Status" with missing songs
- ❌ Required songs in `/music` folder

### NEW BEHAVIOR:
- ✅ **AI-Powered Conversations**: ChatGPT-like responses using GPT-4
- ✅ **Online Streaming**: Spotify + YouTube embeds (NO local files needed)
- ✅ **Smart Music Control**: AI detects mood and plays appropriate songs automatically
- ✅ **50+ Songs**: Pre-configured Tamil/Hindi/Telugu/Malayalam/Kannada songs

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

The `openai` package has been added for GPT-4 integration.

### 2. Configure Environment Variables

Create a `.env` file with your OpenAI API key:

```bash
cp .env.example .env
```

Then edit `.env` and add your keys:

```env
# REQUIRED - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-actual-key-here

# OPTIONAL - For YouTube search
YOUTUBE_API_KEY=your-youtube-key-here
```

**Important**: Without `OPENAI_API_KEY`, the chatbot will fall back to rule-based responses.

### 3. Start the Server

```bash
npm start
```

Open http://localhost:3000

---

## New Features

### 1. AI Chat Handler (`src/openaiHandler.js`)
- Uses GPT-4 with empathetic "Artham" personality
- Generates natural, 3-5 sentence responses
- Outputs `music-control` JSON blocks for playback

**System Prompt**: Artham is warm, empathetic, asks follow-up questions, and explains mood choices.

### 2. Song Catalog (`src/songCatalog.js`)
- **50+ songs** across all moods (happy, sad, romantic, energetic, relaxing, angry, nostalgic)
- Each song has:
  - Spotify ID & YouTube ID
  - Direct streaming URL (Spotify embed or YouTube embed)
  - Mood tags, language, artist, movie

**Languages**: Tamil, Hindi, Telugu, Malayalam, Kannada, English

### 3. Unified Music Player (`public/unified-music-player.js`)
- Plays **Spotify embeds**, **YouTube videos**, or **direct audio streams**
- Playlist management (play, pause, next, previous, shuffle)
- NO local files required

### 4. Music Control System
When AI wants to play music, it outputs:

```json
{
  "action": "play",
  "mode": "playlist",
  "mood": "happy",
  "language": "Tamil"
}
```

Client-side JavaScript parses this and triggers playback.

---

## Example Conversations

**User**: "I'm feeling really happy today!"

**Artham** (AI):
> That's wonderful to hear! 🎵 I love your positive energy! Happy days deserve uplifting music that matches that beautiful vibe.
>
> Since you're feeling joyful, I have some fantastic upbeat Tamil songs that will amplify your happiness even more! These tracks are pure energy and celebration.
>
> Would you like me to play some energetic Tamil hits that'll make you want to dance?

**[Automatically plays]: Vaathi Coming, Arabic Kuthu, Why This Kolaveri Di...**

---

**User**: "Play Vaseegara"

**Artham** (AI):
> Excellent choice! ❤️ Vaseegara by Harris Jayaraj from Minnale is one of the most iconic romantic songs in Tamil cinema! That melody is pure magic.
>
> Starting Vaseegara now... Get ready for some beautiful nostalgia! 🎵
>
> Are you a fan of Harris Jayaraj's romantic compositions? I can recommend more of his soulful tracks if you'd like!

**[Plays Vaseegara via Spotify/YouTube embed]**

---

## API Routes

### Song Catalog API

```javascript
GET /api/songs                     // Get all songs
GET /api/songs/mood/:mood          // Get songs by mood (happy, sad, romantic, etc.)
GET /api/songs/language/:language  // Get songs by language (Tamil, Hindi, etc.)
GET /api/songs/:id                 // Get song by ID
GET /api/songs/search/:query       // Search songs
```

---

## Files Modified/Created

### Created:
- `src/openaiHandler.js` - GPT-4 chat handler with Artham personality
- `src/songCatalog.js` - 50+ songs with real Spotify/YouTube IDs
- `public/unified-music-player.js` - Online streaming player
- `.env.example` - Environment variables template

### Modified:
- `server.js` - Added OpenAI integration + API routes
- `public/client.js` - Added music-control parsing + unified player init
- `public/index.html` - Loaded unified-music-player.js
- `package.json` - Added `openai` dependency

---

## Troubleshooting

### "AI not responding / falling back to rules"
- Check that `OPENAI_API_KEY` is set in `.env`
- Verify key is valid at https://platform.openai.com/api-keys
- Check server console for OpenAI API errors

### "Songs not playing"
- Songs stream from **Spotify** and **YouTube**
- Some songs may be region-restricted
- Check browser console for CORS or embed errors
- Try different songs from the catalog

### "Song File Status still showing"
- This is legacy UI - we've added new streaming system alongside it
- To fully remove, delete references to `local-music-player.js` in HTML

---

## Next Steps

1. **Add More Songs**: Edit `src/songCatalog.js` to add more tracks
2. **Customize AI Personality**: Edit system prompt in `src/openaiHandler.js`
3. **Add Platforms**: Integrate JioSaavn, Apple Music preview APIs
4. **Remove Legacy Code**: Clean up old local MP3 scanning logic once confirmed working

---

## Cost Estimate

**GPT-4 API Pricing** (as of Nov 2024):
- Input: $0.01 / 1K tokens  
- Output: $0.03 / 1K tokens

**Average conversation**:
- ~300 tokens input + 500 tokens output per message
- ~$0.018 per AI response
- 100 messages ≈ $1.80

**Tip**: Use GPT-3.5-turbo (cheaper) by changing `model: 'gpt-4'` to `model: 'gpt-3.5-turbo'` in `src/openaiHandler.js`

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for API failures
3. Verify all environment variables are set
4. Test with simple queries first ("I'm happy", "Play a song")

**Enjoy your AI-powered music companion! 🎵✨**
