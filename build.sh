#!/usr/bin/env bash
# exit on error
set -o errexit

echo "--------------------------------------"
echo "Build script started"
echo "--------------------------------------"

# Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

# Verify build
if [ ! -d "frontend/build" ]; then
  echo "Error: frontend/build directory not found!"
  exit 1
fi

# Prepare Backend Directories
echo "Preparing Backend Directories..."
mkdir -p talentlink/templates
mkdir -p talentlink/static_src

# Copy Index
echo "Copying index.html..."
cp frontend/build/index.html talentlink/templates/

# Copy Static Assets
echo "Copying static assets..."
# Copy contents of build/static (js, css) to static_src
if [ -d "frontend/build/static" ]; then
    cp -r frontend/build/static/* talentlink/static_src/
fi

# Copy Root Files (favicon, etc) to static_src
echo "Copying root files..."
cp frontend/build/favicon.ico talentlink/static_src/ 2>/dev/null || :
cp frontend/build/manifest.json talentlink/static_src/ 2>/dev/null || :
cp frontend/build/robots.txt talentlink/static_src/ 2>/dev/null || :
cp frontend/build/logo*.png talentlink/static_src/ 2>/dev/null || :

# Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd talentlink
pip install -r requirements.txt

# Debug: Show directories
echo "Debug: Listing templates dir:"
ls -l templates/ || echo "templates dir empty or missing"
echo "Debug: Listing static_src dir:"
ls -l static_src/ || echo "static_src dir empty or missing"

# Collect Static Files
echo "Collecting Static Files..."
python manage.py collectstatic --no-input

# Run Migrations
echo "Running Migrations..."
python manage.py migrate

echo "--------------------------------------"
echo "Build script completed successfully"
echo "--------------------------------------"
