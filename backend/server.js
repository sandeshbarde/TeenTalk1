const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS Configuration
const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for academic local preview
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter
app.use(generalLimiter);

// Request Logger (Development / Audit)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const safeUrl = req.originalUrl.replace(/TT-CASE-\d{4}-[A-F0-9]{32}/gi, '[tracking-token]');
    console.log(`[HTTP] ${req.method} ${safeUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Mount Main API Routes under /api
app.use('/api', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Serve static frontend if built
const fs = require('fs');
const possibleFrontendPaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, 'frontend/dist'),
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), 'dist'),
];
const frontendDist = possibleFrontendPaths.find((p) => fs.existsSync(p));
if (frontendDist) {
  console.log(`📦 Serving static frontend from: ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// 404 Route Catch-All
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'ROUTE_NOT_FOUND',
    },
  });
});

// Export app for testing and standalone server execution
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(`========================================================`);
    console.log(`🚀 TeenTalk Backend API Server running on port ${PORT}`);
    console.log(`🛡️  Environment: ${env.NODE_ENV}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`========================================================`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  });
}

module.exports = app;
