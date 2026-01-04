# 🎵 Spotify Integration Setup Guide

## Step 1: Create Spotify Developer Account

1. Go to: https://developer.spotify.com/dashboard
2. Log in with your Spotify account (or create one)
3. Click "Create an App"
4. Fill in the details:
   - **App Name**: MoodTunes Chatbot
   - **App Description**: Music chatbot with mood-based playlists
   - **Redirect URI**: `http://localhost:3000/api/spotify/callback`
5. Accept the terms and click "Create"

## Step 2: Get Your Credentials

After creating the app, you'll see:
- **Client ID**: Copy this
- **Client Secret**: Click "Show Client Secret" and copy it

## Step 3: Update .env File

Open your `.env` file and add:

```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
```

Replace `your_client_id_here` and `your_client_secret_here` with the values from Step 2.

## Step 4: Install Required Package

Run this command in your terminal:

```bash
npm install querystring
```

## Step 5: Restart Your Server

```bash
npm start
```

## Step 6: Connect to Spotify

1. Open your chatbot: `http://localhost:3000`
2. You'll see a "Connect to Spotify" button
3. Click it to authorize the app
4. Grant permissions when asked
5. You'll be redirected back and ready to play!

## How to Use:

Once connected, type these commands:

- **"play [song name]"** - Search and play any song
- **"play [song] by [artist]"** - More specific search
- **"create mood playlist happy"** - Get Spotify recommendations by mood
- **"next song"** - Skip to next track
- **"pause"** - Pause playback
- **"resume"** - Resume playback

## Important Notes:

⚠️ **Spotify Premium Required**: You need a Spotify Premium account to use the Web Playback SDK

✅ **No Local Files Needed**: Songs stream directly from Spotify's library

🌍 **Millions of Songs**: Access Spotify's entire catalog

🎵 **High Quality**: Stream at premium quality

## Troubleshooting:

### "Authentication Error"
- Check that your Client ID and Client Secret are correct
- Make sure the Redirect URI matches exactly

### "Account Error"  
- You need Spotify Premium subscription

### "Player Not Ready"
- Wait a few seconds for the player to initialize
- Try refreshing the page

## Alternative: Use Spotify Free Features

If you don't have Premium, you can still use:
- Search functionality
- Browse recommendations
- View track information

But playback will open in the Spotify app instead of playing in the chatbot.

---

Need help? Check the Spotify Web API documentation: https://developer.spotify.com/documentation/web-api
