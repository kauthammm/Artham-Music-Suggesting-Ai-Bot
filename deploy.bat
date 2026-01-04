@echo off
echo 🚀 Deploying Tamil Music Chatbot to Netlify...
echo.

echo 📁 Checking project structure...
if not exist "public\index.html" (
    echo ❌ Error: public/index.html not found
    pause
    exit /b 1
)

if not exist "netlify\functions\chat.js" (
    echo ❌ Error: Netlify functions not found
    pause
    exit /b 1
)

echo ✅ Project structure verified

echo.
echo 🔧 Building project...
npm run build

echo.
echo 🌐 Deploying to Netlify...
npx netlify deploy --prod --dir=public --functions=netlify/functions

echo.
echo ✅ Deployment complete!
echo 🎵 Your Tamil Music Chatbot is now live!
echo.
echo 📝 Next steps:
echo 1. Check the deployment URL provided above
echo 2. Test your chatbot with: "I want energetic Tamil music"
echo 3. Add your YouTube API key in Netlify dashboard for enhanced features
echo.
pause