const express = require('express');
const path = require('path');
const app = express();

// Security and performance headers
app.use((req, res, next) => {
  res.header('X-Frame-Options', 'DENY');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve static files from the React build folder with proper caching
app.use(express.static(path.join(__dirname, 'build'), {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Handle React routing - this is the key fix
// Serve index.html for all routes except static assets
app.get('*', (req, res) => {
  console.log(`Handling SPA route: ${req.url}`);
  res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error sending index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, 'build')}`);
});