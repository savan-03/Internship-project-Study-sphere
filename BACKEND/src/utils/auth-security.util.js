const { UAParser } = require('ua-parser-js');

const normalizeEmail = (value = '') => String(value).trim().toLowerCase();
const normalizeUsername = (value = '') => String(value).trim().toLowerCase();

const getPasswordValidationMessage = (password = '') => {
  const value = String(password);
  if (value.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password must include at least one uppercase letter.';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password must include at least one lowercase letter.';
  }
  if (!/\d/.test(value)) {
    return 'Password must include at least one number.';
  }
  return '';
};

const getCookieSameSite = () => {
  const configured = String(process.env.AUTH_COOKIE_SAMESITE || '').trim().toLowerCase();
  if (configured === 'none' || configured === 'lax' || configured === 'strict') {
    return configured;
  }
  return process.env.NODE_ENV === 'production' ? 'strict' : 'lax';
};

const shouldUseSecureCookies = () =>
  process.env.NODE_ENV === 'production' || String(process.env.AUTH_COOKIE_SECURE || '').toLowerCase() === 'true';

const buildCookieOptions = (maxAge, persistent = true) => {
  const sameSite = getCookieSameSite();
  const secure = sameSite === 'none' ? true : shouldUseSecureCookies();
  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: '/',
  };

  if (process.env.AUTH_COOKIE_DOMAIN) {
    options.domain = process.env.AUTH_COOKIE_DOMAIN;
  }

  if (persistent && maxAge) {
    options.maxAge = maxAge;
  }

  return options;
};

const buildCookieClearOptions = () => ({
  httpOnly: true,
  secure: getCookieSameSite() === 'none' ? true : shouldUseSecureCookies(),
  sameSite: getCookieSameSite(),
  path: '/',
  ...(process.env.AUTH_COOKIE_DOMAIN ? { domain: process.env.AUTH_COOKIE_DOMAIN } : {}),
});

const buildSessionClientMeta = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const browserName = parser.getBrowser().name || 'Browser';
  const osName = parser.getOS().name || 'Unknown OS';
  const deviceType = parser.getDevice().type || 'desktop';

  return {
    userAgent,
    deviceId: userAgent.slice(0, 120),
    deviceLabel: `${browserName} on ${osName}`,
    deviceType,
    ipAddress: req.ip,
  };
};

const getRefreshTokenStorageKey = ({ sessionId, userId }) => {
  if (sessionId) {
    return `refresh_token:${sessionId}`;
  }
  return `refresh_token:user:${userId}`;
};

module.exports = {
  normalizeEmail,
  normalizeUsername,
  getPasswordValidationMessage,
  buildCookieOptions,
  buildCookieClearOptions,
  buildSessionClientMeta,
  getRefreshTokenStorageKey,
};
