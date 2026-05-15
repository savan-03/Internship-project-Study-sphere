// src/config/passport.config.js

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/user.model');
const jwtUtil = require('../utils/jwt.util');

/**
 * Local Strategy (Email + Password)
 */
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
          return done(null, false, {
            message: 'User not found',
          });
        }

        if (!user.isActive) {
          return done(null, false, {
            message: 'Account has been deactivated',
          });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          return done(null, false, {
            message: 'Invalid password',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * Google OAuth Strategy
 */
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/oauth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Enrich profile with tokens
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        profile.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        return done(null, profile);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * GitHub OAuth Strategy
 */
passport.use(
  'github',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/api/oauth/github/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // Enrich profile with tokens
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;
        // GitHub tokens don't expire by default
        profile.tokenExpiry = null;

        return done(null, profile);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * JWT Strategy (for API token validation)
 */
passport.use(
  'jwt',
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerFormat(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
      algorithms: ['HS256'],
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        if (!user || !user.isActive) {
          return done(null, false, {
            message: 'User not found or inactive',
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/**
 * Serialize user
 */
passport.serializeUser((user, done) => {
  done(null, user.id || user._id);
});

/**
 * Deserialize user
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
