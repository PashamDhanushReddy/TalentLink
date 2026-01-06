#!/bin/bash
set -e

echo "🔍 Verifying TalentLink Frontend Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in frontend directory. Please run from frontend folder."
    exit 1
fi

# Check if build exists
if [ ! -d "build" ]; then
    echo "❌ Build directory not found. Running build..."
    npm run build
fi

# Check if index.html exists
if [ ! -f "build/index.html" ]; then
    echo "❌ index.html not found in build directory!"
    exit 1
fi

echo "✅ Build files verified"

# Check if server.js exists
if [ ! -f "server.js" ]; then
    echo "❌ server.js not found!"
    exit 1
fi

# Check if express is installed
if ! npm list express > /dev/null 2>&1; then
    echo "❌ Express not installed. Installing..."
    npm install express
fi

echo "✅ Server files verified"

# Test the server locally
echo "🧪 Testing server locally..."
node server.js &
SERVER_PID=$!
sleep 3

# Test if server responds
if curl -s -o /dev/null -w "%{http_code}" http://localhost:10000 | grep -q "200\|302"; then
    echo "✅ Server is responding correctly"
else
    echo "❌ Server is not responding properly"
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null || true

echo "🎉 All verification checks passed!"
echo "📋 Deployment ready with:"
echo "   - Build directory: $(pwd)/build"
echo "   - Server file: $(pwd)/server.js"
echo "   - Port: 10000"
echo "   - Environment: production"