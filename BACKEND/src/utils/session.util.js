// src/utils/session.util.js

const redisUtil = require('./redis.util');
const { v4: uuidv4 } = require('uuid');
const { getRefreshTokenStorageKey } = require('./auth-security.util');

const MAX_CONCURRENT_SESSIONS = parseInt(process.env.MAX_CONCURRENT_SESSIONS || '5');
const SESSION_TTL = parseInt(process.env.SESSION_TTL || '604800'); // 7 days

/**
 * Create a new session
 */
const createSession = async (userId, sessionData = {}) => {
  try {
    const sessionId = uuidv4();
    const client = redisUtil.getRedisClient();

    const session = {
      id: sessionId,
      userId,
      createdAt: Date.now(),
      lastActivityAt: Date.now(),
      ...sessionData,
    };

    // Store session with key: session:{sessionId}
    const sessionKey = `session:${sessionId}`;
    await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(session));

    // Add session ID to user's session list: user_sessions:{userId}
    const userSessionsKey = `user_sessions:${userId}`;
    await client.lPush(userSessionsKey, sessionId);
    await client.expire(userSessionsKey, SESSION_TTL);

    console.log(`[Session] Created for user ${userId}: ${sessionId}`);

    return { sessionId, session };
  } catch (err) {
    console.error('[createSession] Error:', err.message);
    throw err;
  }
};

/**
 * Get session details
 */
const getSession = async (sessionId) => {
  try {
    const client = redisUtil.getRedisClient();
    const sessionKey = `session:${sessionId}`;
    const data = await client.get(sessionKey);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (err) {
    console.error('[getSession] Error:', err.message);
    return null;
  }
};

/**
 * Update session activity
 */
const updateSessionActivity = async (sessionId) => {
  try {
    const client = redisUtil.getRedisClient();
    const sessionKey = `session:${sessionId}`;

    const session = await getSession(sessionId);
    if (!session) {
      return null;
    }

    session.lastActivityAt = Date.now();

    await client.setEx(sessionKey, SESSION_TTL, JSON.stringify(session));
    await client.expire(sessionKey, SESSION_TTL);

    return session;
  } catch (err) {
    console.error('[updateSessionActivity] Error:', err.message);
    return null;
  }
};

/**
 * Get all active sessions for user
 */
const getUserSessions = async (userId) => {
  try {
    const client = redisUtil.getRedisClient();
    const userSessionsKey = `user_sessions:${userId}`;

    const sessionIds = await client.lRange(userSessionsKey, 0, -1);
    const sessions = [];

    for (const sessionId of sessionIds) {
      const session = await getSession(sessionId);
      if (session) {
        sessions.push(session);
      }
    }

    // Sort by most recent first
    sessions.sort((a, b) => b.createdAt - a.createdAt);

    return sessions;
  } catch (err) {
    console.error('[getUserSessions] Error:', err.message);
    return [];
  }
};

/**
 * Terminate session
 */
const terminateSession = async (sessionId) => {
  try {
    const client = redisUtil.getRedisClient();

    const session = await getSession(sessionId);
    if (!session) {
      return false;
    }

    const sessionKey = `session:${sessionId}`;
    await client.del(sessionKey);
    await redisUtil.revokeRefreshToken(getRefreshTokenStorageKey({ sessionId, userId: session.userId }));

    // Remove from user's session list
    const userSessionsKey = `user_sessions:${session.userId}`;
    await client.lRem(userSessionsKey, 1, sessionId);

    console.log(`[Session] Terminated: ${sessionId}`);

    return true;
  } catch (err) {
    console.error('[terminateSession] Error:', err.message);
    throw err;
  }
};

/**
 * Check and enforce session limits
 */
const enforceSessionLimit = async (userId) => {
  try {
    const sessions = await getUserSessions(userId);

    if (sessions.length <= MAX_CONCURRENT_SESSIONS) {
      return {
        enforced: false,
        message: 'Session limit not reached',
        sessionsCount: sessions.length,
      };
    }

    // Remove oldest sessions
    const sessionsToRemove = sessions.length - MAX_CONCURRENT_SESSIONS;

    for (let i = 0; i < sessionsToRemove; i++) {
      const oldestSession = sessions[sessions.length - 1 - i];
      await terminateSession(oldestSession.id);
    }

    console.log(`[Session] Enforced limit for user ${userId}, removed ${sessionsToRemove} sessions`);

    return {
      enforced: true,
      message: `Removed ${sessionsToRemove} oldest session(s)`,
      sessionsCount: MAX_CONCURRENT_SESSIONS,
      removedSessionIds: sessions.slice(-sessionsToRemove).map((s) => s.id),
    };
  } catch (err) {
    console.error('[enforceSessionLimit] Error:', err.message);
    throw err;
  }
};

/**
 * Terminate all sessions for user
 */
const terminateAllSessions = async (userId, exceptSessionId = null) => {
  try {
    const sessions = await getUserSessions(userId);
    let terminatedCount = 0;

    for (const session of sessions) {
      if (exceptSessionId && session.id === exceptSessionId) {
        continue;
      }

      await terminateSession(session.id);
      terminatedCount++;
    }

    console.log(`[Session] Terminated all sessions for user ${userId}, count: ${terminatedCount}`);

    return {
      terminatedCount,
      remainingSessionIds: exceptSessionId ? [exceptSessionId] : [],
    };
  } catch (err) {
    console.error('[terminateAllSessions] Error:', err.message);
    throw err;
  }
};

/**
 * Terminate sessions by device
 */
const terminateSessionsByDevice = async (userId, deviceId) => {
  try {
    const sessions = await getUserSessions(userId);
    let terminatedCount = 0;

    for (const session of sessions) {
      if (session.deviceId === deviceId) {
        await terminateSession(session.id);
        terminatedCount++;
      }
    }

    console.log(
      `[Session] Terminated ${terminatedCount} sessions for device ${deviceId} of user ${userId}`
    );

    return { terminatedCount };
  } catch (err) {
    console.error('[terminateSessionsByDevice] Error:', err.message);
    throw err;
  }
};

/**
 * Get concurrent session count
 */
const getConcurrentSessionCount = async (userId) => {
  try {
    const sessions = await getUserSessions(userId);
    return sessions.length;
  } catch (err) {
    console.error('[getConcurrentSessionCount] Error:', err.message);
    return 0;
  }
};

/**
 * Check if session is valid and active
 */
const isSessionValid = async (sessionId) => {
  try {
    const session = await getSession(sessionId);
    return session !== null;
  } catch (err) {
    console.error('[isSessionValid] Error:', err.message);
    return false;
  }
};

/**
 * Get session statistics for user
 */
const getSessionStats = async (userId) => {
  try {
    const sessions = await getUserSessions(userId);

    const deviceBreakdown = {};
    const locationBreakdown = {};
    let totalActivity = 0;

    for (const session of sessions) {
      // Device breakdown
      const device = session.deviceId || 'unknown';
      deviceBreakdown[device] = (deviceBreakdown[device] || 0) + 1;

      // Location breakdown
      const location = session.location || 'unknown';
      locationBreakdown[location] = (locationBreakdown[location] || 0) + 1;

      // Calculate total activity time
      const activityTime = Date.now() - session.lastActivityAt;
      totalActivity += activityTime;
    }

    const averageSessionDuration = sessions.length > 0 ? totalActivity / sessions.length : 0;

    return {
      totalActiveSessions: sessions.length,
      deviceBreakdown,
      locationBreakdown,
      averageSessionDuration: Math.round(averageSessionDuration / 1000), // in seconds
      mostRecentSession: sessions[0] || null,
      oldestSession: sessions[sessions.length - 1] || null,
    };
  } catch (err) {
    console.error('[getSessionStats] Error:', err.message);
    return null;
  }
};

/**
 * Detect unusual session activity
 */
const detectUnusualActivity = async (userId) => {
  try {
    const sessions = await getUserSessions(userId);
    const stats = await getSessionStats(userId);

    const unusual = {
      tooManySessions: sessions.length > MAX_CONCURRENT_SESSIONS,
      multipleLocations: Object.keys(stats.locationBreakdown).length > 2,
      multipleDevices: Object.keys(stats.deviceBreakdown).length > 3,
      recentlyAdded: sessions.filter((s) => Date.now() - s.createdAt < 300000).length > 2, // Last 5 minutes
    };

    unusual.riskLevel = Object.values(unusual).filter(Boolean).length;

    return unusual;
  } catch (err) {
    console.error('[detectUnusualActivity] Error:', err.message);
    return {
      tooManySessions: false,
      multipleLocations: false,
      multipleDevices: false,
      recentlyAdded: false,
      riskLevel: 0,
    };
  }
};

/**
 * Clean up expired sessions (manual trigger)
 */
const cleanupExpiredSessions = async (userId) => {
  try {
    const client = redisUtil.getRedisClient();
    const userSessionsKey = `user_sessions:${userId}`;

    const sessionIds = await client.lRange(userSessionsKey, 0, -1);
    let cleanedCount = 0;

    for (const sessionId of sessionIds) {
      const session = await getSession(sessionId);
      if (!session) {
        await client.lRem(userSessionsKey, 1, sessionId);
        cleanedCount++;
      }
    }

    console.log(`[Session] Cleaned up ${cleanedCount} expired sessions for user ${userId}`);

    return { cleanedCount };
  } catch (err) {
    console.error('[cleanupExpiredSessions] Error:', err.message);
    throw err;
  }
};

module.exports = {
  createSession,
  getSession,
  updateSessionActivity,
  getUserSessions,
  terminateSession,
  enforceSessionLimit,
  terminateAllSessions,
  terminateSessionsByDevice,
  getConcurrentSessionCount,
  isSessionValid,
  getSessionStats,
  detectUnusualActivity,
  cleanupExpiredSessions,
  MAX_CONCURRENT_SESSIONS,
  SESSION_TTL,
};
