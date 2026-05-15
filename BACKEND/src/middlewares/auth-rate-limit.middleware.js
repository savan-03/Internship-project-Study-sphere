const { RateLimitError, formatErrorResponse, logError } = require('../utils/errors.util');

const attempts = new Map();

const cleanupExpiredEntries = (now) => {
  for (const [key, value] of attempts.entries()) {
    if (value.resetAt <= now) {
      attempts.delete(key);
    }
  }
};

const createAuthRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxAttempts = 10,
  keySelector = null,
}) => {
  return (req, res, next) => {
    try {
      const now = Date.now();
      cleanupExpiredEntries(now);

      const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const customKey = typeof keySelector === 'function' ? keySelector(req) : '';
      const key = `${req.path}:${ip}:${customKey || 'anon'}`;

      const current = attempts.get(key);
      if (!current || current.resetAt <= now) {
        attempts.set(key, {
          count: 1,
          resetAt: now + windowMs,
        });
        return next();
      }

      current.count += 1;
      attempts.set(key, current);

      if (current.count > maxAttempts) {
        const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
        const error = new RateLimitError(retryAfter);
        res.setHeader('Retry-After', String(retryAfter));
        const { statusCode, body } = formatErrorResponse(error);
        return res.status(statusCode).json(body);
      }

      return next();
    } catch (err) {
      logError(err, { middleware: 'createAuthRateLimiter' });
      return next();
    }
  };
};

module.exports = {
  createAuthRateLimiter,
};
