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

# Verify build - check the correct path
if [ ! -d "frontend/build" ]; then
  echo "ERROR: frontend/build directory not found!"
  echo "Contents of current directory: $(ls -la)"
  echo "Contents of frontend: $(ls -la frontend/ 2>/dev/null || echo 'frontend directory not found')"
  exit 1
fi

echo "Frontend build successful!"
echo "Contents of frontend/build: $(ls -la frontend/build/)"

# Create the proper directory structure for Django
# Create frontend/build directory in the talentlink folder
echo "Creating frontend build directory structure..."
mkdir -p talentlink/frontend/build

# Copy the entire frontend build to the talentlink directory
echo "Copying frontend build to talentlink/frontend/build..."
cp -r frontend/build/* talentlink/frontend/build/ || echo "Warning: Could not copy frontend build"

# Prepare backend directories (we're now back in the repo root)
echo "Preparing backend directories..."
mkdir -p talentlink/templates
mkdir -p talentlink/static_src

# Copy React build to Django - use correct paths
echo "Copying React build to Django..."
echo "Copying index.html..."
cp frontend/build/index.html talentlink/templates/ || { echo "ERROR: Failed to copy index.html"; exit 1; }

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
echo "talentlink/frontend/build: $(ls -la talentlink/frontend/build/ || echo 'empty')"
echo "talentlink/templates: $(ls -la talentlink/templates/ || echo 'empty')"
echo "talentlink/static_src: $(ls -la talentlink/static_src/ || echo 'empty')"

# Change to talentlink directory for Django commands
echo "Changing to talentlink directory for Django commands..."
cd talentlink || { echo "ERROR: talentlink directory not found"; exit 1; }
echo "Now in talentlink directory: $(pwd)"
echo "Contents: $(ls -la)"

# Django commands
echo "Running Django management commands..."
python manage.py collectstatic --no-input
echo "Collectstatic completed"

python manage.py migrate
echo "Migrations completed"

echo "=== TALENTLINK BUILD SCRIPT COMPLETED SUCCESSFULLY ==="