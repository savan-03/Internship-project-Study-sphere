const User = require('../models/user.model');
const File = require('../models/file.model');

const POINT_MAP = {
  register: 10,
  login: 2,
  profile_update: 5,
  resource_upload: 15,
  bookmark_added: 3,
  collection_created: 5,
  collection_add_resource: 2,
  review_added: 8,
  comment_added: 4,
  reply_added: 2,
  resource_approved: 10,
  social_group_created: 8,
  social_group_joined: 3,
  social_group_post: 2,
  social_thread_created: 6,
  social_thread_reply: 3,
  social_thread_upvote: 1,
  social_followed_user: 2,
  social_mentorship_requested: 5,
  social_mentorship_accepted: 4,
};

const normalizeDate = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const resolveLevel = (points = 0) => {
  if (points >= 250) return 'Master';
  if (points >= 150) return 'Expert';
  if (points >= 75) return 'Advanced';
  if (points >= 25) return 'Intermediate';
  return 'Beginner';
};

const getEarnedStreakFreezeCount = (points = 0) => {
  if (points >= 180) return 2;
  if (points >= 90) return 1;
  return 0;
};

const logUserActivity = async (userId, action, options = {}) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const pointsAwarded =
    typeof options.pointsAwarded === 'number'
      ? options.pointsAwarded
      : POINT_MAP[action] || 0;

  const now = new Date();
  const today = normalizeDate(now);
  const lastActiveDay = user.lastActiveAt ? normalizeDate(user.lastActiveAt) : null;

  if (!lastActiveDay) {
    user.stats.streak = 1;
  } else {
    const diffInDays = Math.round((today - lastActiveDay) / 86400000);
    const earnedStreakFreezes = getEarnedStreakFreezeCount(user.stats?.points || 0);
    const usedStreakFreezes = Number(user.rewardInventory?.streakFreezesUsed || 0);
    const streakFreezeAvailable = earnedStreakFreezes > usedStreakFreezes;
    const streakFreezeArmed = Boolean(user.rewardInventory?.streakFreezeArmed);

    if (diffInDays === 1) {
      user.stats.streak += 1;
    } else if (diffInDays === 2 && streakFreezeArmed && streakFreezeAvailable) {
      user.rewardInventory.streakFreezesUsed = usedStreakFreezes + 1;
      user.rewardInventory.streakFreezeArmed = false;
    } else if (diffInDays > 1) {
      user.stats.streak = 1;
      user.rewardInventory.streakFreezeArmed = false;
    }
  }

  user.lastActiveAt = now;
  user.stats.longestStreak = Math.max(user.stats.longestStreak || 0, user.stats.streak || 0);
  user.stats.points = (user.stats.points || 0) + pointsAwarded;
  user.stats.level = resolveLevel(user.stats.points);
  user.activityLog.unshift({
    action,
    label: options.label || action.replace(/_/g, ' '),
    metadata: options.metadata || {},
    pointsAwarded,
  });
  user.activityLog = user.activityLog.slice(0, 50);

  await user.save();
  return user;
};

const buildUserAchievements = ({ uploadsCount = 0, reviewsCount = 0, points = 0, streak = 0 }) => {
  const achievements = [];

  if (uploadsCount >= 1) achievements.push({ id: 'first-upload', title: 'First Upload', tone: 'violet' });
  if (uploadsCount >= 5) achievements.push({ id: 'resource-sharer', title: 'Resource Sharer', tone: 'blue' });
  if (reviewsCount >= 3) achievements.push({ id: 'community-reviewer', title: 'Community Reviewer', tone: 'pink' });
  if (points >= 50) achievements.push({ id: 'point-builder', title: 'Point Builder', tone: 'emerald' });
  if (streak >= 3) achievements.push({ id: 'consistent-learner', title: 'Consistent Learner', tone: 'amber' });

  if (achievements.length === 0) {
    achievements.push({ id: 'getting-started', title: 'Getting Started', tone: 'slate' });
  }

  return achievements;
};

const buildProfileSummary = async (user, options = {}) => {
  if (!user) return null;
  const { publicView = false, viewerId = null } = options;

  const uploads = await File.find(
    publicView ? { creator: user._id, status: 'approved' } : { creator: user._id }
  )
    .sort({ createdAt: -1 })
    .select('title description type category status createdAt updatedAt views downloads');

  const uploadsCount = uploads.length;
  const approvedUploads = uploads.filter((item) => item.status === 'approved').length;
  const pendingUploads = uploads.filter((item) => item.status === 'pending').length;
  const rejectedUploads = uploads.filter((item) => item.status === 'rejected').length;
  const totalViews = uploads.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const totalDownloads = uploads.reduce((sum, item) => sum + Number(item.downloads || 0), 0);

  const reviewsCount = await File.countDocuments({ 'reviews.user': user._id });
  const commentsCount = await File.countDocuments({ 'comments.user': user._id });
  const achievements = buildUserAchievements({
    uploadsCount,
    reviewsCount,
    points: user.stats?.points || 0,
    streak: user.stats?.streak || 0,
  });

  return {
    user: {
      ...user.toSafeObject(),
      socialCounts: {
        following: user.followingUsers?.length || 0,
        followers: user.followerUsers?.length || 0,
      },
      isViewer:
        viewerId && String(viewerId) === String(user._id),
    },
    stats: {
      ...(user.stats || {}),
      uploadsCount,
      approvedUploads,
      pendingUploads: publicView ? 0 : pendingUploads,
      rejectedUploads: publicView ? 0 : rejectedUploads,
      totalViews,
      totalDownloads,
      reviewsCount,
      commentsCount,
      bookmarksCount: publicView ? undefined : user.bookmarkedResources?.length || 0,
      collectionsCount: publicView ? undefined : user.resourceCollections?.length || 0,
    },
    uploads: uploads.map((item) => ({
      id: item._id,
      title: item.title,
      description: item.description,
      type: item.type,
      category: item.category,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      views: item.views,
      downloads: item.downloads,
    })),
    activity: (user.activityLog || []).map((entry) => ({
      id: entry._id,
      action: entry.action,
      label: entry.label,
      pointsAwarded: entry.pointsAwarded,
      metadata: entry.metadata || {},
      createdAt: entry.createdAt,
    })),
    achievements,
  };
};

const getUserProfileSummary = async (userId) => {
  const user = await User.findById(userId);
  return buildProfileSummary(user, { viewerId: userId });
};

const getPublicUserProfileSummary = async (userId, viewerId = null) => {
  const user = await User.findById(userId).select(
    'fullName username role avatar website bio location skills interests learningGoals dailyStudyHours currentRole yearsOfExperience targetRole careerGoal profileType profileSetupCompleted stats socialProfile followingUsers followerUsers createdAt updatedAt'
  );
  return buildProfileSummary(user, {
    publicView: true,
    viewerId,
  });
};

module.exports = {
  logUserActivity,
  getUserProfileSummary,
  getPublicUserProfileSummary,
  resolveLevel,
};
