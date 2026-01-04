@echo off
echo.
echo ====================================
echo   GEMINI AI SETUP FOR ARTHAM BOT
echo ====================================
echo.
echo STEP 1: Get FREE Gemini API Key
echo --------------------------------
echo.
echo 1. Open your browser and go to:
echo    https://makersuite.google.com/app/apikey
echo.
echo 2. Sign in with your Google account
echo.
echo 3. Click "Create API Key" button
echo.
echo 4. Copy the key (starts with AIza...)
echo.
pause
echo.
echo STEP 2: Enter Your API Key
echo --------------------------
echo.
set /p API_KEY="Paste your Gemini API key here: "
echo.
echo Saving to .env file...
echo.

(
echo # ===== REQUIRED FOR AI CHATBOT =====
echo # Get FREE Gemini API key from: https://makersuite.google.com/app/apikey
echo # No credit card required! Just click "Create API Key"
echo GEMINI_API_KEY=%API_KEY%
echo.
echo # YouTube API Configuration - Using your deployed API
echo YOUTUBE_API_KEY=AIzaSyDKQF2RyT8VyHjE5iNXcQhAzFnUr9K3OlM
echo YOUTUBE_API_BASE_URL=https://www.googleapis.com/youtube/v3
echo.
echo # Port configuration
echo PORT=3000
echo.
echo # Spotify API Configuration
echo SPOTIFY_CLIENT_ID=your_spotify_client_id_here
echo SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
echo SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
) > .env

echo.
echo ✓ API key saved to .env file!
echo.
echo STEP 3: Starting Your Bot
echo -------------------------
echo.
echo Starting server...
echo.
start cmd /k "npm start"
echo.
echo ✓ Server starting in new window!
echo.
echo Open your browser and go to:
echo    http://localhost:3000
echo.
echo Try chatting:
echo   - "Hello, how are you?"
echo   - "Tell me a joke"
echo   - "Play romantic tamil songs"
echo.
echo ====================================
echo   Setup Complete! Enjoy your bot!
echo ====================================
echo.
pause
