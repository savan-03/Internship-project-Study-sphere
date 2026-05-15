// src/utils/errors.util.js

/**
 * Custom AppError class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.errorCode,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
      },
    };
  }
}

/**
 * Validation Error
 */
class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        ...super.toJSON().error,
        details: this.details,
      },
    };
  }
}

/**
 * Authentication Error
 */
class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error
 */
class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource', identifier = '') {
    const message = identifier
      ? `${resource} with ${identifier} not found`
      : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict Error
 */
class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, 'CONFLICT');
    this.details = details;
  }

  toJSON() {
    return {
      error: {
        ...super.toJSON().error,
        details: this.details,
      },
    };
  }
}

/**
 * Token Error
 */
class TokenError extends AuthenticationError {
  constructor(message = 'Invalid token', errorCode = 'INVALID_TOKEN') {
    super(message);
    this.errorCode = errorCode;
  }
}

/**
 * Token Expired Error
 */
class TokenExpiredError extends TokenError {
  constructor(message = 'Token expired', expiresAt = null) {
    super(message, 'TOKEN_EXPIRED');
    this.expiresAt = expiresAt;
  }

  toJSON() {
    return {
      error: {
        ...super.toJSON().error,
        expiresAt: this.expiresAt,
      },
    };
  }
}

/**
 * Rate Limit Error
 */
class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }

  toJSON() {
    return {
      error: {
        ...super.toJSON().error,
        retryAfter: this.retryAfter,
      },
    };
  }
}

/**
 * Service Error
 */
class ServiceError extends AppError {
  constructor(message = 'Service unavailable', service = 'Unknown') {
    super(message, 503, 'SERVICE_ERROR');
    this.service = service;
  }
}

/**
 * Handle JWT errors
 */
const handleJWTError = (err) => {
  if (err.name === 'JsonWebTokenError') {
    return new TokenError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return new TokenExpiredError('Token expired', err.expiredAt);
  }

  return err;
};

/**
 * Format error response
 */
const formatErrorResponse = (error) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: error.toJSON(),
    };
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    const appError = handleJWTError(error);
    return {
      statusCode: appError.statusCode,
      body: appError.toJSON(),
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const details = {};
    Object.keys(error.errors).forEach((field) => {
      details[field] = error.errors[field].message;
    });

    const appError = new ValidationError('Validation failed', details);
    return {
      statusCode: appError.statusCode,
      body: appError.toJSON(),
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    const appError = new ConflictError(`${field} already exists`, {
      field,
      value: error.keyValue[field],
    });
    return {
      statusCode: appError.statusCode,
      body: appError.toJSON(),
    };
  }

  // Handle unknown errors
  const appError = new AppError(
    error.message || 'An unexpected error occurred',
    error.statusCode || 500,
    'UNKNOWN_ERROR'
  );

  return {
    statusCode: appError.statusCode,
    body: appError.toJSON(),
  };
};

/**
 * Log error
 */
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: error.message,
    code: error.errorCode || 'UNKNOWN',
    statusCode: error.statusCode || 500,
    stack: error.stack,
    context,
  };

  console.error('[Error Log]', JSON.stringify(errorLog, null, 2));

  return errorLog;
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  TokenError,
  TokenExpiredError,
  RateLimitError,
  ServiceError,
  handleJWTError,
  formatErrorResponse,
  logError,
};
