const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');

const adminRoutes = require('./routes/admin.routes');
const aiRoutes = require('./routes/ai.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const authRoutes = require('./routes/auth.routes');
const dsaRoutes = require('./routes/dsa.routes');
const gamificationRoutes = require('./routes/gamification.routes');
const notificationRoutes = require('./routes/notification.routes');
const socialRoutes = require('./routes/social.routes');
const oauthRoutes = require('./routes/oauth.routes');
const auditRoutes = require('./routes/audit.routes');
const profileRoutes = require('./routes/profile.routes');
const settingsRoutes = require('./routes/settings.routes');

const { requestLogger } = require('./middlewares/auth.middleware');
const { checkSessionLimit, validateSession } = require('./middlewares/sessionLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const redisUtil = require('./utils/redis.util');

const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.set('trust proxy', 1);

// CORS middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    exposedHeaders: ['x-access-token', 'x-auth-restored', 'content-disposition'],
  })
);

// Parsing middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Passport middleware
app.use(passport.initialize());

// Request logging middleware
app.use(requestLogger);

// Session check middleware (for all authenticated routes)
app.use(checkSessionLimit);
app.use(validateSession);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/social', socialRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  const mongoState = mongoose.connection.readyState;
  const mongoStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'up',
      mongodb: mongoStates[mongoState] || 'unknown',
      redis: redisUtil.isRedisEnabled()
        ? (redisUtil.isRedisConnected() ? 'connected' : 'degraded')
        : 'disabled',
    },
  });
});

app.get('/api/ready', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  const redisReady = !redisUtil.isRedisEnabled() || redisUtil.isRedisConnected();
  const isReady = dbReady && redisReady;

  return res.status(isReady ? 200 : 503).json({
    ready: isReady,
    database: dbReady,
    redis: redisReady,
  });
});

// 404 handler (before error handler)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
