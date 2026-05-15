// src/controllers/oauth.controller.js

const User = require('../models/user.model');
const OAuthAccount = require('../models/oauth-account.model');
const jwtUtil = require('../utils/jwt.util');
const redisUtil = require('../utils/redis.util');
const sessionUtil = require('../utils/session.util');
const {
  buildCookieOptions,
  buildSessionClientMeta,
  getRefreshTokenStorageKey,
  normalizeEmail,
  normalizeUsername,
} = require('../utils/auth-security.util');
const auditService = require('../services/audit.service');
const {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  formatErrorResponse,
  logError,
} = require('../utils/errors.util');

/**
 * Handle OAuth user callback (Google/GitHub)
 */
const handleOAuthCallback = async (req, res) => {
  try {
    const { provider, profile } = req;

    if (!provider || !profile) {
      throw new AuthenticationError('OAuth profile not found');
    }

    const providerUserId = profile.id;
    const email = normalizeEmail(profile.emails?.[0]?.value || profile.email);
    const displayName = profile.displayName || profile.name?.givenName || 'User';
    const profilePicture = profile.photos?.[0]?.value;
    const profileUrl = profile.profileUrl || profile.url;
    const accessToken = profile.accessToken;
    const refreshToken = profile.refreshToken;
    const scope = profile.scope || [];

    // Calculate token expiry (usually 1 hour for Google, varies for GitHub)
    const tokenExpiry = profile.tokenExpiry || new Date(Date.now() + 60 * 60 * 1000);

    // Find or create OAuth account
    let oauthAccount = await OAuthAccount.findOrCreate({
      userId: null, // Will be updated if user exists
      provider,
      providerUserId,
      email,
      displayName,
      profileUrl,
      profilePicture,
      accessToken,
      refreshToken,
      tokenExpiry,
      scope,
      isVerified: true,
    });

    // Find existing user by email or OAuth account
    let user = null;

    if (oauthAccount.userId) {
      user = await User.findById(oauthAccount.userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    // Create new user if doesn't exist
    if (!user) {
      // Generate unique username from email or display name
      let username = normalizeUsername(displayName.replace(/\s+/g, ''));
      let counter = 1;
      let usernameExists = await User.findOne({ username });

      while (usernameExists) {
        username = normalizeUsername(`${displayName.replace(/\s+/g, '')}_${counter}`);
        usernameExists = await User.findOne({ username });
        counter++;
      }

      // Create new user
      user = await User.create({
        fullName: displayName,
        username,
        email,
        avatar: profilePicture,
        role: 'user',
        profileType: 'user',
        isEmailVerified: true, // OAuth emails are pre-verified
      });

      console.log(`[OAuth] New user created: ${user._id} via ${provider}`);

      // Log user creation
      await auditService.createAuditLog({
        userId: user._id,
        action: 'REGISTER',
        status: 'SUCCESS',
        email: user.email,
        username: user.username,
        ipAddress: auditService.getIPAddress(req),
        userAgent: req.headers['user-agent'],
        provider,
        details: { provider, displayName },
        severity: 'LOW',
      });
    }

    // Update OAuth account with user ID if not set
    if (!oauthAccount.userId) {
      oauthAccount = await OAuthAccount.findByIdAndUpdate(
        oauthAccount._id,
        { userId: user._id },
        { new: true }
      );
    }

    // Generate token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } =
      jwtUtil.generateTokenPair({
        id: user._id,
        role: user.role,
      });

    // Create session
    const sessionMeta = buildSessionClientMeta(req);
    const { sessionId } = await sessionUtil.createSession(user._id, {
      provider,
      oauthAccountId: oauthAccount._id,
      email: user.email,
      displayName: user.fullName,
      ipAddress: auditService.getIPAddress(req),
      location: req.geoLocation?.city || 'Unknown',
      persistent: true,
      ...sessionMeta,
    });

    // Store refresh token in Redis
    const refreshTokenTTL = jwtUtil.getTokenExpiryTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    await Promise.all([
      redisUtil.storeRefreshToken(
        getRefreshTokenStorageKey({ sessionId, userId: user._id }),
        newRefreshToken,
        refreshTokenTTL
      ),
      redisUtil.storeSession(
        user._id,
        {
          email: user.email,
          role: user.role,
          username: user.username,
          provider,
        },
        refreshTokenTTL
      ),
    ]);

    // Enforce session limits
    await sessionUtil.enforceSessionLimit(user._id);

    // Log OAuth login
    await auditService.createAuditLog({
      userId: user._id,
      action: 'LOGIN',
      status: 'SUCCESS',
      email: user.email,
      username: user.username,
      ipAddress: auditService.getIPAddress(req),
      userAgent: req.headers['user-agent'],
      sessionId,
      provider,
      details: { provider, oauthAccountId: oauthAccount._id },
      severity: 'LOW',
    });

    // Set HTTP-only cookies
    res.cookie('accessToken', newAccessToken, buildCookieOptions(expiresIn * 1000, true));
    res.cookie('refreshToken', newRefreshToken, buildCookieOptions(refreshTokenTTL * 1000, true));
    res.cookie('sessionId', sessionId, buildCookieOptions(refreshTokenTTL * 1000, true));

    // Return tokens and user
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionId,
        expiresIn,
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    logError(err, { controller: 'handleOAuthCallback' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Connect OAuth account to existing user
 */
const connectOAuthAccount = async (req, res) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { provider, profile } = req;

    if (!provider || !profile) {
      throw new AuthenticationError('OAuth profile not found');
    }

    // Check if OAuth account already exists for another user
    const existingOAuth = await OAuthAccount.findOne({
      provider,
      providerUserId: profile.id,
    });

    if (existingOAuth && existingOAuth.userId.toString() !== req.user.id.toString()) {
      throw new ConflictError('This OAuth account is already linked to another account');
    }

    // Create or update OAuth account
    let oauthAccount = await OAuthAccount.findOrCreate({
      userId: req.user.id,
      provider,
      providerUserId: profile.id,
      email: profile.emails?.[0]?.value || profile.email,
      displayName: profile.displayName,
      profileUrl: profile.url,
      profilePicture: profile.photos?.[0]?.value,
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
      tokenExpiry: profile.tokenExpiry,
      scope: profile.scope,
      isVerified: true,
    });

    // Log OAuth connection
    await auditService.createAuditLog({
      userId: req.user.id,
      action: 'OAUTH_CONNECT',
      status: 'SUCCESS',
      ipAddress: auditService.getIPAddress(req),
      userAgent: req.headers['user-agent'],
      provider,
      details: { provider, oauthAccountId: oauthAccount._id },
      severity: 'MEDIUM',
    });

    return res.status(200).json({
      success: true,
      message: `${provider} account connected successfully`,
      data: {
        oauthAccountId: oauthAccount._id,
        provider,
        email: oauthAccount.email,
        displayName: oauthAccount.displayName,
      },
    });
  } catch (err) {
    logError(err, { controller: 'connectOAuthAccount' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Disconnect OAuth account
 */
const disconnectOAuthAccount = async (req, res) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { provider } = req.params;

    if (!['google', 'github'].includes(provider)) {
      throw new Error('Invalid provider');
    }

    // Find and delete OAuth account
    const oauthAccount = await OAuthAccount.findOneAndDelete({
      userId: req.user.id,
      provider,
    });

    if (!oauthAccount) {
      throw new NotFoundError('OAuth account', `provider ${provider}`);
    }

    // Log OAuth disconnection
    await auditService.createAuditLog({
      userId: req.user.id,
      action: 'OAUTH_DISCONNECT',
      status: 'SUCCESS',
      ipAddress: auditService.getIPAddress(req),
      userAgent: req.headers['user-agent'],
      provider,
      details: { provider, oauthAccountId: oauthAccount._id },
      severity: 'MEDIUM',
    });

    return res.status(200).json({
      success: true,
      message: `${provider} account disconnected successfully`,
    });
  } catch (err) {
    logError(err, { controller: 'disconnectOAuthAccount' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get connected OAuth accounts for user
 */
const getConnectedOAuthAccounts = async (req, res) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const oauthAccounts = await OAuthAccount.find({ userId: req.user.id }).select(
      '-accessToken -refreshToken'
    );

    return res.status(200).json({
      success: true,
      data: {
        accounts: oauthAccounts,
        total: oauthAccounts.length,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getConnectedOAuthAccounts' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get OAuth account details
 */
const getOAuthAccountDetails = async (req, res) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    const { provider } = req.params;

    const oauthAccount = await OAuthAccount.findOne({
      userId: req.user.id,
      provider,
    }).select('-accessToken -refreshToken');

    if (!oauthAccount) {
      throw new NotFoundError('OAuth account', `provider ${provider}`);
    }

    return res.status(200).json({
      success: true,
      data: oauthAccount,
    });
  } catch (err) {
    logError(err, { controller: 'getOAuthAccountDetails' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

module.exports = {
  handleOAuthCallback,
  connectOAuthAccount,
  disconnectOAuthAccount,
  getConnectedOAuthAccounts,
  getOAuthAccountDetails,
};
