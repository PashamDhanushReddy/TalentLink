#!/bin/bash
# Deployment script for TalentLink single Render project

echo "🚀 Starting deployment process..."
echo "📋 Checking git status..."

# Check if there are changes to commit
if [[ -n $(git status -s) ]]; then
    echo "📦 Found changes to commit..."
    git add .
    echo "💬 Enter commit message (or press Enter for default):"
    read commit_message
    if [[ -z "$commit_message" ]]; then
        commit_message="Deploy TalentLink to production"
    fi
    git commit -m "$commit_message"
else
    echo "✅ No changes to commit, proceeding with deployment..."
fi

echo "🔄 Pushing to main branch..."
git push origin main

echo "⏳ Deployment started! Check Render dashboard for progress:"
echo "   Backend: https://dashboard.render.com/web/YOUR_BACKEND_SERVICE_ID"
echo "   Frontend: https://dashboard.render.com/static/YOUR_FRONTEND_SERVICE_ID"
echo ""
echo "🌐 Your app will be available at:"
echo "   Frontend: https://talentlink-frontend.onrender.com"
echo "   Backend API: https://talentlink-backend.onrender.com"
echo ""
echo "📊 Monitor deployment logs in Render dashboard"
echo "✅ Deployment complete when both services show 'Live' status"