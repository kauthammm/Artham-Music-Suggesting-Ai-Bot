@echo off
echo ================================
echo  Tamil Music Chatbot - Song Setup
echo ================================
echo.
echo This script will help you add MP3 files to your chatbot.
echo.
echo Current audio-samples folder:
echo %~dp0audio-samples\
echo.
echo Instructions:
echo 1. Download your favorite Tamil songs as MP3 files
echo 2. Rename them according to the list below
echo 3. Copy them to the audio-samples folder
echo 4. Restart your chatbot
echo.
echo ================================
echo  Required File Names:
echo ================================
echo aaluma_doluma.mp3          - Aaluma Doluma (Anirudh)
echo vaathi_coming.mp3          - Vaathi Coming (Anirudh)  
echo arabic_kuthu.mp3           - Arabic Kuthu (Anirudh)
echo vaseegara.mp3              - Vaseegara (A.R. Rahman)
echo hosanna.mp3                - Hosanna (A.R. Rahman)
echo uyire_uyire.mp3            - Uyire Uyire (A.R. Rahman)
echo kadhal_rojave.mp3          - Kadhal Rojave (Harris Jayaraj)
echo vennilave_vennilave.mp3    - Vennilave Vennilave (Harris Jayaraj)
echo mandram_vantha.mp3         - Mandram Vantha (Ilaiyaraaja)
echo chinna_chinna_aasai.mp3    - Chinna Chinna Aasai (Ilaiyaraaja)
echo rowdy_baby.mp3             - Rowdy Baby (Yuvan)
echo why_this_kolaveri.mp3      - Why This Kolaveri Di (Dhanush)
echo.
echo ================================
echo.

if exist "%~dp0audio-samples\" (
    echo ✓ Audio-samples folder exists
    echo.
    echo Current files in audio-samples:
    dir /b "%~dp0audio-samples\*.mp3" 2>nul
    if errorlevel 1 echo   (No MP3 files found yet)
) else (
    echo ✗ Audio-samples folder not found
    echo Creating audio-samples folder...
    mkdir "%~dp0audio-samples"
    echo ✓ Audio-samples folder created
)

echo.
echo ================================
echo  Next Steps:
echo ================================
echo 1. Add your MP3 files to: %~dp0audio-samples\
echo 2. Make sure file names match exactly (case sensitive)
echo 3. Run 'npm start' to restart your chatbot
echo 4. Test by saying "Play Aaluma Doluma" in the chat
echo.
echo Press any key to open the audio-samples folder...
pause >nul

explorer "%~dp0audio-samples"

echo.
echo Happy listening! 🎵
pause