// src/controllers/settings.controller.js

const User = require('../models/user.model');
const profileService = require('../services/profile.service');
const sessionUtil = require('../utils/session.util');
const { formatErrorResponse, ValidationError } = require('../utils/errors.util');
const { logError } = require('../utils/helpers');
const redisUtil = require('../utils/redis.util');
const { getPasswordValidationMessage, buildCookieClearOptions } = require('../utils/auth-security.util');

/**
 * Get my settings
 */
const getMySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notificationPreferences socialProfile');

    return res.status(200).json({
      success: true,
      data: {
        notificationPreferences: user.notificationPreferences,
        privacy: {
          openToMentoring: Boolean(user.socialProfile?.openToMentoring),
          openToCollaboration: user.socialProfile?.openToCollaboration !== false,
        },
      },
    });
  } catch (err) {
    logError(err, { controller: 'getMySettings' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (req, res) => {
  try {
    const updated = await profileService.updateNotificationPreferences(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: updated.notificationPreferences,
    });
  } catch (err) {
    logError(err, { controller: 'updateNotificationPreferences' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update privacy settings
 */
const updatePrivacySettings = async (req, res) => {
  try {
    const { makeProfilePublic, allowMessages, allowNotifications } = req.body;

    const user = await User.findById(req.user.id);

    if (makeProfilePublic !== undefined) {
      user.socialProfile.openToMentoring = makeProfilePublic;
    }

    if (allowMessages !== undefined) {
      user.socialProfile.openToCollaboration = allowMessages;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        makeProfilePublic: user.socialProfile.openToMentoring,
        allowMessages: user.socialProfile.openToCollaboration,
      },
    });
  } catch (err) {
    logError(err, { controller: 'updatePrivacySettings' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Enable/Disable notifications
 */
const toggleNotifications = async (req, res) => {
  try {
    const { type, enabled } = req.body;

    if (!type) {
      const error = new ValidationError('Notification type is required');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const user = await User.findById(req.user.id);

    const validTypes = ['inApp', 'email', 'push'];
    if (!validTypes.includes(type)) {
      const error = new ValidationError(`Invalid notification type. Must be one of: ${validTypes.join(', ')}`);
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    user.notificationPreferences[type] = enabled;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `${type} notifications ${enabled ? 'enabled' : 'disabled'}`,
      data: {
        type,
        enabled,
      },
    });
  } catch (err) {
    logError(err, { controller: 'toggleNotifications' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update notification categories
 */
const updateNotificationCategories = async (req, res) => {
  try {
    const { categories } = req.body;

    if (!categories) {
      const error = new ValidationError('Categories object is required');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const user = await User.findById(req.user.id);

    // Update only provided categories
    Object.keys(categories).forEach(key => {
      if (key in user.notificationPreferences.categories) {
        user.notificationPreferences.categories[key] = categories[key];
      }
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Notification categories updated successfully',
      data: user.notificationPreferences.categories,
    });
  } catch (err) {
    logError(err, { controller: 'updateNotificationCategories' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      const error = new ValidationError('All fields are required', {
        currentPassword: !currentPassword ? 'Required' : undefined,
        newPassword: !newPassword ? 'Required' : undefined,
        confirmPassword: !confirmPassword ? 'Required' : undefined,
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (newPassword !== confirmPassword) {
      const error = new ValidationError('Passwords do not match');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (newPassword.length < 8) {
      const error = new ValidationError('New password must be at least 8 characters long');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (currentPassword === newPassword) {
      const error = new ValidationError('New password must be different from your current password.');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const passwordValidationMessage = getPasswordValidationMessage(newPassword);
    if (passwordValidationMessage) {
      const error = new ValidationError(passwordValidationMessage);
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const user = await User.findById(req.user.id).select('+password');

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      const error = new ValidationError('Current password is incorrect');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    user.password = newPassword;
    await user.save();
    await redisUtil.invalidateUserCache(req.user.id);
    await sessionUtil.terminateAllSessions(req.user.id, req.cookies?.sessionId || null);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Other active sessions were signed out.',
    });
  } catch (err) {
    logError(err, { controller: 'changePassword' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Deactivate account
 */
const deactivateAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      const error = new ValidationError('Password is required');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const user = await User.findById(req.user.id).select('+password');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new ValidationError('Invalid password');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    user.isActive = false;
    await user.save();
    await redisUtil.invalidateUserCache(req.user.id);
    await sessionUtil.terminateAllSessions(req.user.id);
    res.clearCookie('accessToken', buildCookieClearOptions());
    res.clearCookie('refreshToken', buildCookieClearOptions());
    res.clearCookie('sessionId', buildCookieClearOptions());

    return res.status(200).json({
      success: true,
      message: 'Account deactivated successfully.',
    });
  } catch (err) {
    logError(err, { controller: 'deactivateAccount' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Delete account (permanent)
 */
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      const error = new ValidationError('Password is required');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const user = await User.findById(req.user.id).select('+password');

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new ValidationError('Invalid password');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    await sessionUtil.terminateAllSessions(req.user.id);
    await redisUtil.deleteSession(req.user.id);
    await redisUtil.invalidateUserCache(req.user.id);
    await User.findByIdAndDelete(req.user.id);
    res.clearCookie('accessToken', buildCookieClearOptions());
    res.clearCookie('refreshToken', buildCookieClearOptions());
    res.clearCookie('sessionId', buildCookieClearOptions());

    return res.status(200).json({
      success: true,
      message: 'Account deleted successfully. This action cannot be undone.',
    });
  } catch (err) {
    logError(err, { controller: 'deleteAccount' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get account activity (login history from audit logs)
 */
const getAccountActivity = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(Number(req.query.limit) || 50, 100));
    const skip = Math.max(0, Number(req.query.skip) || 0);

    const user = await User.findById(req.user.id).select('activityLog');

    const activities = user.activityLog
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit);

    return res.status(200).json({
      success: true,
      data: {
        activities,
        total: user.activityLog.length,
        limit,
        skip,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getAccountActivity' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

const listActiveSessions = async (req, res) => {
  try {
    const currentSessionId = req.cookies?.sessionId || null;
    if (currentSessionId) {
      await sessionUtil.updateSessionActivity(currentSessionId);
    }
    const sessions = await sessionUtil.getUserSessions(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        currentSessionId,
        sessions: sessions.map((session) => ({
          id: session.id,
          displayName: session.displayName || 'StudySphere session',
          email: session.email || '',
          location: session.location || 'Unknown',
          ipAddress: session.ipAddress || '',
          provider: session.provider || 'local',
          deviceLabel: session.deviceLabel || 'Browser session',
          deviceType: session.deviceType || 'desktop',
          persistent: Boolean(session.persistent),
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
          isCurrent: currentSessionId ? currentSessionId === session.id : false,
        })),
      },
    });
  } catch (err) {
    logError(err, { controller: 'listActiveSessions' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

const revokeSession = async (req, res) => {
  try {
    const targetSession = await sessionUtil.getSession(req.params.sessionId);
    if (!targetSession || String(targetSession.userId) !== String(req.user.id)) {
      const error = new ValidationError('Session not found');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const revoked = await sessionUtil.terminateSession(req.params.sessionId);
    if (!revoked) {
      const error = new ValidationError('Session not found');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    return res.status(200).json({
      success: true,
      data: {
        revokedSessionId: req.params.sessionId,
        revokedCurrent: req.cookies?.sessionId === req.params.sessionId,
      },
    });
  } catch (err) {
    logError(err, { controller: 'revokeSession' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

const revokeOtherSessions = async (req, res) => {
  try {
    const currentSessionId = req.cookies?.sessionId || null;
    const result = await sessionUtil.terminateAllSessions(req.user.id, currentSessionId);

    return res.status(200).json({
      success: true,
      data: {
        currentSessionId,
        terminatedCount: result.terminatedCount || 0,
      },
    });
  } catch (err) {
    logError(err, { controller: 'revokeOtherSessions' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

module.exports = {
  getMySettings,
  updateNotificationPreferences,
  updatePrivacySettings,
  toggleNotifications,
  updateNotificationCategories,
  changePassword,
  deactivateAccount,
  deleteAccount,
  getAccountActivity,
  listActiveSessions,
  revokeSession,
  revokeOtherSessions,
};
