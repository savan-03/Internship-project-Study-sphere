// src/routes/profile.routes.js

const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const profileController = require('../controllers/profile.controller');

// ─── Profile Endpoints ───────────────────────────────────────────────────────

// Get my complete profile (private)
router.get('/me', authenticate, profileController.getMyProfile);

// Get user's public profile
router.get('/:userId', profileController.getPublicProfile);

// Update my profile
router.patch('/me', authenticate, profileController.updateMyProfile);

// Update my social profile
router.patch('/me/social', authenticate, profileController.updateSocialProfile);

// Get my profile statistics
router.get('/me/stats', authenticate, profileController.getMyStats);

// Get user's statistics
router.get('/:userId/stats', profileController.getUserStats);

// ─── Skill Endpoints ─────────────────────────────────────────────────────────

// Add a skill to my profile
router.post('/me/skills', authenticate, profileController.addSkill);

// Get my skills
router.get('/me/skills', authenticate, profileController.getMySkills);

// Get user's skills
router.get('/:userId/skills', profileController.getUserSkills);

// Remove a skill
router.delete('/me/skills/:skill', authenticate, profileController.removeSkill);

// Endorse a user's skill
router.post('/:userId/skills/:skill/endorse', authenticate, profileController.endorseSkill);

// Remove skill endorsement
router.delete('/:userId/skills/:skill/endorse', authenticate, profileController.removeEndorsement);

// ─── Badge Endpoints ────────────────────────────────────────────────────────

// Get my badges
router.get('/me/badges', authenticate, profileController.getMyBadges);

// Get user's badges
router.get('/:userId/badges', profileController.getUserBadges);

// ─── Follow Endpoints ───────────────────────────────────────────────────────

// Follow a user
router.post('/:userId/follow', authenticate, profileController.followUser);

// Unfollow a user
router.delete('/:userId/follow', authenticate, profileController.unfollowUser);

// Get user's followers
router.get('/:userId/followers', profileController.getFollowers);

// Get user's following list
router.get('/:userId/following', profileController.getFollowing);

// ─── Discovery Endpoints ────────────────────────────────────────────────────

// Get similar users
router.get('/me/similar', authenticate, profileController.getSimilarUsers);

// Get activity feed
router.get('/me/activity', authenticate, profileController.getActivityFeed);

// Get top users (leaderboard)
router.get('/leaderboard/top', profileController.getTopUsers);

// Search users
router.get('/search/users', profileController.searchUsers);

module.exports = router;
