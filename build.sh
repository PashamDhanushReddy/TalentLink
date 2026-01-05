#!/usr/bin/env bash
set -o errexit

echo "=== TALENTLINK BUILD SCRIPT STARTED ==="
echo "Current directory: $(pwd)"
echo "Directory contents: $(ls -la)"

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Build frontend
echo "Building frontend..."
cd frontend || { echo "ERROR: frontend directory not found"; exit 1; }
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

# Prepare backend directories
echo "Preparing backend directories..."
mkdir -p talentlink/templates
mkdir -p talentlink/static_src

# Copy React build to Django
echo "Copying React build to Django..."
echo "Copying index.html..."
cp frontend/build/index.html talentlink/templates/ || echo "Warning: Could not copy index.html"

if [ -d "frontend/build/static" ]; then
  echo "Copying static files..."
  cp -r frontend/build/static/* talentlink/static_src/ || echo "Warning: Could not copy static files"
fi

# Copy root files
echo "Copying root files..."
cp frontend/build/favicon.ico talentlink/static_src/ 2>/dev/null || echo "Warning: No favicon.ico found"
cp frontend/build/manifest.json talentlink/static_src/ 2>/dev/null || echo "Warning: No manifest.json found"
cp frontend/build/robots.txt talentlink/static_src/ 2>/dev/null || echo "Warning: No robots.txt found"

# Debug: Show what we copied
echo "=== DEBUG: Final directory contents ==="
echo "talentlink/templates: $(ls -la talentlink/templates/ || echo 'empty')"
echo "talentlink/static_src: $(ls -la talentlink/static_src/ || echo 'empty')"

# Django commands
echo "Running Django management commands..."
cd talentlink || { echo "ERROR: talentlink directory not found"; exit 1; }
echo "In talentlink directory: $(pwd)"
echo "Contents: $(ls -la)"

python manage.py collectstatic --no-input
echo "Collectstatic completed"

python manage.py migrate
echo "Migrations completed"

echo "=== TALENTLINK BUILD SCRIPT COMPLETED SUCCESSFULLY ==="