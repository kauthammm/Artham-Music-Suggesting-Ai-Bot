# 🎵 Artham - Intelligent Music Chatbot

## Overview
Artham is a full-featured AI-powered music companion that combines ChatGPT-like conversational intelligence with Spotify-style music playback and YouTube integration.

## 🌟 Key Features

### 1. Intelligent Conversation
- **General AI Assistant**: Full conversational capabilities powered by OpenAI GPT models
- **Music Expertise**: Deep knowledge of Indian music (Tamil, Hindi, Telugu, Malayalam, Kannada)
- **Typo Tolerance**: Understands messy text and casual language
- **Context Awareness**: Maintains conversation history for natural follow-ups

### 2. Music Modes

#### Standard Mode (Full AI)
- Complete conversational AI with music control
- Artist information and recommendations
- Mood-based playlist generation
- Multi-language support

#### Simple Mode (Lightweight)
- Prefix your message with `simple:` for quick responses
- Faster fallback logic without full conversation context
- Example: `simple: play romantic tamil songs`

### 3. Music Features

#### Playlist System
- **Curated Playlists**: Pre-made playlists by mood + language
  - Happy, Sad, Romantic, Energetic, Relaxing
  - Tamil, Hindi, Telugu, Malayalam, Kannada, English
- **Artist Playlists**: Dedicated collections for:
  - Ilaiyaraaja (Maestro classics)
  - A.R. Rahman (Modern legends)
  - Yuvan Shankar Raja (Contemporary hits)
  - Anirudh Ravichander (Rockstar tracks)
  - Harris Jayaraj (Melody king)
  - S.P. Balasubrahmanyam (SPB legends)

#### YouTube Integration
- Automatic song search on YouTube
- Best match selection using scoring algorithm
- Video options with quality filtering
- Auto-play playlists with transitions

#### Spotify Integration
- OAuth authentication flow
- Playlist retrieval and recommendations
- Shuffle and broadcast features
- Preview URLs for quick listening

### 4. Fallback & Resilience

#### Enhanced Local Fallback
When OpenAI API is unavailable:
- Rich multi-sentence responses
- Music mood/language detection
- Artist recognition via aliases
- Playlist recommendations
- General assistance prompts

#### Quota Management
- **Cooldown System**: 15-minute pause after quota errors
- **Model Fallback**: Tries gpt-4 → gpt-3.5-turbo → local
- **Visual Indicator**: Orange banner shows offline status with reason:
  - `no_key`: API key missing or invalid
  - `quota_429`: Quota exceeded (billing issue)
  - `cooldown`: Cooling down after error
  - `error`: General API failure

### 5. Admin & Diagnostics

#### Endpoints
- `/health` - Server health check
- `/diagnostics` - Uptime, memory, playlist stats
- `/diagnostics/full` - Complete system state
- `/admin` - Real-time dashboard
- `/api/debug-openai` - Test OpenAI connectivity
- `/api/stats` - Catalog statistics
- `/api/simple-chat` - Simple mode endpoint

#### Features
- Memory usage tracking
- Playlist catalog visualization
- Real-time connection monitoring
- Error logging and self-checks

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Environment Setup
Create `.env` file:
```env
OPENAI_API_KEY=your-openai-api-key-here
YOUTUBE_API_KEY=your-youtube-api-key-here
YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
SIMPLE_MODEL=gpt-4
PORT=3000
HEARTBEAT_LOG=true
```

### Run Server
```bash
npm start
# or
node server.js
```

### Access Points
- **Web App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **Health Check**: http://localhost:3000/health

## 💬 Usage Examples

### Standard Conversation
```
User: Hey, I'm feeling happy today
Bot: Great mood! Would you like some upbeat Tamil songs?

User: Yes, play something from Anirudh
Bot: Starting Anirudh playlist! [plays Why This Kolaveri Di]
```

### Simple Mode
```
User: simple: play rahman songs
Bot: Starting A.R. Rahman classics! [plays Chinna Chinna Aasai]
```

### Artist Queries
```
User: Tell me about Ilaiyaraaja
Bot: 🎵 Ilaiyaraaja (Isaignani) is a music director born in 1943...
     🎬 Famous Movies: Thalapathi, Thevar Magan, Moondram Pirai
     🎵 Hit Songs: Rakkamma Kaiya Thattu, Kanne Kalaimane...
```

### Mood Requests
```
User: I want romantic tamil songs
Bot: Perfect match! Creating romantic Tamil playlist...
     [plays Nenjukkul Peidhidum, Vennilave Vennilave, etc.]
```

## 🔧 Configuration

### Model Settings
- `SIMPLE_MODEL`: Preferred OpenAI model (gpt-4, gpt-3.5-turbo)
- Automatic fallback to secondary model if primary fails
- Local fallback if all API attempts fail

### Cooldown Behavior
- Triggers on 429 quota errors
- Default: 15 minutes (900,000ms)
- Prevents excessive failed API calls
- Resume automatically after cooldown expires

### Offline Banner
Automatically displays when:
- API key missing or placeholder
- Quota exceeded (429 error)
- During cooldown period
- Any API error occurs

## 📊 API Routes

### Music Endpoints
- `GET /api/songs` - All songs
- `GET /api/songs/mood/:mood` - Songs by mood
- `GET /api/songs/language/:language` - Songs by language
- `GET /api/playlist/:mood/:language` - Curated playlist
- `GET /api/playlists` - All available playlists
- `POST /search-youtube` - Search YouTube for song

### Spotify Endpoints (requires auth)
- `GET /api/spotify/playlist/:id` - Get playlist tracks
- `GET /api/spotify/shuffle` - Get shuffled recommendations
- `POST /api/spotify/broadcast-shuffle` - Broadcast to all clients

### Diagnostic Endpoints
- `GET /health` - Basic health check
- `GET /diagnostics` - Server statistics
- `GET /diagnostics/full` - Complete diagnostics
- `GET /api/stats` - Catalog statistics
- `GET /api/debug-openai` - Test OpenAI connectivity

## 🎨 Frontend Features

### Spotify-Style UI
- Dark theme with gradient backgrounds
- Real-time playlist rendering
- Play/Shuffle controls
- Track duration and artist info
- Thumbnail previews

### Offline Indicator
- Fixed banner at top when offline
- Color-coded by reason (orange)
- Auto-removes when connection restored
- Clear explanation of fallback mode

### Music Player
- YouTube embed with auto-play
- Playlist queue management
- Track navigation
- Current song display

## 🔐 Security

### Environment Protection
- `.env` file in `.gitignore`
- No API keys in source code
- Secure token handling for Spotify
- Bearer authentication for protected routes

## 📈 Performance

### Response Times
- Local fallback: ~50-100ms
- OpenAI API: ~1-3 seconds
- YouTube search: ~500-1500ms
- Spotify API: ~300-800ms

### Memory Management
- Conversation history limited to 20 messages
- Automatic cleanup on disconnect
- Heartbeat logging for monitoring

## 🐛 Troubleshooting

### Server Won't Start
1. Check port 3000 isn't in use: `netstat -ano | findstr :3000`
2. Kill existing node processes: `taskkill /f /im node.exe`
3. Verify dependencies: `npm install`

### OpenAI Quota Error
1. Check billing: https://platform.openai.com/account/billing
2. Verify API key in `.env`
3. Wait for cooldown (15 min) or use simple mode
4. Local fallback works without API key

### YouTube Not Playing
1. Verify YOUTUBE_API_KEY in `.env`
2. Check video embeddability restrictions
3. Fallback to hardcoded videos activates automatically

### Offline Banner Stuck
- Refresh page
- Check `/api/debug-openai` endpoint
- Verify `.env` configuration
- May require billing resolution

## 🤝 Contributing

### Adding Songs
Edit `src/songCatalog.js` with format:
```javascript
{
  id: 'unique-id',
  title: 'Song Name',
  artist: 'Artist Name',
  language: 'tamil',
  mood: 'romantic',
  movie: 'Movie Name'
}
```

### Adding Playlists
Update `server.js` curated playlists section with mood-language combinations.

## 📝 License
MIT License - See LICENSE file

## 👨‍💻 Author
Kautham

## 🎯 Version
1.0.0 - Full intelligent assistant with music features

---
**Note**: Requires OpenAI API key for full AI features. Works in enhanced fallback mode without key.
