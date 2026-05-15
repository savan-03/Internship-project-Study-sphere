// src/routes/oauth.routes.js

const express = require('express');
const passport = require('passport');
const {
  handleOAuthCallback,
  connectOAuthAccount,
  disconnectOAuthAccount,
  getConnectedOAuthAccounts,
  getOAuthAccountDetails,
} = require('../controllers/oauth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const auditService = require('../services/audit.service');

const router = express.Router();

// Google OAuth
router.get('/google', (req, res, next) => {
  // Store original URL for redirect
  if (req.query.redirect) {
    req.session = req.session || {};
    req.session.redirectUrl = req.query.redirect;
  }

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
  })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, profile, info) => {
    try {
      if (err || !profile) {
        const message = err?.message || info?.message || 'OAuth authentication failed';
        console.error('[OAuth Google Callback] Error:', message);

        // Log failed OAuth attempt
        await auditService.createAuditLog({
          action: 'LOGIN_FAILED',
          status: 'FAILED',
          ipAddress: auditService.getIPAddress(req),
          userAgent: req.headers['user-agent'],
          provider: 'google',
          reason: message,
          severity: 'MEDIUM',
        });

        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=oauth_failed&provider=google&message=${encodeURIComponent(message)}`
        );
      }

      // Attach profile to request
      req.provider = 'google';
      req.profile = profile;

      // Call handler
      return handleOAuthCallback(req, res);
    } catch (error) {
      console.error('[OAuth Google Callback] Exception:', error);
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_error&provider=google`
      );
    }
  })(req, res, next);
});

// GitHub OAuth
router.get('/github', (req, res, next) => {
  if (req.query.redirect) {
    req.session = req.session || {};
    req.session.redirectUrl = req.query.redirect;
  }

  passport.authenticate('github', {
    scope: ['user:email'],
  })(req, res, next);
});

router.get('/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, profile, info) => {
    try {
      if (err || !profile) {
        const message = err?.message || info?.message || 'OAuth authentication failed';
        console.error('[OAuth GitHub Callback] Error:', message);

        // Log failed OAuth attempt
        await auditService.createAuditLog({
          action: 'LOGIN_FAILED',
          status: 'FAILED',
          ipAddress: auditService.getIPAddress(req),
          userAgent: req.headers['user-agent'],
          provider: 'github',
          reason: message,
          severity: 'MEDIUM',
        });

        return res.redirect(
          `${process.env.CLIENT_URL}/login?error=oauth_failed&provider=github&message=${encodeURIComponent(message)}`
        );
      }

      // Attach profile to request
      req.provider = 'github';
      req.profile = profile;

      // Call handler
      return handleOAuthCallback(req, res);
    } catch (error) {
      console.error('[OAuth GitHub Callback] Exception:', error);
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_error&provider=github`
      );
    }
  })(req, res, next);
});

// Connect OAuth account to existing user
router.post('/connect/google', authenticate, (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, profile) => {
    try {
      if (err || !profile) {
        return res.status(401).json({
          error: {
            message: 'OAuth authentication failed',
            code: 'OAUTH_FAILED',
            statusCode: 401,
          },
        });
      }

      req.provider = 'google';
      req.profile = profile;

      return connectOAuthAccount(req, res);
    } catch (error) {
      return res.status(500).json({
        error: {
          message: 'OAuth connection failed',
          code: 'OAUTH_ERROR',
          statusCode: 500,
        },
      });
    }
  })(req, res, next);
});

router.post('/connect/github', authenticate, (req, res, next) => {
  passport.authenticate('github', { session: false }, async (err, profile) => {
    try {
      if (err || !profile) {
        return res.status(401).json({
          error: {
            message: 'OAuth authentication failed',
            code: 'OAUTH_FAILED',
            statusCode: 401,
          },
        });
      }

      req.provider = 'github';
      req.profile = profile;

      return connectOAuthAccount(req, res);
    } catch (error) {
      return res.status(500).json({
        error: {
          message: 'OAuth connection failed',
          code: 'OAUTH_ERROR',
          statusCode: 500,
        },
      });
    }
  })(req, res, next);
});

// Disconnect OAuth account
router.delete('/disconnect/:provider', authenticate, disconnectOAuthAccount);

// Get connected OAuth accounts
router.get('/accounts', authenticate, getConnectedOAuthAccounts);

// Get specific OAuth account details
router.get('/accounts/:provider', authenticate, getOAuthAccountDetails);

module.exports = router;
