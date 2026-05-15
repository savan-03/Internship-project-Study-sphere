const User = require('../models/user.model');
const jwtUtil = require('../utils/jwt.util');
const redisUtil = require('../utils/redis.util');
const sessionUtil = require('../utils/session.util');
const {
  normalizeEmail,
  normalizeUsername,
  getPasswordValidationMessage,
  buildCookieOptions,
  buildCookieClearOptions,
  buildSessionClientMeta,
  getRefreshTokenStorageKey,
} = require('../utils/auth-security.util');
const auditService = require('../services/audit.service');
const {
  logUserActivity,
  getUserProfileSummary,
  getPublicUserProfileSummary,
} = require('../services/activity.service');
const { createNotification } = require('../services/notification.service');
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
  formatErrorResponse,
  logError,
} = require('../utils/errors.util');

/**
 * Build auth response with token pair
 */
const buildAuthResponse = (user, accessToken, refreshToken, expiresIn, session = null) => {
  return {
    success: true,
    data: {
      accessToken,
      refreshToken,
      expiresIn,
      session,
      user: user.toSafeObject(),
    },
  };
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const {
      fullName,
      username,
      email,
      password,
      confirmPassword,
      acceptTerms,
    } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    // Validation
    if (!fullName || !username || !email || !password) {
      const error = new ValidationError('All fields are required', {
        fullName: !fullName ? 'Required' : undefined,
        username: !username ? 'Required' : undefined,
        email: !email ? 'Required' : undefined,
        password: !password ? 'Required' : undefined,
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (acceptTerms !== true) {
      const error = new ValidationError('You must accept the terms to create an account.', {
        acceptTerms: 'Acceptance required',
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (password !== confirmPassword) {
      const error = new ValidationError('Passwords do not match.', {
        confirmPassword: 'Must match password',
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    const passwordValidationMessage = getPasswordValidationMessage(password);
    if (passwordValidationMessage) {
      const error = new ValidationError(passwordValidationMessage, {
        password: passwordValidationMessage,
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Check for existing user
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ username: normalizedUsername }),
    ]);

    if (existingEmail) {
      const error = new ConflictError('Email already registered', { email });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    if (existingUsername) {
      const error = new ConflictError('Username already taken', { username });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Create user
    const newUser = await User.create({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      role: 'user',
      profileType: 'user',
    });

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = jwtUtil.generateTokenPair({
      id: newUser._id,
      role: newUser.role,
    });

    const sessionMeta = buildSessionClientMeta(req);
    const refreshTokenTTL = jwtUtil.getTokenExpiryTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    const { sessionId } = await sessionUtil.createSession(newUser._id, {
      email: newUser.email,
      displayName: newUser.fullName,
      provider: 'local',
      persistent: false,
      ipAddress: auditService.getIPAddress(req),
      location: req.geoLocation?.city || 'Unknown',
      ...sessionMeta,
    });

    // Store refresh token in Redis
    await redisUtil.storeRefreshToken(
      getRefreshTokenStorageKey({ sessionId, userId: newUser._id }),
      refreshToken,
      refreshTokenTTL
    );

    // Store session in Redis
    await redisUtil.storeSession(
      newUser._id,
      {
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
      },
      refreshTokenTTL
    );

    // Log activity and create notification
    await Promise.all([
      logUserActivity(newUser._id, 'register', {
        label: 'Created account',
        metadata: { role: newUser.role },
      }),
      createNotification({
        recipient: newUser._id,
        type: 'register',
        title: 'Welcome to StudySphere',
        message: 'Your account is ready. Complete your profile and start building your learning space.',
        link: '/profile/setup',
        metadata: { role: newUser.role },
      }),
    ]);

    // Set HTTP-only cookies for tokens
    res.cookie('accessToken', accessToken, buildCookieOptions(expiresIn * 1000, false));

    res.cookie('refreshToken', refreshToken, buildCookieOptions(refreshTokenTTL * 1000, false));

    res.cookie('sessionId', sessionId, buildCookieOptions(refreshTokenTTL * 1000, false));

    return res.status(201).json(buildAuthResponse(newUser, accessToken, refreshToken, expiresIn, {
      id: sessionId,
      persistence: 'session',
    }));
  } catch (err) {
    logError(err, { controller: 'register' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'fullName',
      'username',
      'email',
      'bio',
      'location',
      'skills',
      'interests',
      'learningGoals',
      'dailyStudyHours',
      'currentRole',
      'yearsOfExperience',
      'targetRole',
      'careerGoal',
      'avatar',
      'profileType',
      'website',
      'phone',
      'socialProfile',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.email) {
      updates.email = normalizeEmail(updates.email);
    }

    if (updates.username) {
      updates.username = normalizeUsername(updates.username);
    }

    updates.profileSetupCompleted = true;

    // Validate profile type
    if (updates.profileType && !['user', 'moderator', 'admin'].includes(updates.profileType)) {
      const error = new ValidationError('Invalid profile type', {
        profileType: 'Must be user, moderator, or admin',
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Check for username conflict
    if (updates.username) {
      const existingUsername = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user.id },
      });

      if (existingUsername) {
        const error = new ConflictError('Username already taken', { username: updates.username });
        const { statusCode, body } = formatErrorResponse(error);
        return res.status(statusCode).json(body);
      }
    }

    // Check for email conflict
    if (updates.email) {
      const existingEmail = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });

      if (existingEmail) {
        const error = new ConflictError('Email already registered', { email: updates.email });
        const { statusCode, body } = formatErrorResponse(error);
        return res.status(statusCode).json(body);
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Invalidate cache and create new session
    await Promise.all([
      redisUtil.invalidateUserCache(req.user.id),
      logUserActivity(req.user.id, 'profile_update', {
        label: 'Updated profile',
      }),
      createNotification({
        recipient: req.user.id,
        type: 'profile_update',
        title: 'Profile updated',
        message: 'Your profile details were saved successfully.',
        link: '/profile',
        metadata: {
          profileType: user.profileType,
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (err) {
    logError(err, { controller: 'updateProfile' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * User login
 */
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // Validation
    if (!email || !password) {
      const error = new ValidationError('Email and password are required', {
        email: !email ? 'Required' : undefined,
        password: !password ? 'Required' : undefined,
      });
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Find user with password field
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      // Log failed login attempt
      await auditService.logAuthEvent(req, 'LOGIN_FAILED', {
        email,
        status: 'FAILED',
        reason: 'User not found',
      });

      const error = new AuthenticationError('Invalid email or password');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Check if account is active
    if (!user.isActive) {
      // Log failed login attempt
      await auditService.logAuthEvent(req, 'LOGIN_FAILED', {
        userId: user._id,
        email: user.email,
        username: user.username,
        status: 'FAILED',
        reason: 'Account deactivated',
      });

      const error = new AuthenticationError('Account has been deactivated');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await auditService.logAuthEvent(req, 'LOGIN_FAILED', {
        userId: user._id,
        email: user.email,
        username: user.username,
        status: 'FAILED',
        reason: 'Invalid password',
      });

      const error = new AuthenticationError('Invalid email or password');
      const { statusCode, body } = formatErrorResponse(error);
      return res.status(statusCode).json(body);
    }

    // Generate token pair
    const { accessToken, refreshToken, expiresIn } = jwtUtil.generateTokenPair({
      id: user._id,
      role: user.role,
    });

    const sessionMeta = buildSessionClientMeta(req);
    // Create session
    const { sessionId } = await sessionUtil.createSession(user._id, {
      email: user.email,
      displayName: user.fullName,
      ipAddress: auditService.getIPAddress(req),
      location: req.geoLocation?.city || 'Unknown',
      provider: 'local',
      persistent: Boolean(rememberMe),
      ...sessionMeta,
    });

    // Store refresh token in Redis
    const refreshTokenTTL = jwtUtil.getTokenExpiryTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    await redisUtil.storeRefreshToken(
      getRefreshTokenStorageKey({ sessionId, userId: user._id }),
      refreshToken,
      refreshTokenTTL
    );

    // Store session in Redis
    await redisUtil.storeSession(
      user._id,
      {
        email: user.email,
        role: user.role,
        username: user.username,
      },
      refreshTokenTTL
    );

    // Enforce session limits
    const sessionEnforcement = await sessionUtil.enforceSessionLimit(user._id);

    // Log successful login
    await auditService.logAuthEvent(req, 'LOGIN', {
      userId: user._id,
      email: user.email,
      username: user.username,
      status: 'SUCCESS',
      sessionId,
      provider: 'local',
    });

    // Log activity and create notification
    await Promise.all([
      logUserActivity(user._id, 'login', {
        label: 'Logged in',
        pointsAwarded: 0,
      }),
      createNotification({
        recipient: user._id,
        type: 'login',
        title: 'Signed in successfully',
        message: 'You are now signed in to your StudySphere workspace.',
        link: user.role === 'admin' ? '/admin/dashboard' : '/dashboard',
        metadata: {
          role: user.role,
        },
      }),
    ]);

    // Set HTTP-only cookies for tokens
    res.cookie('accessToken', accessToken, buildCookieOptions(expiresIn * 1000, Boolean(rememberMe)));

    res.cookie('refreshToken', refreshToken, buildCookieOptions(refreshTokenTTL * 1000, Boolean(rememberMe)));

    res.cookie('sessionId', sessionId, buildCookieOptions(refreshTokenTTL * 1000, Boolean(rememberMe)));

    const response = buildAuthResponse(user, accessToken, refreshToken, expiresIn, {
      id: sessionId,
      persistence: rememberMe ? 'local' : 'session',
    });

    // Add session enforcement info if applicable
    if (sessionEnforcement.enforced) {
      response.data.sessionEnforcement = sessionEnforcement;
    }

    return res.status(200).json(response);
  } catch (err) {
    logError(err, { controller: 'login' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Refresh access token
 */
const refreshToken = async (req, res) => {
  try {
    if (!req.user) {
      throw new AuthenticationError('User not found');
    }

    const sessionId = req.cookies?.sessionId;
    const activeSession = sessionId ? await sessionUtil.getSession(sessionId) : null;
    if (sessionId && !activeSession) {
      throw new AuthenticationError('Session expired');
    }

    // Generate new token pair
    const { accessToken: newAccessToken, refreshToken: newRefreshToken, expiresIn } = 
      jwtUtil.generateTokenPair({
        id: req.user.id,
        role: req.user.role,
      });

    // Update refresh token in Redis
    const refreshTokenTTL = jwtUtil.getTokenExpiryTime(process.env.JWT_REFRESH_EXPIRES_IN || '7d');
    await Promise.all([
      redisUtil.revokeRefreshToken(getRefreshTokenStorageKey({ sessionId, userId: req.user.id })),
      redisUtil.storeRefreshToken(
        getRefreshTokenStorageKey({ sessionId, userId: req.user.id }),
        newRefreshToken,
        refreshTokenTTL
      ),
    ]);

    const persistentSession = Boolean(activeSession?.persistent);

    // Set HTTP-only cookies for new tokens
    res.cookie('accessToken', newAccessToken, buildCookieOptions(expiresIn * 1000, persistentSession));

    res.cookie('refreshToken', newRefreshToken, buildCookieOptions(refreshTokenTTL * 1000, persistentSession));

    if (sessionId) {
      res.cookie('sessionId', sessionId, buildCookieOptions(refreshTokenTTL * 1000, persistentSession));
      await sessionUtil.updateSessionActivity(sessionId);
    }

    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn,
        session: sessionId
          ? {
            id: sessionId,
            persistence: persistentSession ? 'local' : 'session',
          }
          : null,
      },
    });
  } catch (err) {
    logError(err, { controller: 'refreshToken' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * User logout
 */
const logout = async (req, res) => {
  try {
    const sessionId = req.cookies?.sessionId || null;
    const refreshTokenValue = jwtUtil.extractRefreshTokenFromRequest(req);
    const accessTokenValue = jwtUtil.extractTokenFromRequest(req);

    let userId = req.user?.id || null;
    let auditUser = req.user || null;

    if (!userId && sessionId) {
      const session = await sessionUtil.getSession(sessionId);
      if (session?.userId) {
        userId = session.userId;
      }
    }

    if (!userId && refreshTokenValue) {
      userId = jwtUtil.decodeToken(refreshTokenValue)?.id || null;
    }

    if (!userId && accessTokenValue) {
      userId = jwtUtil.decodeToken(accessTokenValue)?.id || null;
    }

    if (sessionId) {
      await sessionUtil.terminateSession(sessionId);
    }

    if (userId) {
      await Promise.all([
        redisUtil.revokeRefreshToken(getRefreshTokenStorageKey({ sessionId, userId })),
        redisUtil.deleteSession(userId),
        redisUtil.invalidateUserCache(userId),
      ]);

      if (!auditUser) {
        const user = await User.findById(userId).select('email username fullName avatar role');
        if (user) {
          auditUser = {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            avatar: user.avatar,
            role: user.role,
          };
        }
      }

      if (auditUser) {
        await auditService.logAuthEvent(req, 'LOGOUT', {
          userId,
          email: auditUser.email,
          username: auditUser.username,
          status: 'SUCCESS',
          sessionId,
        });

        await logUserActivity(userId, 'logout', {
          label: 'Logged out',
        });
      }
    }

    // Clear cookies
    res.clearCookie('accessToken', buildCookieClearOptions());
    res.clearCookie('refreshToken', buildCookieClearOptions());
    res.clearCookie('sessionId', buildCookieClearOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    logError(err, { controller: 'logout' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    const summary = await getUserProfileSummary(req.user.id);
    if (!summary) {
      throw new NotFoundError('User profile');
    }

    return res.status(200).json({
      success: true,
      data: {
        accessToken: req.authRefreshedAccessToken || null,
        user: {
          ...summary.user,
          stats: summary.stats,
          socialProfile: {
            headline: summary.user.socialProfile?.headline || '',
            mentorBio: summary.user.socialProfile?.mentorBio || '',
            openToMentoring: Boolean(summary.user.socialProfile?.openToMentoring),
            openToCollaboration: summary.user.socialProfile?.openToCollaboration !== false,
          },
          profile: {
            bio: summary.user.bio || '',
            location: summary.user.location || '',
            skills: summary.user.skills || [],
            interests: summary.user.interests || [],
            learningGoals: summary.user.learningGoals || [],
            dailyStudyHours: summary.user.dailyStudyHours || '',
            currentRole: summary.user.currentRole || '',
            yearsOfExperience: summary.user.yearsOfExperience || '',
            targetRole: summary.user.targetRole || '',
            careerGoal: summary.user.careerGoal || '',
            profileType: summary.user.profileType || 'user',
            website: summary.user.website || '',
            phone: summary.user.phone || '',
          },
        },
      },
    });
  } catch (err) {
    logError(err, { controller: 'getMe' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get current user profile summary
 */
const getProfileSummary = async (req, res) => {
  try {
    const summary = await getUserProfileSummary(req.user.id);
    if (!summary) {
      throw new NotFoundError('User profile');
    }

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    logError(err, { controller: 'getProfileSummary' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get public user profile summary
 */
const getPublicProfileSummary = async (req, res) => {
  try {
    const summary = await getPublicUserProfileSummary(req.params.userId, req.user.id);
    if (!summary) {
      throw new NotFoundError('User profile');
    }

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (err) {
    logError(err, { controller: 'getPublicProfileSummary' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  getProfileSummary,
  getPublicProfileSummary,
};
