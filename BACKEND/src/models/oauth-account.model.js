// src/models/oauth-account.model.js

const mongoose = require('mongoose');

const OAuthAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['google', 'github'],
      required: true,
    },
    providerUserId: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      trim: true,
    },
    profileUrl: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    accessToken: {
      type: String,
      required: true,
      select: false, // Don't return in queries by default
    },
    refreshToken: {
      type: String,
      select: false,
    },
    tokenExpiry: {
      type: Date,
    },
    scope: {
      type: [String],
      default: [],
    },
    isVerified: {
      type: Boolean,
      default: true, // OAuth emails are pre-verified
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index for provider + providerUserId
OAuthAccountSchema.index({ provider: 1, providerUserId: 1 }, { unique: true });

// Update lastUsedAt on each query
OAuthAccountSchema.pre('findOneAndUpdate', function () {
  this.set({ lastUsedAt: new Date() });
});

// Find or create OAuth account
OAuthAccountSchema.statics.findOrCreate = async function (oauthData) {
  const { provider, providerUserId } = oauthData;

  let account = await this.findOne({ provider, providerUserId });

  if (!account) {
    account = await this.create(oauthData);
  } else {
    // Update token and other info
    account = await this.findByIdAndUpdate(
      account._id,
      {
        accessToken: oauthData.accessToken,
        refreshToken: oauthData.refreshToken || account.refreshToken,
        tokenExpiry: oauthData.tokenExpiry,
        lastUsedAt: new Date(),
      },
      { new: true }
    );
  }

  return account;
};

module.exports = mongoose.model('OAuthAccount', OAuthAccountSchema);
