// src/routes/audit.routes.js

const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const auditService = require('../services/audit.service');
const { formatErrorResponse, logError } = require('../utils/errors.util');

const router = express.Router();

/**
 * Get user's audit logs
 */
router.get('/logs', authenticate, async (req, res) => {
  try {
    const { limit = 50, skip = 0, action = null } = req.query;

    const logs = await auditService.getUserAuditLogs(req.user.id, {
      limit: parseInt(limit),
      skip: parseInt(skip),
      action,
    });

    return res.status(200).json({
      success: true,
      data: {
        logs,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/logs' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Get recent activity (last 24 hours)
 */
router.get('/activity/recent', authenticate, async (req, res) => {
  try {
    const { hours = 24 } = req.query;

    const activity = await auditService.getRecentActivity(req.user.id, parseInt(hours));

    return res.status(200).json({
      success: true,
      data: {
        activity,
        hoursBack: parseInt(hours),
      },
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/activity/recent' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Get audit summary for dashboard
 */
router.get('/summary', authenticate, async (req, res) => {
  try {
    const { daysBack = 30 } = req.query;

    const summary = await auditService.getAuditSummary(req.user.id, parseInt(daysBack));

    return res.status(200).json({
      success: true,
      data: {
        summary,
        daysBack: parseInt(daysBack),
      },
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/summary' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Get login sessions
 */
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const sessions = await auditService.getLoginSessions(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/sessions' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Get failed login attempts
 */
router.get('/failed-logins', authenticate, async (req, res) => {
  try {
    const { minutes = 60 } = req.query;

    const attempts = await auditService.getFailedLoginAttempts(req.user.id, parseInt(minutes));

    return res.status(200).json({
      success: true,
      data: {
        attempts,
        minutesBack: parseInt(minutes),
        total: attempts.length,
      },
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/failed-logins' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Check if suspicious activity detected
 */
router.get('/suspicious', authenticate, async (req, res) => {
  try {
    const suspicious = await auditService.detectSuspiciousActivity(req.user.id);

    return res.status(200).json({
      success: true,
      data: suspicious,
    });
  } catch (err) {
    logError(err, { route: 'GET /audit/suspicious' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

/**
 * Export audit logs for compliance
 */
router.post('/export', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: {
          message: 'startDate and endDate are required',
          code: 'VALIDATION_ERROR',
          statusCode: 400,
        },
      });
    }

    const logs = await auditService.exportLogsForCompliance(
      req.user.id,
      new Date(startDate),
      new Date(endDate)
    );

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);

    // Convert to CSV
    if (logs.length === 0) {
      res.send('No logs found for this date range');
      return;
    }

    const headers = Object.keys(logs[0]);
    const csv = [
      headers.join(','),
      ...logs.map((log) => headers.map((h) => `"${log[h] || ''}"`).join(',')),
    ].join('\n');

    return res.send(csv);
  } catch (err) {
    logError(err, { route: 'POST /audit/export' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
});

module.exports = router;
