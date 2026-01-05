#!/usr/bin/env bash
set -o errexit

echo "=== TALENTLINK BUILD SCRIPT (FROM TALENTLINK DIR) STARTED ==="
echo "Current directory: $(pwd)"
echo "Parent directory contents: $(ls -la ../)"

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Build frontend (go up one level first, then into frontend)
echo "Building frontend..."
cd ../frontend || { echo "ERROR: ../frontend directory not found"; exit 1; }
echo "In frontend directory: $(pwd)"
npm ci || npm install
npm run build
cd ..

# Verify build
if [ ! -d "frontend/build" ]; then
  echo "ERROR: frontend/build directory not found!"
  echo "Contents of frontend: $(ls -la frontend/)"
  exit 1
fi

echo "Frontend build successful!"
echo "Contents of frontend/build: $(ls -la frontend/build/)"

# Prepare backend directories (back in talentlink)
echo "Preparing backend directories..."
mkdir -p templates
mkdir -p static_src

# Copy React build to Django
echo "Copying React build to Django..."
echo "Copying index.html..."
cp ../frontend/build/index.html templates/ || echo "Warning: Could not copy index.html"

if [ -d "../frontend/build/static" ]; then
  echo "Copying static files..."
  cp -r ../frontend/build/static/* static_src/ || echo "Warning: Could not copy static files"
fi

# Copy root files
echo "Copying root files..."
cp ../frontend/build/favicon.ico static_src/ 2>/dev/null || echo "Warning: No favicon.ico found"
cp ../frontend/build/manifest.json static_src/ 2>/dev/null || echo "Warning: No manifest.json found"
cp ../frontend/build/robots.txt static_src/ 2>/dev/null || echo "Warning: No robots.txt found"

# Debug: Show what we copied
echo "=== DEBUG: Final directory contents ==="
echo "templates: $(ls -la templates/ || echo 'empty')"
echo "static_src: $(ls -la static_src/ || echo 'empty')"

# Django commands
echo "Running Django management commands..."
echo "Current directory for Django commands: $(pwd)"

python manage.py collectstatic --no-input
echo "Collectstatic completed"

python manage.py migrate
echo "Migrations completed"

echo "=== TALENTLINK BUILD SCRIPT COMPLETED SUCCESSFULLY ==="