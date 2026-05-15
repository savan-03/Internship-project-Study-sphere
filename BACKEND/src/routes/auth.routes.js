// src/routes/auth.routes.js

const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  getProfileSummary,
  getPublicProfileSummary,
} = require('../controllers/auth.controller');
const { authenticate, optionalAuthenticate, refreshTokenMiddleware } = require('../middlewares/auth.middleware');
const { createAuthRateLimiter } = require('../middlewares/auth-rate-limit.middleware');

const router = express.Router();
const registerRateLimit = createAuthRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 5,
  keySelector: (req) => req.body?.email || req.body?.username || '',
});
const loginRateLimit = createAuthRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 8,
  keySelector: (req) => req.body?.email || '',
});
const refreshRateLimit = createAuthRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxAttempts: 20,
});

// Public routes
router.post('/register', registerRateLimit, register);
router.post('/login', loginRateLimit, login);
router.post('/refresh', refreshRateLimit, refreshTokenMiddleware, refreshToken);

// Protected routes
router.post('/logout', optionalAuthenticate, logout);
router.get('/me', authenticate, getMe);
router.get('/profile/summary', authenticate, getProfileSummary);
router.get('/profile/:userId', authenticate, getPublicProfileSummary);
router.patch('/profile', authenticate, updateProfile);

module.exports = router;
