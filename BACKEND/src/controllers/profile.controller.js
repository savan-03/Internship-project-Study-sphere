// src/controllers/profile.controller.js

const profileService = require('../services/profile.service');
const SkillEndorsement = require('../models/skill-endorsement.model');
const { UserBadge } = require('../models/badge.model');
const { formatErrorResponse } = require('../utils/errors.util');
const { logError } = require('../utils/helpers');

/**
 * Get user's complete profile (private)
 */
const getMyProfile = async (req, res) => {
  try {
    const profile = await profileService.getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    logError(err, { controller: 'getMyProfile' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get public profile of a user
 */
const getPublicProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await profileService.getPublicProfile(userId);

    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (err) {
    logError(err, { controller: 'getPublicProfile' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update my profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const updatedProfile = await profileService.updateUserProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile,
    });
  } catch (err) {
    logError(err, { controller: 'updateMyProfile' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Update my social profile
 */
const updateSocialProfile = async (req, res) => {
  try {
    const updatedProfile = await profileService.updateSocialProfile(req.user.id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Social profile updated successfully',
      data: updatedProfile,
    });
  } catch (err) {
    logError(err, { controller: 'updateSocialProfile' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get my profile statistics
 */
const getMyStats = async (req, res) => {
  try {
    const stats = await profileService.getProfileStats(req.user.id);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    logError(err, { controller: 'getMyStats' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await profileService.getProfileStats(userId);

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    logError(err, { controller: 'getUserStats' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Add skill to profile
 */
const addSkill = async (req, res) => {
  try {
    const { skill, proficiency, yearsOfExperience, category } = req.body;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required',
      });
    }

    const existingSkill = await SkillEndorsement.findOne({
      userId: req.user.id,
      skill: skill.toLowerCase(),
    });

    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists',
      });
    }

    const skillEndorsement = await SkillEndorsement.create({
      userId: req.user.id,
      skill: skill.toLowerCase(),
      proficiency: proficiency || 'Intermediate',
      yearsOfExperience: yearsOfExperience || 0,
      category: category || 'Technical',
    });

    return res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: skillEndorsement,
    });
  } catch (err) {
    logError(err, { controller: 'addSkill' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get my skills
 */
const getMySkills = async (req, res) => {
  try {
    const { sort = 'endorsementCount' } = req.query;

    const skills = await SkillEndorsement.getUserSkills(req.user.id, sort);

    return res.status(200).json({
      success: true,
      data: {
        skills,
        total: skills.length,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getMySkills' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get user's skills
 */
const getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sort = 'endorsementCount' } = req.query;

    const skills = await SkillEndorsement.getUserSkills(userId, sort);

    return res.status(200).json({
      success: true,
      data: {
        skills,
        total: skills.length,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getUserSkills' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Remove skill
 */
const removeSkill = async (req, res) => {
  try {
    const { skill } = req.params;

    const result = await SkillEndorsement.deleteOne({
      userId: req.user.id,
      skill: skill.toLowerCase(),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Skill removed successfully',
    });
  } catch (err) {
    logError(err, { controller: 'removeSkill' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Endorse a skill
 */
const endorseSkill = async (req, res) => {
  try {
    const { userId, skill } = req.params;

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot endorse your own skill',
      });
    }

    await SkillEndorsement.addEndorsement(userId, skill, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Skill endorsed successfully',
    });
  } catch (err) {
    logError(err, { controller: 'endorseSkill' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Remove endorsement
 */
const removeEndorsement = async (req, res) => {
  try {
    const { userId, skill } = req.params;

    await SkillEndorsement.removeEndorsement(userId, skill, req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Endorsement removed successfully',
    });
  } catch (err) {
    logError(err, { controller: 'removeEndorsement' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get my badges
 */
const getMyBadges = async (req, res) => {
  try {
    const badges = await UserBadge.getUserBadges(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        badges,
        total: badges.length,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getMyBadges' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get user's badges
 */
const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const badges = await UserBadge.getUserBadges(userId);

    return res.status(200).json({
      success: true,
      data: {
        badges,
        total: badges.length,
      },
    });
  } catch (err) {
    logError(err, { controller: 'getUserBadges' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Follow a user
 */
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await profileService.followUser(req.user.id, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    logError(err, { controller: 'followUser' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await profileService.unfollowUser(req.user.id, userId);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    logError(err, { controller: 'unfollowUser' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get followers
 */
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const result = await profileService.getUserFollowers(userId, parseInt(limit), parseInt(skip));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logError(err, { controller: 'getFollowers' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get following list
 */
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const result = await profileService.getUserFollowing(userId, parseInt(limit), parseInt(skip));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logError(err, { controller: 'getFollowing' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get similar users
 */
const getSimilarUsers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const users = await profileService.getSimilarUsers(req.user.id, parseInt(limit));

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    logError(err, { controller: 'getSimilarUsers' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get activity feed
 */
const getActivityFeed = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const result = await profileService.getUserActivityFeed(req.user.id, parseInt(limit), parseInt(skip));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logError(err, { controller: 'getActivityFeed' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Get top users
 */
const getTopUsers = async (req, res) => {
  try {
    const { limit = 10, skip = 0 } = req.query;

    const result = await profileService.getTopUsers(parseInt(limit), parseInt(skip));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logError(err, { controller: 'getTopUsers' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

/**
 * Search users
 */
const searchUsers = async (req, res) => {
  try {
    const { q, limit = 20, skip = 0 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const result = await profileService.searchUsers(q, parseInt(limit), parseInt(skip));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    logError(err, { controller: 'searchUsers' });
    const { statusCode, body } = formatErrorResponse(err);
    return res.status(statusCode).json(body);
  }
};

module.exports = {
  getMyProfile,
  getPublicProfile,
  updateMyProfile,
  updateSocialProfile,
  getMyStats,
  getUserStats,
  addSkill,
  getMySkills,
  getUserSkills,
  removeSkill,
  endorseSkill,
  removeEndorsement,
  getMyBadges,
  getUserBadges,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSimilarUsers,
  getActivityFeed,
  getTopUsers,
  searchUsers,
};
