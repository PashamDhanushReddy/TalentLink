#!/usr/bin/env bash
# exit on error
set -o errexit

# Build Frontend
echo "Building Frontend..."
cd frontend
npm install
npm run build
# Move root files to static so they are collected
mkdir -p build/static
cp build/favicon.ico build/static/ 2>/dev/null || :
cp build/manifest.json build/static/ 2>/dev/null || :
cp build/robots.txt build/static/ 2>/dev/null || :
cp build/logo*.png build/static/ 2>/dev/null || :
cd ..

# Install Backend Dependencies
echo "Installing Backend Dependencies..."
cd talentlink
pip install -r requirements.txt

# Collect Static Files
echo "Collecting Static Files..."
python manage.py collectstatic --no-input

# Run Migrations
echo "Running Migrations..."
python manage.py migrate
