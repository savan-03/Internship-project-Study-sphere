// src/services/profile.service.js

const User = require('../models/user.model');
const SkillEndorsement = require('../models/skill-endorsement.model');
const { UserBadge } = require('../models/badge.model');
const { NotFoundError, ValidationError } = require('../utils/errors.util');

/**
 * Get user's complete profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('followingUsers', 'username avatar fullName')
    .populate('followerUsers', 'username avatar fullName')
    .select('-password -__v');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const skills = await SkillEndorsement.getUserSkills(userId);
  const badges = await UserBadge.getUserBadges(userId);
  const profileStats = await getProfileStats(userId);

  return {
    ...user.toObject(),
    skills,
    badges,
    stats: profileStats,
  };
};

/**
 * Get public profile (limited information)
 */
const getPublicProfile = async (userId) => {
  const user = await User.findById(userId)
    .populate('followingUsers', 'username avatar fullName')
    .populate('followerUsers', 'username avatar fullName')
    .select('fullName username avatar bio location website skills interests stats socialProfile currentRole yearsOfExperience targetRole');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const skills = await SkillEndorsement.getUserSkills(userId);
  const badges = await UserBadge.getUserBadges(userId);
  const followerCount = user.followerUsers.length;
  const followingCount = user.followingUsers.length;

  return {
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    avatar: user.avatar,
    bio: user.bio,
    location: user.location,
    website: user.website,
    skills: skills.map(s => s.skill),
    interests: user.interests,
    currentRole: user.currentRole,
    yearsOfExperience: user.yearsOfExperience,
    targetRole: user.targetRole,
    socialProfile: user.socialProfile,
    stats: {
      points: user.stats.points,
      streak: user.stats.streak,
      level: user.stats.level,
    },
    followerCount,
    followingCount,
    badgeCount: badges.length,
    skillCount: skills.length,
  };
};

/**
 * Update user profile
 */
const updateUserProfile = async (userId, updates) => {
  const allowedFields = [
    'fullName',
    'bio',
    'avatar',
    'website',
    'phone',
    'location',
    'interests',
    'learningGoals',
    'dailyStudyHours',
    'currentRole',
    'yearsOfExperience',
    'targetRole',
    'careerGoal',
    'profileSetupCompleted',
  ];

  const filteredUpdates = {};
  allowedFields.forEach(field => {
    if (field in updates) {
      filteredUpdates[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  }).select('-password -__v');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update user profile with social information
 */
const updateSocialProfile = async (userId, socialData) => {
  const allowedFields = ['headline', 'mentorBio', 'openToMentoring', 'openToCollaboration'];

  const filteredUpdates = { socialProfile: {} };
  allowedFields.forEach(field => {
    if (field in socialData) {
      filteredUpdates.socialProfile[field] = socialData[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Update notification preferences
 */
const updateNotificationPreferences = async (userId, preferences) => {
  const allowedFields = ['inApp', 'email', 'push'];

  const filteredUpdates = { notificationPreferences: {} };
  allowedFields.forEach(field => {
    if (field in preferences) {
      filteredUpdates.notificationPreferences[field] = preferences[field];
    }
  });

  // Handle category preferences
  if (preferences.categories) {
    filteredUpdates.notificationPreferences.categories = preferences.categories;
  }

  const user = await User.findByIdAndUpdate(userId, filteredUpdates, {
    new: true,
  }).select('notificationPreferences');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

/**
 * Get profile statistics
 */
const getProfileStats = async (userId) => {
  const user = await User.findById(userId).select('stats');
  const skillCount = await SkillEndorsement.countDocuments({ userId });
  const badgeCount = await UserBadge.countDocuments({ userId });
  const followerCount = await User.findById(userId).select('followerUsers').then(u => u.followerUsers.length);

  return {
    ...user.stats.toObject(),
    skillCount,
    badgeCount,
    followerCount,
  };
};

/**
 * Follow a user
 */
const followUser = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ValidationError('Cannot follow yourself');
  }

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if already following
  if (user.followingUsers.includes(targetUserId)) {
    throw new ValidationError('Already following this user');
  }

  // Add to following list
  user.followingUsers.push(targetUserId);
  targetUser.followerUsers.push(userId);

  await Promise.all([user.save(), targetUser.save()]);

  return {
    message: 'User followed successfully',
    following: true,
  };
};

/**
 * Unfollow a user
 */
const unfollowUser = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ValidationError('Cannot unfollow yourself');
  }

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if following
  if (!user.followingUsers.includes(targetUserId)) {
    throw new ValidationError('Not following this user');
  }

  // Remove from following list
  user.followingUsers = user.followingUsers.filter(id => id.toString() !== targetUserId.toString());
  targetUser.followerUsers = targetUser.followerUsers.filter(id => id.toString() !== userId.toString());

  await Promise.all([user.save(), targetUser.save()]);

  return {
    message: 'User unfollowed successfully',
    following: false,
  };
};

/**
 * Check if user is following another user
 */
const isFollowing = async (userId, targetUserId) => {
  const user = await User.findById(userId).select('followingUsers');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user.followingUsers.includes(targetUserId);
};

/**
 * Get user's followers
 */
const getUserFollowers = async (userId, limit = 50, skip = 0) => {
  const user = await User.findById(userId)
    .select('followerUsers')
    .populate({
      path: 'followerUsers',
      select: 'username avatar fullName stats',
      options: { limit, skip },
    });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const totalFollowers = user.followerUsers.length;

  return {
    followers: user.followerUsers,
    total: totalFollowers,
    limit,
    skip,
  };
};

/**
 * Get user's following list
 */
const getUserFollowing = async (userId, limit = 50, skip = 0) => {
  const user = await User.findById(userId)
    .select('followingUsers')
    .populate({
      path: 'followingUsers',
      select: 'username avatar fullName stats',
      options: { limit, skip },
    });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const totalFollowing = user.followingUsers.length;

  return {
    following: user.followingUsers,
    total: totalFollowing,
    limit,
    skip,
  };
};

/**
 * Get similar users (based on interests and skills)
 */
const getSimilarUsers = async (userId, limit = 10) => {
  const user = await User.findById(userId).select('interests skills');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const similarUsers = await User.find({
    _id: { $ne: userId },
    $or: [
      { interests: { $in: user.interests } },
      { skills: { $in: user.skills } },
    ],
  })
    .select('username avatar fullName stats interests skills')
    .limit(limit);

  return similarUsers;
};

/**
 * Get user's activity feed
 */
const getUserActivityFeed = async (userId, limit = 50, skip = 0) => {
  const user = await User.findById(userId).select('activityLog');

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const activities = user.activityLog
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(skip, skip + limit);

  return {
    activities,
    total: user.activityLog.length,
    limit,
    skip,
  };
};

/**
 * Get top users (by points)
 */
const getTopUsers = async (limit = 10, skip = 0) => {
  const users = await User.find({ isActive: true })
    .select('fullName username avatar stats')
    .sort({ 'stats.points': -1 })
    .limit(limit)
    .skip(skip);

  const total = await User.countDocuments({ isActive: true });

  return {
    users,
    total,
    limit,
    skip,
  };
};

/**
 * Search users
 */
const searchUsers = async (query, limit = 20, skip = 0) => {
  const users = await User.find({
    $or: [
      { fullName: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { skills: { $in: [new RegExp(query, 'i')] } },
    ],
  })
    .select('fullName username avatar bio skills stats')
    .limit(limit)
    .skip(skip);

  const total = await User.countDocuments({
    $or: [
      { fullName: { $regex: query, $options: 'i' } },
      { username: { $regex: query, $options: 'i' } },
      { bio: { $regex: query, $options: 'i' } },
      { skills: { $in: [new RegExp(query, 'i')] } },
    ],
  });

  return {
    users,
    total,
    limit,
    skip,
  };
};

module.exports = {
  getUserProfile,
  getPublicProfile,
  updateUserProfile,
  updateSocialProfile,
  updateNotificationPreferences,
  getProfileStats,
  followUser,
  unfollowUser,
  isFollowing,
  getUserFollowers,
  getUserFollowing,
  getSimilarUsers,
  getUserActivityFeed,
  getTopUsers,
  searchUsers,
};
