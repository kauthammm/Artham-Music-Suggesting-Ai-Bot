# 🎵 Playlist Commands Guide

Your music chatbot now supports powerful playlist features! Here are all the commands you can use:

## 🎲 Create Playlists

### Random Playlist
- `"create random playlist"` - Creates a 5-song random playlist
- `"random playlist 10"` - Creates a 10-song random playlist
- `"make me a random playlist"`

### Mood-Based Playlists
- `"create mood playlist romantic"` - Romantic songs
- `"mood playlist energetic"` - High-energy songs
- `"playlist by mood classical"` - Classical compositions
- `"create mood playlist upbeat"` - Upbeat tracks

### Artist-Based Playlists
- `"create artist playlist Anirudh"` - All Anirudh songs
- `"artist playlist A.R. Rahman"` - A.R. Rahman collection
- `"playlist by artist Harris Jayaraj"` - Harris Jayaraj tracks

### Smart Playlist (Time-Based)
- `"create smart playlist"` - Automatically selects mood based on time:
  - **Morning (6AM-12PM)**: Energetic songs
  - **Afternoon (12PM-5PM)**: Upbeat songs  
  - **Evening (5PM-9PM)**: Romantic songs
  - **Night (9PM-6AM)**: Calm songs

## 🎮 Playlist Controls

### Playback Control
- `"play playlist"` - Start playing current playlist
- `"next song"` or `"next"` - Play next song
- `"previous song"` or `"prev"` - Play previous song

### Playlist Settings
- `"shuffle playlist"` - Toggle shuffle mode
- `"repeat playlist"` - Toggle repeat mode

### View Current Status
- `"show playlist"` - View current playlist with controls
- `"current playlist"` - See what's loaded and playing

## 🎯 Available Content

### Moods Available:
- **Romantic** - Love songs and ballads
- **Energetic** - High-energy dance tracks
- **Classical** - Traditional compositions
- **Upbeat** - Feel-good songs
- **Calm** - Relaxing melodies

### Artists Available:
- **Anirudh Ravichander** - Modern Tamil hits
- **A.R. Rahman** - Legendary compositions
- **Harris Jayaraj** - Melodic masterpieces
- **Ilaiyaraaja** - Classical Tamil music

## 💡 Pro Tips

1. **Combine commands**: `"create mood playlist romantic 8"` for 8 romantic songs
2. **Quick play**: Click ▶️ on any song in playlist to jump to it
3. **Auto-advance**: Songs automatically play next when current ends
4. **Visual feedback**: Currently playing song is highlighted
5. **Smart suggestions**: System suggests corrections for typos

## 📁 Adding Your Own Songs

1. Place MP3 files in: `audio-samples/` folder
2. Use exact filenames from the database (check `HOW_TO_ADD_SONGS.md`)
3. Songs instantly become available in playlists
4. System automatically detects available vs missing files

## 🚀 Quick Start Examples

Try these commands right now:

```
"create random playlist"
"create smart playlist" 
"mood playlist romantic"
"artist playlist Anirudh"
"show playlist"
"next song"
"shuffle playlist"
```

Your music experience is now completely local, fast, and customizable! 🎉