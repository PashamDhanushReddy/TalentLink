#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--------------------------------------"
echo "Build script started"
echo "--------------------------------------"

# Install backend dependencies
echo "Installing backend dependencies..."
pip install -r requirements.txt

# Build frontend (relative to this script running from repo root)
echo "Building frontend..."
cd frontend
npm ci || npm install
npm run build
cd ..

# Verify build
if [ ! -d "frontend/build" ]; then
  echo "Error: frontend/build directory not found!"
  exit 1
fi

# Prepare backend directories for React artifacts
echo "Preparing backend directories..."
mkdir -p talentlink/templates
mkdir -p talentlink/static_src

# Copy React build output to Django
echo "Copying index.html..."
cp frontend/build/index.html talentlink/templates/ 2>/dev/null || :

if [ -d "frontend/build/static" ]; then
  echo "Copying static files..."
  cp -r frontend/build/static/* talentlink/static_src/
fi

# Copy root files
echo "Copying root files..."
cp frontend/build/favicon.ico talentlink/static_src/ 2>/dev/null || :
cp frontend/build/manifest.json talentlink/static_src/ 2>/dev/null || :
cp frontend/build/robots.txt talentlink/static_src/ 2>/dev/null || :
cp frontend/build/logo*.png talentlink/static_src/ 2>/dev/null || :

# Debug: Show directories
echo "Debug: Listing talentlink/templates dir:"
ls -l talentlink/templates/ || echo "templates dir empty or missing"
echo "Debug: Listing talentlink/static_src dir:"
ls -l talentlink/static_src/ || echo "static_src dir empty or missing"

# Run Django management commands
echo "Running Django commands..."
cd talentlink
python manage.py collectstatic --no-input
python manage.py migrate

echo "--------------------------------------"
echo "Build script completed successfully"
echo "--------------------------------------"
