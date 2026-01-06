#!/bin/bash
# Render.com build script for React SPA
cd frontend
npm install
npm run build
# Create _redirects file for SPA routing
echo '/* /index.html 200' > build/_redirects