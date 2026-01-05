#!/bin/bash
# Frontend build script for Render

echo "Building frontend..."
npm install
npm run build
echo "Frontend build complete!"