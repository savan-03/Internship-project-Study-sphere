// src/middlewares/errorHandler.middleware.js

const { formatErrorResponse, logError } = require('../utils/errors.util');

/**
 * Global error handling middleware
 * Must be the last middleware in the app
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logError(err, {
    method: req.method,
    path: req.originalUrl,
    userId: req.user?.id || 'anonymous',
  });

  // Format and send error response
  const { statusCode, body } = formatErrorResponse(err);

  return res.status(statusCode).json(body);
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      code: 'NOT_FOUND',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    },
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
