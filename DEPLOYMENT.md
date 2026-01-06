# TalentLink Frontend Deployment Configuration

This React SPA requires special routing configuration for deployment.

## Render.com Deployment

### Method 1: Using render.yaml (Recommended)
1. Use the provided `render.yaml` file
2. Build Command: `cd frontend && npm install && npm run build`
3. Publish Directory: `frontend/build`

### Method 2: Manual Configuration
1. In Render dashboard, create a Static Site
2. Build Command: `cd frontend && npm install && npm run build`
3. Add custom redirect rule: `/* → /index.html`

### Method 3: Build Script
1. Use `build.sh` as build command
2. This ensures _redirects file is created

## Netlify Deployment
- Uses `_redirects` file in public folder
- Already configured: `/* /index.html 200`

## Vercel Deployment
- Uses `vercel.json` file
- Already configured with rewrites

## Local Testing
```bash
cd frontend
npm run build
cd build
python -m http.server 3000
```

Visit http://localhost:3000 to test