#!/bin/bash
set -e

echo "🚀 Starting TalentLink Frontend Deployment..."

# Navigate to frontend directory
cd frontend

echo "📦 Installing dependencies..."
npm install

echo "🏗️  Building React app..."
npm run build

echo "🔍 Verifying build..."
if [ ! -d "build" ]; then
    echo "❌ Build directory not found!"
    exit 1
fi

if [ ! -f "build/index.html" ]; then
    echo "❌ index.html not found in build!"
    exit 1
fi

echo "✅ Build verified successfully"

echo "📝 Creating deployment info..."
cat > build/deployment-info.txt << EOF
TalentLink Frontend Deployment
Build Time: $(date)
Git Commit: ${RENDER_GIT_COMMIT:-unknown}
Node Version: $(node --version)
NPM Version: $(npm --version)
EOF

echo "🎉 Deployment preparation complete!"
echo "📁 Build directory: $(pwd)/build"
echo "🔧 Ready to start server..."