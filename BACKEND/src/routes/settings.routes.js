// src/routes/settings.routes.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const { createAuthRateLimiter } = require('../middlewares/auth-rate-limit.middleware');
const settingsController = require('../controllers/settings.controller');
const sensitiveActionRateLimit = createAuthRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxAttempts: 6,
});

// ─── Notification Settings ──────────────────────────────────────────────────

// Get my settings
router.get('/', authenticate, settingsController.getMySettings);

// Update notification preferences
router.patch('/notifications', authenticate, settingsController.updateNotificationPreferences);

// Toggle notification type
router.post('/notifications/toggle', authenticate, settingsController.toggleNotifications);

// Update notification categories
router.patch('/notifications/categories', authenticate, settingsController.updateNotificationCategories);

// ─── Privacy & Security Settings ────────────────────────────────────────────

// Update privacy settings
router.patch('/privacy', authenticate, settingsController.updatePrivacySettings);

// Change password
router.post('/password/change', authenticate, sensitiveActionRateLimit, settingsController.changePassword);

// ─── Account Management ─────────────────────────────────────────────────────

// Get account activity
router.get('/activity', authenticate, settingsController.getAccountActivity);
router.get('/sessions', authenticate, settingsController.listActiveSessions);
router.delete('/sessions/:sessionId', authenticate, settingsController.revokeSession);
router.post('/sessions/revoke-others', authenticate, settingsController.revokeOtherSessions);

// Deactivate account
router.post('/account/deactivate', authenticate, sensitiveActionRateLimit, settingsController.deactivateAccount);

// Delete account permanently
router.delete('/account/delete', authenticate, sensitiveActionRateLimit, settingsController.deleteAccount);

module.exports = router;
