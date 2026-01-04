# 🎵 Mood Music Chatbot with Streaming

A smart chatbot that recommends songs based on your mood and language preferences, learns from user feedback, and can play music from multiple sources!

## 🚀 Features

### Music Recommendation
- **Mood-based suggestions** - Get songs for happy, sad, energetic, romantic, and relaxed moods
- **Language support** - English, Hindi, Spanish, French, and more
- **Learning system** - Improves recommendations based on user ratings and feedback
- **Natural language processing** - Just say "I feel happy" or "sad Hindi songs"

### Music Streaming & Playback
- **🎥 YouTube Integration** - Search and play YouTube videos directly in the app
- **🎵 Local Music Player** - Upload and play your own MP3/WAV/OGG files
- **📱 Embedded Players** - YouTube videos and audio files play within the chat interface
- **🎧 Now Playing Display** - See what's currently playing with artist info

### Smart Chat Interface
- **Quick Action Buttons** - One-click access to common requests
- **File Upload** - Drag and drop your music files with mood/language tagging
- **Real-time Chat** - Instant responses via WebSocket connection
- **Multi-format Support** - Handles various audio formats (MP3, WAV, OGG, M4A)

## 🛠️ Installation & Setup

1. **Clone/Download** the project files
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the server:**
   ```bash
   npm start
   ```
4. **Open your browser** and go to: http://localhost:3000

## 🎯 How to Use

### Basic Mood Requests
```
"I feel happy"
"Sad songs please"
"I need energetic music"
"Romantic Hindi songs"
"Relaxed English music"
```

### YouTube Search
```
"search youtube trending music"
"youtube search bollywood hits"
"find youtube pop songs"
```

### Local Music
```
"show my local music"
"play my music"
```

### Upload Your Music
1. Click the file input in the music player panel
2. Select your audio file (MP3, WAV, OGG, M4A)
3. Add title, mood, and language tags
4. The file is uploaded and becomes available for recommendations

## 🎵 Music Sources

1. **Curated Database** - 50+ pre-loaded songs across moods and languages
2. **YouTube** - Live search and streaming from YouTube's catalog
3. **Local Files** - Your personal music collection uploaded to the app
4. **User Feedback** - Songs get better rankings based on user ratings

## 🔧 Technical Details

### Backend (Node.js)
- **Express.js** server with Socket.IO for real-time communication
- **Multer** for file upload handling
- **YouTube Search API** integration
- **JSON-based** data storage for songs and feedback
- **Learning algorithm** that adjusts song popularity based on user ratings

### Frontend
- **Responsive design** with grid layout
- **WebSocket** client for real-time chat
- **HTML5 audio player** for local files
- **YouTube embed** for video playback
- **File upload** with drag-and-drop support

### File Structure
```
📁 Chatbot/
├── 📄 server.js          # Main server file
├── 📄 package.json       # Dependencies
├── 📄 seed_songs.json    # Initial song database
├── 📁 public/            # Frontend files
│   ├── 📄 index.html     # Main UI
│   └── 📄 client.js      # Client-side logic
├── 📁 data/              # Runtime data
│   ├── 📄 songs.json     # Song database
│   └── 📄 feedback.json  # User feedback
└── 📁 music/             # Uploaded music files
```

## 🎮 API Endpoints

- `POST /api/recommend` - Get song recommendations
- `POST /api/feedback` - Submit song ratings
- `POST /api/upload` - Upload music files
- `GET /api/youtube/search` - Search YouTube
- `GET /api/local-music` - Get uploaded files
- `GET /music/:filename` - Stream local audio files

## 🌟 Advanced Features

### Learning System
The bot learns from every interaction:
- **Star ratings** (1-5) improve song rankings
- **Play frequency** affects recommendations
- **Mood associations** get stronger with feedback
- **Language preferences** are remembered

### Multi-platform Streaming
- **YouTube** - Instant access to millions of songs
- **Local storage** - Your personal collection always available
- **Hybrid recommendations** - Combines all sources for best results

## 🚀 Next Steps & Enhancements

**Ready to extend:** 
- Add Spotify/Apple Music integration
- Implement user accounts and playlists
- Add collaborative filtering
- Include lyrics display
- Support for podcasts and audiobooks

**Current limitations:**
- YouTube playback requires internet connection
- Local files are stored on server (not cloud)
- No user authentication (single-user mode)

## 🎵 Enjoy Your Music!

Your enhanced chatbot is now running with full streaming capabilities! Upload your favorite songs, search YouTube, and let the AI learn your musical preferences. 🎶