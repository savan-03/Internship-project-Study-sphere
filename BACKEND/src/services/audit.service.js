// src/services/audit.service.js

const AuditLog = require('../models/audit-log.model');
const geoip = require('geoip-lite');
const parser = require('ua-parser-js');

/**
 * Parse user agent to get device info
 */
const parseUserAgent = (userAgentString) => {
  try {
    const ua = new parser(userAgentString);
    return {
      browser: ua.getBrowser().name || 'Unknown',
      os: ua.getOS().name || 'Unknown',
      device: ua.getDevice().type || 'desktop',
      version: ua.getBrowser().version || 'Unknown',
    };
  } catch (err) {
    return {
      browser: 'Unknown',
      os: 'Unknown',
      device: 'unknown',
      version: 'Unknown',
    };
  }
};

/**
 * Get location from IP address
 */
const getLocationFromIP = (ipAddress) => {
  try {
    // Handle localhost and private IPs
    if (ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.startsWith('192.168')) {
      return {
        country: 'Local',
        region: 'Local',
        city: 'Local',
        coordinates: { latitude: 0, longitude: 0 },
      };
    }

    const geo = geoip.lookup(ipAddress);

    if (!geo) {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        coordinates: { latitude: 0, longitude: 0 },
      };
    }

    return {
      country: geo.country || 'Unknown',
      region: geo.timezone?.split('/')[0] || 'Unknown',
      city: geo.city || 'Unknown',
      coordinates: {
        latitude: geo.ll?.[0] || 0,
        longitude: geo.ll?.[1] || 0,
      },
    };
  } catch (err) {
    console.error('[getLocationFromIP]', err.message);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      coordinates: { latitude: 0, longitude: 0 },
    };
  }
};

/**
 * Extract IP address from request
 */
const getIPAddress = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    'unknown'
  );
};

/**
 * Create audit log
 */
const createAuditLog = async ({
  userId = null,
  action,
  status = 'SUCCESS',
  email = null,
  username = null,
  ipAddress,
  userAgent,
  sessionId = null,
  provider = 'local',
  reason = null,
  details = {},
  severity = 'LOW',
  req = null,
}) => {
  try {
    // Extract IP if request provided
    if (req && !ipAddress) {
      ipAddress = getIPAddress(req);
    }

    // Parse device info
    const deviceInfo = userAgent ? parseUserAgent(userAgent) : null;

    // Get location
    const location = ipAddress ? getLocationFromIP(ipAddress) : null;

    // Detect suspicious patterns
    let flagged = false;
    let flagReason = null;

    if (status === 'FAILED') {
      flagged = true;
      flagReason = 'Failed authentication attempt';
    }

    if (severity === 'HIGH' || severity === 'CRITICAL') {
      flagged = true;
      flagReason = `Severity level: ${severity}`;
    }

    const auditLog = await AuditLog.create({
      userId,
      action,
      status,
      email,
      username,
      ipAddress,
      userAgent,
      deviceInfo,
      location,
      sessionId,
      provider,
      reason,
      details,
      severity,
      flagged,
      flagReason,
    });

    return auditLog;
  } catch (err) {
    console.error('[createAuditLog] Error:', err.message);
    throw err;
  }
};

/**
 * Log authentication event
 */
const logAuthEvent = async (req, action, options = {}) => {
  const {
    userId = null,
    email = null,
    username = null,
    status = 'SUCCESS',
    provider = 'local',
    reason = null,
    details = {},
    sessionId = null,
  } = options;

  const ipAddress = getIPAddress(req);
  const userAgent = req.headers['user-agent'];

  // Determine severity
  let severity = 'LOW';
  if (status === 'FAILED') severity = 'MEDIUM';
  if (action === 'ACCOUNT_LOCKED') severity = 'HIGH';
  if (action === 'PASSWORD_CHANGE' && status === 'SUCCESS') severity = 'MEDIUM';

  return createAuditLog({
    userId,
    action,
    status,
    email,
    username,
    ipAddress,
    userAgent,
    sessionId,
    provider,
    reason,
    details,
    severity,
  });
};

/**
 * Get user audit logs
 */
const getUserAuditLogs = async (userId, options = {}) => {
  const { limit = 50, skip = 0, action = null } = options;

  const logs = await AuditLog.getUserLogs(userId, {
    limit,
    skip,
    action,
  });

  return logs;
};

/**
 * Get recent activity for user
 */
const getRecentActivity = async (userId, hours = 24) => {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);

  const activity = await AuditLog.find({
    userId,
    createdAt: { $gte: threshold },
  })
    .sort({ createdAt: -1 })
    .select('-details')
    .limit(100);

  return activity;
};

/**
 * Detect suspicious login activity
 */
const detectSuspiciousActivity = async (userId) => {
  const suspicious = await AuditLog.detectSuspicious(userId, 5);
  return suspicious;
};

/**
 * Get failed login attempts
 */
const getFailedLoginAttempts = async (userId, minutes = 60) => {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  const attempts = await AuditLog.find({
    userId,
    action: 'LOGIN_FAILED',
    createdAt: { $gte: threshold },
  })
    .sort({ createdAt: -1 })
    .select('ipAddress location deviceInfo createdAt reason');

  return attempts;
};

/**
 * Get login sessions for user
 */
const getLoginSessions = async (userId) => {
  const sessions = await AuditLog.find({
    userId,
    action: { $in: ['LOGIN', 'SESSION_CREATE'] },
  })
    .sort({ createdAt: -1 })
    .select('sessionId ipAddress location deviceInfo createdAt provider')
    .limit(50);

  return sessions;
};

/**
 * Check if IP has been used before
 */
const isNewIP = async (userId, ipAddress) => {
  const existingLog = await AuditLog.findOne({
    userId,
    ipAddress,
    action: 'LOGIN',
  }).sort({ createdAt: -1 });

  return !existingLog;
};

/**
 * Get flagged logs
 */
const getFlaggedLogs = async (options = {}) => {
  const { limit = 100, skip = 0, userId = null, daysBack = 7 } = options;

  const threshold = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  let query = AuditLog.find({
    flagged: true,
    createdAt: { $gte: threshold },
  });

  if (userId) {
    query = query.where('userId').equals(userId);
  }

  const logs = await query
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await query.countDocuments();

  return { logs, total };
};

/**
 * Get audit summary for dashboard
 */
const getAuditSummary = async (userId, daysBack = 30) => {
  const threshold = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);

  const [loginCount, failedLogins, deviceCount, newIPCount, suspiciousLogsCount] =
    await Promise.all([
      AuditLog.countDocuments({
        userId,
        action: 'LOGIN',
        status: 'SUCCESS',
        createdAt: { $gte: threshold },
      }),
      AuditLog.countDocuments({
        userId,
        action: 'LOGIN_FAILED',
        createdAt: { $gte: threshold },
      }),
      AuditLog.distinct('deviceInfo.device', {
        userId,
        action: { $in: ['LOGIN', 'SESSION_CREATE'] },
        createdAt: { $gte: threshold },
      }),
      AuditLog.countDocuments({
        userId,
        action: 'LOGIN',
        status: 'SUCCESS',
        createdAt: { $gte: threshold },
      }).then(async (count) => {
        // Count unique IPs that are new
        const ips = await AuditLog.distinct('ipAddress', {
          userId,
          action: 'LOGIN',
          status: 'SUCCESS',
          createdAt: { $gte: threshold },
        });

        let newCount = 0;
        for (const ip of ips) {
          const isNew = await isNewIP(userId, ip);
          if (isNew) newCount++;
        }
        return newCount;
      }),
      AuditLog.countDocuments({
        userId,
        flagged: true,
        createdAt: { $gte: threshold },
      }),
    ]);

  return {
    totalLogins: loginCount,
    failedLogins,
    uniqueDevices: deviceCount.length,
    newIPAddresses: newIPCount,
    suspiciousLogs: suspiciousLogsCount,
    securityScore: calculateSecurityScore(loginCount, failedLogins, suspiciousLogsCount),
  };
};

/**
 * Calculate security score (0-100)
 */
const calculateSecurityScore = (logins, failedLogins, suspicious) => {
  let score = 100;

  // Deduct for failed logins
  score -= Math.min(failedLogins * 5, 30);

  // Deduct for suspicious activity
  score -= Math.min(suspicious * 3, 20);

  return Math.max(score, 0);
};

/**
 * Export logs for compliance
 */
const exportLogsForCompliance = async (userId, startDate, endDate) => {
  const logs = await AuditLog.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate },
  })
    .sort({ createdAt: -1 });

  return logs.map((log) => ({
    timestamp: log.createdAt,
    action: log.action,
    status: log.status,
    ipAddress: log.ipAddress,
    location: log.location.city,
    device: log.deviceInfo?.device,
    browser: log.deviceInfo?.browser,
    provider: log.provider,
  }));
};

module.exports = {
  createAuditLog,
  logAuthEvent,
  getUserAuditLogs,
  getRecentActivity,
  detectSuspiciousActivity,
  getFailedLoginAttempts,
  getLoginSessions,
  isNewIP,
  getFlaggedLogs,
  getAuditSummary,
  calculateSecurityScore,
  exportLogsForCompliance,
  getIPAddress,
  getLocationFromIP,
  parseUserAgent,
};
