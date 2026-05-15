// src/utils/jwt.util.js
const jwt = require('jsonwebtoken');

const DEFAULT_ACCESS_SECRET = 'access_token_secret_change_in_production';
const DEFAULT_REFRESH_SECRET = 'refresh_token_secret_change_in_production';
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || DEFAULT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || DEFAULT_REFRESH_SECRET;
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const assertJwtConfiguration = () => {
  if (process.env.NODE_ENV === 'production') {
    if (JWT_ACCESS_SECRET === DEFAULT_ACCESS_SECRET || JWT_REFRESH_SECRET === DEFAULT_REFRESH_SECRET) {
      throw new Error('JWT secrets must be configured in production. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.');
    }
  }
};

assertJwtConfiguration();

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
      algorithm: 'HS256',
    });
  } catch (err) {
    console.error('[generateAccessToken] Error:', err.message);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: 'HS256',
    });
  } catch (err) {
    console.error('[generateRefreshToken] Error:', err.message);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate token pair
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: getTokenExpiryTime(JWT_ACCESS_EXPIRES_IN),
  };
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Access token expired');
      error.name = 'TokenExpiredError';
      error.expiredAt = err.expiredAt;
      throw error;
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid access token');
    }
    throw err;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Refresh token expired');
      error.name = 'TokenExpiredError';
      error.expiredAt = err.expiredAt;
      throw error;
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    }
    throw err;
  }
};

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    console.error('[decodeToken] Error:', err.message);
    return null;
  }
};

/**
 * Extract token from request (Authorization header or cookies)
 */
const extractTokenFromRequest = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
};

/**
 * Extract refresh token from request
 */
const extractRefreshTokenFromRequest = (req) => {
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken;
  }

  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  return null;
};

/**
 * Get token expiry time in seconds
 */
const getTokenExpiryTime = (expiresIn) => {
  if (typeof expiresIn === 'number') return expiresIn;

  const units = { d: 86400, h: 3600, m: 60, s: 1 };
  const match = expiresIn.match(/^(\d+)([dhms])$/);

  if (!match) return 900; // default 15 minutes

  const [, value, unit] = match;
  return parseInt(value) * (units[unit] || 1);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromRequest,
  extractRefreshTokenFromRequest,
  getTokenExpiryTime,
};
