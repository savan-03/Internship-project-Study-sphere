// src/models/audit-log.model.js

const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      enum: [
        'REGISTER',
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'TOKEN_REFRESH',
        'PASSWORD_CHANGE',
        'PROFILE_UPDATE',
        'OAUTH_CONNECT',
        'OAUTH_DISCONNECT',
        'SESSION_CREATE',
        'SESSION_TERMINATE',
        'SESSION_LIMIT_REACHED',
        '2FA_ENABLE',
        '2FA_DISABLE',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        'ROLE_CHANGE',
        'EMAIL_CHANGE',
        'DEVICE_ADDED',
        'DEVICE_REMOVED',
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'ATTEMPTED'],
      default: 'SUCCESS',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    deviceInfo: {
      browser: String,
      os: String,
      device: String,
      version: String,
    },
    location: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    sessionId: {
      type: String,
      index: true,
    },
    provider: {
      type: String,
      enum: ['local', 'google', 'github', 'unknown'],
      default: 'local',
    },
    reason: {
      type: String,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW',
    },
    flagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    flagReason: {
      type: String,
    },
    relatedLogs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuditLog',
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for common queries
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ ipAddress: 1, createdAt: -1 });
AuditLogSchema.index({ flagged: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days TTL

// Virtual for time ago
AuditLogSchema.virtual('timeAgo').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
});

// Get logs for user
AuditLogSchema.statics.getUserLogs = function (userId, options = {}) {
  const { limit = 50, skip = 0, action = null } = options;

  let query = this.find({ userId });

  if (action) {
    query = query.where('action').equals(action);
  }

  return query
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .select('-details');
};

// Detect suspicious activity
AuditLogSchema.statics.detectSuspicious = async function (userId, minutes = 5) {
  const threshold = new Date(Date.now() - minutes * 60 * 1000);

  const failedLogins = await this.countDocuments({
    userId,
    action: 'LOGIN_FAILED',
    createdAt: { $gte: threshold },
  });

  const successfulLogins = await this.countDocuments({
    userId,
    action: 'LOGIN',
    createdAt: { $gte: threshold },
  });

  return {
    failedLoginCount: failedLogins,
    successfulLoginCount: successfulLogins,
    isSuspicious: failedLogins > 3 || successfulLogins > 5,
  };
};

module.exports = mongoose.model('AuditLog', AuditLogSchema);
