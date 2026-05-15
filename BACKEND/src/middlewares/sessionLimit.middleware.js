// src/middlewares/sessionLimit.middleware.js

const sessionUtil = require('../utils/session.util');
const auditService = require('../services/audit.service');
const { AuthenticationError } = require('../utils/errors.util');

const SESSION_INACTIVITY_TIMEOUT_MS =
  Math.max(1, Number(process.env.SESSION_INACTIVITY_TIMEOUT_MINUTES || 60)) * 60 * 1000;

/**
 * Check session limits and enforce if necessary
 */
const checkSessionLimit = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const sessionId = req.sessionId || req.cookies?.sessionId;

    if (!sessionId) {
      return next();
    }

    // Check if session is still valid
    const isValid = await sessionUtil.isSessionValid(sessionId);
    if (!isValid) {
      throw new AuthenticationError('Session has expired or been terminated');
    }

    // Update session activity
    await sessionUtil.updateSessionActivity(sessionId);

    // Attach session info to request
    req.sessionInfo = await sessionUtil.getSession(sessionId);

    // Check for unusual activity
    const unusual = await sessionUtil.detectUnusualActivity(userId);
    if (unusual.riskLevel >= 2) {
      console.warn(`[SessionLimit] Unusual activity detected for user ${userId}, risk level: ${unusual.riskLevel}`);

      // Log suspicious activity
      await auditService.createAuditLog({
        userId,
        action: 'SESSION_LIMIT_REACHED',
        status: 'ATTEMPTED',
        ipAddress: auditService.getIPAddress(req),
        userAgent: req.headers['user-agent'],
        sessionId,
        severity: 'MEDIUM',
        details: unusual,
      });
    }

    return next();
  } catch (err) {
    console.error('[checkSessionLimit] Error:', err.message);
    return next(); // Continue even if session check fails
  }
};

/**
 * Enforce session limits on login
 */
const enforceSessionLimitOnLogin = async (req, res, next) => {
  try {
    if (!req.user) {
      return next();
    }

    const userId = req.user.id;
    const result = await sessionUtil.enforceSessionLimit(userId);

    if (result.enforced) {
      // Log enforcement
      await auditService.createAuditLog({
        userId,
        action: 'SESSION_LIMIT_REACHED',
        status: 'SUCCESS',
        ipAddress: auditService.getIPAddress(req),
        userAgent: req.headers['user-agent'],
        severity: 'LOW',
        details: {
          enforced: true,
          removedSessions: result.removedSessionIds?.length || 0,
          message: result.message,
        },
      });

      // Attach enforcement info to response (will be added to response object in controller)
      req.sessionEnforcement = result;
    }

    return next();
  } catch (err) {
    console.error('[enforceSessionLimitOnLogin] Error:', err.message);
    return next(); // Continue even if enforcement fails
  }
};

/**
 * Validate session before accessing protected routes
 */
const validateSession = async (req, res, next) => {
  try {
    if (!req.user || !req.sessionInfo) {
      return next();
    }

    const sessionId = req.sessionInfo.id;
    const userId = req.user.id;

    // Verify session belongs to user
    if (req.sessionInfo.userId !== userId) {
      throw new AuthenticationError('Session mismatch');
    }

    const inactivityTime = Date.now() - req.sessionInfo.lastActivityAt;

    if (inactivityTime > SESSION_INACTIVITY_TIMEOUT_MS) {
      await sessionUtil.terminateSession(sessionId);
      throw new AuthenticationError('Session expired due to inactivity');
    }

    return next();
  } catch (err) {
    console.error('[validateSession] Error:', err.message);
    const { statusCode, body } = require('../utils/errors.util').formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get concurrent sessions count (for rate limiting)
 */
const getConcurrentSessions = async (userId) => {
  try {
    return await sessionUtil.getConcurrentSessionCount(userId);
  } catch (err) {
    console.error('[getConcurrentSessions] Error:', err.message);
    return 0;
  }
};

module.exports = {
  checkSessionLimit,
  enforceSessionLimitOnLogin,
  validateSession,
  getConcurrentSessions,
};
