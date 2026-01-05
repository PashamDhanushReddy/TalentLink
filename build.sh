#!/usr/bin/env bash
set -o errexit

echo "=== MAIN BUILD SCRIPT STARTED ==="
echo "Current directory: $(pwd)"
echo "Running build from repo root"

# Change to talentlink directory and run the build script from there
echo "Changing to talentlink directory..."
cd talentlink || { echo "ERROR: talentlink directory not found"; exit 1; }

# Run the build script that's inside talentlink directory
echo "Running talentlink/build.sh..."
bash build.sh