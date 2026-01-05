@echo off
echo 🚀 Starting deployment process...
echo 📋 Checking git status...
echo 🔧 Frontend routing configured for single project deployment...

# Check if there are changes to commit
git status --porcelain | findstr /r /c:"." >nul
if %errorlevel% equ 0 (
    echo 📦 Found changes to commit...
    git add .
    set /p commit_message="💬 Enter commit message (or press Enter for default): "
    if "%commit_message%"=="" (
        set commit_message=Deploy TalentLink to production
    )
    git commit -m "%commit_message%"
) else (
    echo ✅ No changes to commit, proceeding with deployment...
)

echo 🔄 Pushing to main branch...
git push origin main

echo ⏳ Deployment started! Check Render dashboard for progress:
echo    Backend: https://dashboard.render.com/web/YOUR_BACKEND_SERVICE_ID
echo    Frontend: https://dashboard.render.com/static/YOUR_FRONTEND_SERVICE_ID
echo.
echo 🌐 Your app will be available at:
echo    Frontend: https://talentlink-frontend.onrender.com
echo    Backend API: https://talentlink-backend.onrender.com
echo.
echo 📊 Monitor deployment logs in Render dashboard
echo ✅ Deployment complete when both services show 'Live' status
pause