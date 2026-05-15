const User = require('../models/user.model');
const jwtUtil = require('../utils/jwt.util');
const redisUtil = require('../utils/redis.util');
const sessionUtil = require('../utils/session.util');
const {
  buildCookieOptions,
  buildCookieClearOptions,
  getRefreshTokenStorageKey,
} = require('../utils/auth-security.util');
const {
  AuthenticationError,
  AuthorizationError,
  TokenExpiredError,
  TokenError,
  formatErrorResponse,
  logError,
} = require('../utils/errors.util');

const clearAuthCookies = (res) => {
  const options = buildCookieClearOptions();
  res.clearCookie('accessToken', options);
  res.clearCookie('refreshToken', options);
  res.clearCookie('sessionId', options);
};

const isAuthCleanupError = (err) =>
  err instanceof AuthenticationError ||
  err instanceof TokenExpiredError ||
  err instanceof TokenError;

/**
 * Attach authenticated user to request
 */
const attachUser = async (req, token) => {
  try {
    const decoded = jwtUtil.verifyAccessToken(token);

    // Check if user is cached in Redis
    const cachedUser = await redisUtil.getCachedUserData(decoded.id);
    if (cachedUser) {
      req.user = cachedUser;
      return;
    }

    // Fetch from database if not cached
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or deactivated');
    }

    req.user = {
      id: user._id,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
    };

    // Cache user data for 1 hour
    await redisUtil.cacheUserData(req.user.id, req.user, 3600);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Access token expired', err.expiredAt);
    }
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new TokenError('Invalid access token');
  }
};

/**
 * Main authentication middleware
 */
const authenticate = async (req, res, next) => {
  try {
    const token = jwtUtil.extractTokenFromRequest(req);

    if (!token) {
      const restored = await tryRefreshFallback(req, res);
      if (!restored) {
        throw new AuthenticationError('No authentication token provided');
      }
      return next();
    }

    await attachUser(req, token);
    await ensureRequestSession(req, res);
    if (req.cookies?.sessionId) {
      await sessionUtil.updateSessionActivity(req.cookies.sessionId);
    }
    return next();
  } catch (err) {
    if (isAuthCleanupError(err)) {
      clearAuthCookies(res);
    }
    logError(err, { middleware: 'authenticate' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = jwtUtil.extractTokenFromRequest(req);

    if (!token) {
      try {
        const restored = await tryRefreshFallback(req, res);
        if (restored) {
          return next();
        }
      } catch (refreshErr) {
        console.warn('[optionalAuthenticate] Refresh fallback failed:', refreshErr.message);
      }
      return next();
    }

    await attachUser(req, token);
    await ensureRequestSession(req, res);
    if (req.cookies?.sessionId) {
      await sessionUtil.updateSessionActivity(req.cookies.sessionId);
    }
    return next();
  } catch (err) {
    // Continue without user if optional auth fails
    console.warn('[optionalAuthenticate] Auth failed, continuing unauthenticated:', err.message);
    return next();
  }
};

/**
 * Verify refresh token and attach user
 */
const attachUserFromRefreshToken = async (req, refreshToken) => {
  try {
    const decoded = jwtUtil.verifyRefreshToken(refreshToken);

    // Verify refresh token exists in Redis
    const sessionId = req.cookies?.sessionId || req.body?.sessionId || null;
    const storageKey = getRefreshTokenStorageKey({ sessionId, userId: decoded.id });
    const exists = await redisUtil.verifyRefreshTokenExists(storageKey, refreshToken);
    if (!exists) {
      throw new TokenError('Refresh token has been revoked');
    }

    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      throw new AuthenticationError('User not found or deactivated');
    }

    req.user = {
      id: user._id,
      role: user.role,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      avatar: user.avatar,
    };
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Refresh token expired', err.expiredAt);
    }
    if (err instanceof AuthenticationError) {
      throw err;
    }
    throw new TokenError('Invalid refresh token');
  }
};

const ensureRequestSession = async (req, res) => {
  const sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    return null;
  }

  const session = await sessionUtil.getSession(sessionId);
  if (!session || String(session.userId) !== String(req.user.id)) {
    clearAuthCookies(res);
    throw new AuthenticationError('Session expired');
  }

  req.session = session;
  return session;
};

const tryRefreshFallback = async (req, res) => {
  const refreshToken = jwtUtil.extractRefreshTokenFromRequest(req);
  if (!refreshToken) {
    return false;
  }

  await attachUserFromRefreshToken(req, refreshToken);
  const session = await ensureRequestSession(req, res);

  const refreshedAccessToken = jwtUtil.generateAccessToken({
    id: req.user.id,
    role: req.user.role,
  });
  const accessTtl = jwtUtil.getTokenExpiryTime(process.env.JWT_ACCESS_EXPIRES_IN || '15m');

  res.cookie('accessToken', refreshedAccessToken, buildCookieOptions(accessTtl * 1000, Boolean(session?.persistent)));
  res.setHeader('x-access-token', refreshedAccessToken);
  res.setHeader('x-auth-restored', 'true');
  res.setHeader('x-session-persistence', session?.persistent ? 'local' : 'session');
  req.authRefreshedAccessToken = refreshedAccessToken;

  if (session?.id) {
    await sessionUtil.updateSessionActivity(session.id);
  }

  return true;
};

/**
 * Refresh token middleware
 */
const refreshTokenMiddleware = async (req, res, next) => {
  try {
    const refreshToken = jwtUtil.extractRefreshTokenFromRequest(req);

    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided');
    }

    await attachUserFromRefreshToken(req, refreshToken);
    await ensureRequestSession(req, res);
    req.refreshToken = refreshToken; // Store for use in controller
    return next();
  } catch (err) {
    if (isAuthCleanupError(err)) {
      clearAuthCookies(res);
    }
    logError(err, { middleware: 'refreshTokenMiddleware' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Role-based authorization middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AuthenticationError('Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Insufficient permissions. Required role(s): ${roles.join(', ')}`
        );
      }

      return next();
    } catch (err) {
      logError(err, { middleware: 'authorize', requiredRoles: roles });
      const { statusCode, body } = formatErrorResponse(err);
      return res.status(statusCode).json(body);
    }
  };
};

/**
 * Admin authorization middleware
 */
const adminOnly = authorize('admin');

/**
 * Moderator or Admin middleware
 */
const moderatorOrAdmin = authorize('moderator', 'admin');

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    const logFn = console[level] || console.log;

    logFn(
      `[${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms ${
        req.user ? `(User: ${req.user.id})` : ''
      }`
    );
  });

  return next();
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  adminOnly,
  moderatorOrAdmin,
  refreshTokenMiddleware,
  attachUserFromRefreshToken,
  requestLogger,
};
