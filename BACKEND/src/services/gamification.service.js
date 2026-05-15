const User = require('../models/user.model');
const File = require('../models/file.model');
const DsaAttempt = require('../models/dsa-attempt.model');

const BADGE_DEFINITIONS = [
  {
    id: 'first-upload',
    title: 'First Upload',
    description: 'Share your first learning resource.',
    tone: 'violet',
    icon: 'Upload',
    requirement: { key: 'uploadsCount', target: 1 },
  },
  {
    id: 'resource-sharer',
    title: 'Resource Sharer',
    description: 'Upload 5 resources for the community.',
    tone: 'blue',
    icon: 'Library',
    requirement: { key: 'uploadsCount', target: 5 },
  },
  {
    id: 'community-reviewer',
    title: 'Community Reviewer',
    description: 'Write 3 helpful resource reviews.',
    tone: 'pink',
    icon: 'Review',
    requirement: { key: 'reviewsCount', target: 3 },
  },
  {
    id: 'point-builder',
    title: 'Point Builder',
    description: 'Earn 50 StudySphere points.',
    tone: 'emerald',
    icon: 'Spark',
    requirement: { key: 'points', target: 50 },
  },
  {
    id: 'consistent-learner',
    title: 'Consistent Learner',
    description: 'Maintain a 3 day streak.',
    tone: 'amber',
    icon: 'Flame',
    requirement: { key: 'streak', target: 3 },
  },
  {
    id: 'mastery-track',
    title: 'Mastery Track',
    description: 'Reach 150 points on your journey.',
    tone: 'sky',
    icon: 'Trophy',
    requirement: { key: 'points', target: 150 },
  },
  {
    id: 'comment-catalyst',
    title: 'Comment Catalyst',
    description: 'Leave 5 helpful comments or replies.',
    tone: 'rose',
    icon: 'Chat',
    requirement: { key: 'commentsCount', target: 5 },
  },
  {
    id: 'verified-contributor',
    title: 'Verified Contributor',
    description: 'Get 3 resources approved by moderators.',
    tone: 'emerald',
    icon: 'Shield',
    requirement: { key: 'approvedUploads', target: 3 },
  },
  {
    id: 'audience-pull',
    title: 'Audience Pull',
    description: 'Reach 25 total downloads across your uploads.',
    tone: 'amber',
    icon: 'ArrowUp',
    requirement: { key: 'totalDownloads', target: 25 },
  },
  {
    id: 'streak-guardian',
    title: 'Streak Guardian',
    description: 'Hold a 7 day learning streak.',
    tone: 'orange',
    icon: 'Flame',
    requirement: { key: 'streak', target: 7 },
  },
  {
    id: 'first-solve',
    title: 'First Solve',
    description: 'Solve your first DSA problem.',
    tone: 'sky',
    icon: 'Code',
    requirement: { key: 'solvedAttempts', target: 1 },
  },
  {
    id: 'problem-sprinter',
    title: 'Problem Sprinter',
    description: 'Solve 5 DSA problems.',
    tone: 'indigo',
    icon: 'Rocket',
    requirement: { key: 'solvedAttempts', target: 5 },
  },
  {
    id: 'precision-coder',
    title: 'Precision Coder',
    description: 'Submit 3 high-scoring attempts at 90% or above.',
    tone: 'cyan',
    icon: 'Target',
    requirement: { key: 'perfectAttempts', target: 3 },
  },
  {
    id: 'hard-mode',
    title: 'Hard Mode',
    description: 'Solve 2 hard DSA problems.',
    tone: 'rose',
    icon: 'Sword',
    requirement: { key: 'hardSolved', target: 2 },
  },
];

const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];

const getEarnedStreakFreezeCount = (points = 0) => {
  if (points >= 180) return 2;
  if (points >= 90) return 1;
  return 0;
};

const getUserMetrics = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const uploads = await File.find({ creator: user._id }).select('status downloads views');
  const dsaAttempts = await DsaAttempt.find({ user: user._id })
    .populate('problem', 'difficulty topic companyTags')
    .sort({ createdAt: -1 });
  const uploadsCount = uploads.length;
  const approvedUploads = uploads.filter((item) => item.status === 'approved').length;
  const totalDownloads = uploads.reduce((sum, item) => sum + Number(item.downloads || 0), 0);
  const totalViews = uploads.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const reviewsCount = await File.countDocuments({ 'reviews.user': user._id });
  const commentsCount = await File.countDocuments({
    $or: [{ 'comments.user': user._id }, { 'comments.replies.user': user._id }],
  });
  const solvedAttempts = dsaAttempts.filter((attempt) => attempt.status === 'solved').length;
  const attemptedProblems = new Set(dsaAttempts.map((attempt) => String(attempt.problem?._id || attempt.problem))).size;
  const solvedProblemIds = new Set(
    dsaAttempts
      .filter((attempt) => attempt.status === 'solved')
      .map((attempt) => String(attempt.problem?._id || attempt.problem))
  );
  const uniqueSolvedProblems = solvedProblemIds.size;
  const perfectAttempts = dsaAttempts.filter((attempt) => Number(attempt.scorePercent || 0) >= 90).length;
  const hardSolved = dsaAttempts.filter(
    (attempt) => attempt.status === 'solved' && attempt.problem?.difficulty === 'hard'
  ).length;
  const mediumSolved = dsaAttempts.filter(
    (attempt) => attempt.status === 'solved' && attempt.problem?.difficulty === 'medium'
  ).length;
  const averageScore = dsaAttempts.length
    ? Math.round(dsaAttempts.reduce((sum, attempt) => sum + Number(attempt.scorePercent || 0), 0) / dsaAttempts.length)
    : 0;
  const dsaTopicMap = {};
  dsaAttempts.forEach((attempt) => {
    const topic = attempt.problem?.topic || 'Core Patterns';
    if (!dsaTopicMap[topic]) {
      dsaTopicMap[topic] = {
        attempts: 0,
        solved: 0,
      };
    }
    dsaTopicMap[topic].attempts += 1;
    if (attempt.status === 'solved') {
      dsaTopicMap[topic].solved += 1;
    }
  });
  const strongestDsaTopic = Object.entries(dsaTopicMap)
    .sort((left, right) => {
      const leftScore = left[1].solved * 3 + left[1].attempts;
      const rightScore = right[1].solved * 3 + right[1].attempts;
      return rightScore - leftScore;
    })[0];

  return {
    user,
    uploadsCount,
    approvedUploads,
    totalDownloads,
    totalViews,
    reviewsCount,
    commentsCount,
    totalDsaAttempts: dsaAttempts.length,
    attemptedProblems,
    solvedAttempts,
    uniqueSolvedProblems,
    perfectAttempts,
    hardSolved,
    mediumSolved,
    averageScore,
    strongestDsaTopic: strongestDsaTopic
      ? {
        topic: strongestDsaTopic[0],
        attempts: strongestDsaTopic[1].attempts,
        solved: strongestDsaTopic[1].solved,
      }
      : null,
    points: user.stats?.points || 0,
    streak: user.stats?.streak || 0,
    longestStreak: user.stats?.longestStreak || 0,
    level: user.stats?.level || 'Beginner',
    streakFreezesUsed: Number(user.rewardInventory?.streakFreezesUsed || 0),
    streakFreezeArmed: Boolean(user.rewardInventory?.streakFreezeArmed),
    engagementScore:
      (user.stats?.points || 0) +
      approvedUploads * 8 +
      commentsCount * 3 +
      reviewsCount * 5 +
      totalDownloads +
      solvedAttempts * 6 +
      perfectAttempts * 4,
  };
};

const buildBadges = (metrics) => {
  return BADGE_DEFINITIONS.map((badge) => {
    const current = Number(metrics[badge.requirement.key] || 0);
    const progress = Math.min(100, Math.round((current / badge.requirement.target) * 100));
    return {
      ...badge,
      current,
      target: badge.requirement.target,
      earned: current >= badge.requirement.target,
      progress,
      tier:
        progress >= 100
          ? 'gold'
          : progress >= 70
            ? 'silver'
            : progress >= 35
              ? 'bronze'
              : 'locked',
    };
  });
};

const buildChallenges = (metrics) => {
  return [
    {
      id: 'weekly-upload',
      title: 'Upload Sprint',
      description: 'Upload 2 resources this week.',
      current: Math.min(metrics.uploadsCount, 2),
      target: 2,
      progress: Math.min(100, Math.round((Math.min(metrics.uploadsCount, 2) / 2) * 100)),
      reward: '+20 points',
      category: 'weekly',
      completed: metrics.uploadsCount >= 2,
    },
    {
      id: 'weekly-review',
      title: 'Review Streak',
      description: 'Write 2 community reviews.',
      current: Math.min(metrics.reviewsCount, 2),
      target: 2,
      progress: Math.min(100, Math.round((Math.min(metrics.reviewsCount, 2) / 2) * 100)),
      reward: '+12 points',
      category: 'weekly',
      completed: metrics.reviewsCount >= 2,
    },
    {
      id: 'focus-streak',
      title: 'Focus Streak',
      description: 'Maintain a 5 day learning streak.',
      current: Math.min(metrics.streak, 5),
      target: 5,
      progress: Math.min(100, Math.round((Math.min(metrics.streak, 5) / 5) * 100)),
      reward: 'Unlock Focus badge',
      category: 'consistency',
      completed: metrics.streak >= 5,
    },
    {
      id: 'community-reach',
      title: 'Community Reach',
      description: 'Earn 75 points through consistent participation.',
      current: Math.min(metrics.points, 75),
      target: 75,
      progress: Math.min(100, Math.round((Math.min(metrics.points, 75) / 75) * 100)),
      reward: 'Advanced tier progress',
      category: 'mastery',
      completed: metrics.points >= 75,
    },
    {
      id: 'solve-run',
      title: 'Solve Run',
      description: 'Solve 3 DSA problems this cycle.',
      current: Math.min(metrics.solvedAttempts, 3),
      target: 3,
      progress: Math.min(100, Math.round((Math.min(metrics.solvedAttempts, 3) / 3) * 100)),
      reward: '+18 points',
      category: 'dsa',
      completed: metrics.solvedAttempts >= 3,
    },
    {
      id: 'precision-run',
      title: 'Precision Run',
      description: 'Submit 2 attempts scoring 90% or higher.',
      current: Math.min(metrics.perfectAttempts, 2),
      target: 2,
      progress: Math.min(100, Math.round((Math.min(metrics.perfectAttempts, 2) / 2) * 100)),
      reward: 'Precision badge progress',
      category: 'dsa',
      completed: metrics.perfectAttempts >= 2,
    },
    {
      id: 'hard-ladder',
      title: 'Hard Ladder',
      description: 'Solve 1 hard DSA problem.',
      current: Math.min(metrics.hardSolved, 1),
      target: 1,
      progress: Math.min(100, Math.round((Math.min(metrics.hardSolved, 1) / 1) * 100)),
      reward: 'Hard Mode unlock',
      category: 'competition',
      completed: metrics.hardSolved >= 1,
    },
    {
      id: 'comment-chain',
      title: 'Discussion Chain',
      description: 'Add 4 helpful comments or replies this cycle.',
      current: Math.min(metrics.commentsCount, 4),
      target: 4,
      progress: Math.min(100, Math.round((Math.min(metrics.commentsCount, 4) / 4) * 100)),
      reward: '+10 points',
      category: 'community',
      completed: metrics.commentsCount >= 4,
    },
    {
      id: 'approval-race',
      title: 'Approval Race',
      description: 'Get 2 resources approved to enter the contributor cup.',
      current: Math.min(metrics.approvedUploads, 2),
      target: 2,
      progress: Math.min(100, Math.round((Math.min(metrics.approvedUploads, 2) / 2) * 100)),
      reward: 'Contributor Cup entry',
      category: 'competition',
      completed: metrics.approvedUploads >= 2,
    },
    {
      id: 'download-pulse',
      title: 'Download Pulse',
      description: 'Reach 15 downloads across your shared resources.',
      current: Math.min(metrics.totalDownloads, 15),
      target: 15,
      progress: Math.min(100, Math.round((Math.min(metrics.totalDownloads, 15) / 15) * 100)),
      reward: 'Audience badge progress',
      category: 'competition',
      completed: metrics.totalDownloads >= 15,
    },
  ];
};

const buildChallengeTracks = (challenges) => {
  const trackOrder = ['weekly', 'dsa', 'community', 'competition', 'consistency', 'mastery'];
  const labels = {
    weekly: 'Weekly missions',
    dsa: 'Problem solving lane',
    community: 'Community loop',
    competition: 'Competition ladder',
    consistency: 'Consistency loop',
    mastery: 'Mastery loop',
  };

  return trackOrder
    .map((category) => {
      const items = challenges.filter((challenge) => challenge.category === category);
      if (!items.length) {
        return null;
      }

      const completed = items.filter((item) => item.completed).length;
      return {
        id: category,
        title: labels[category] || category,
        progress: Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length),
        completed,
        total: items.length,
        items,
      };
    })
    .filter(Boolean);
};

const buildNextUnlocks = (badges) =>
  badges
    .filter((badge) => !badge.earned)
    .sort((left, right) => (right.progress - left.progress) || (left.target - left.current) - (right.target - right.current))
    .slice(0, 3)
    .map((badge) => ({
      id: badge.id,
      title: badge.title,
      description: badge.description,
      remaining: Math.max(0, badge.target - badge.current),
      unit: badge.requirement.key,
      progress: badge.progress,
      tier: badge.tier,
    }));

const buildFocusRewards = (metrics, nextUnlocks) => {
  const rewards = [];

  if (metrics.streak < 5) {
    rewards.push({
      id: 'streak-reward',
      title: 'Protect your streak',
      description: 'One more focused study day keeps your consistency reward moving.',
      route: '/dashboard',
      reason: `${metrics.streak} day streak right now with a 5 day consistency target.`,
    });
  }

  if (nextUnlocks[0]) {
    rewards.push({
      id: `unlock-${nextUnlocks[0].id}`,
      title: `Push for ${nextUnlocks[0].title}`,
      description: `You are ${nextUnlocks[0].remaining} step${nextUnlocks[0].remaining === 1 ? '' : 's'} away from the next unlock.`,
      route: '/leaderboard',
      reason: `${nextUnlocks[0].progress}% progress already completed.`,
    });
  }

  if (metrics.uploadsCount < 2) {
    rewards.push({
      id: 'upload-reward',
      title: 'Share one more resource',
      description: 'A quick upload is the fastest path to points and badge progress.',
      route: '/resources/upload',
      reason: `You currently have ${metrics.uploadsCount} upload${metrics.uploadsCount === 1 ? '' : 's'}.`,
    });
  }

  if (metrics.solvedAttempts < 3) {
    rewards.push({
      id: 'solve-reward',
      title: 'Lock in a solve streak',
      description: 'A few solved DSA attempts will accelerate both points and badge momentum.',
      route: '/dsa/practice',
      reason: `${metrics.solvedAttempts} solved attempt${metrics.solvedAttempts === 1 ? '' : 's'} recorded so far.`,
    });
  }

  return rewards.slice(0, 3);
};

const buildRewardLocker = (metrics, rank, percentile) => {
  const streakFreezes = Math.max(
    0,
    getEarnedStreakFreezeCount(metrics.points) - Number(metrics.streakFreezesUsed || 0)
  );
  const spotlightEntries = metrics.approvedUploads >= 4 ? 2 : metrics.approvedUploads >= 2 ? 1 : 0;
  const communityBoosts = metrics.commentsCount >= 6 ? 2 : metrics.commentsCount >= 3 ? 1 : 0;
  const problemTokens = metrics.solvedAttempts >= 8 ? 2 : metrics.solvedAttempts >= 4 ? 1 : 0;

  return {
    streakFreezes,
    streakFreezeArmed: Boolean(metrics.streakFreezeArmed),
    spotlightEntries,
    communityBoosts,
    problemTokens,
    nextReward: metrics.points < 90
      ? {
        title: 'First streak freeze',
        remaining: 90 - metrics.points,
        route: '/leaderboard',
      }
      : metrics.solvedAttempts < 4
        ? {
          title: 'First problem token',
          remaining: 4 - metrics.solvedAttempts,
          route: '/dsa/practice',
        }
      : metrics.approvedUploads < 4
        ? {
          title: 'Second spotlight entry',
          remaining: 4 - metrics.approvedUploads,
          route: '/resources/upload',
        }
        : {
          title: 'Master reward tier',
          remaining: Math.max(0, 250 - metrics.points),
          route: '/dashboard',
        },
    standingNote: rank
      ? `You are in the top ${percentile}% of active learners right now.`
      : 'Keep earning points to enter the ranked board.',
  };
};

const buildCompetitions = (metrics, rankSnapshot, challenges) => {
  const competitionChallenges = challenges.filter((item) => item.category === 'competition');
  const communityChallenges = challenges.filter((item) => item.category === 'community');
  const dsaChallenges = challenges.filter((item) => item.category === 'dsa');

  return [
    {
      id: 'contributor-cup',
      title: 'Contributor Cup',
      description: 'Resources approved and downloaded this cycle decide the cup table.',
      status: metrics.approvedUploads >= 2 ? 'Qualified' : 'Qualifying',
      progress: Math.min(100, Math.round(((metrics.approvedUploads * 20) + Math.min(metrics.totalDownloads, 20)) / 40 * 100)),
      route: '/resources/my-uploads',
      detail: `${metrics.approvedUploads} approved uploads | ${metrics.totalDownloads} downloads`,
    },
    {
      id: 'streak-clash',
      title: 'Streak Clash',
      description: 'Consistency is the fastest route to bonus rewards and better seeding.',
      status: metrics.streak >= 5 ? 'In form' : 'Building',
      progress: Math.min(100, Math.round((Math.min(metrics.streak, 7) / 7) * 100)),
      route: '/dashboard',
      detail: `${metrics.streak} day streak | freeze ${rankSnapshot.streakFreezeAvailable ? 'available' : 'locked'}`,
    },
    {
      id: 'problem-rush',
      title: 'Problem Rush',
      description: 'Solve fast and clean to hold your spot on the practice ladder.',
      status: metrics.solvedAttempts >= 5 ? 'Charging' : 'Starting',
      progress: dsaChallenges.length
        ? Math.round(dsaChallenges.reduce((sum, item) => sum + item.progress, 0) / dsaChallenges.length)
        : 0,
      route: '/dsa/practice',
      detail: `${metrics.solvedAttempts} solved | ${metrics.averageScore}% average score`,
    },
    {
      id: 'community-sprint',
      title: 'Community Sprint',
      description: 'Reviews and comments push you up the community engagement board.',
      status: communityChallenges.every((item) => item.completed) ? 'Leading' : 'Active',
      progress: communityChallenges.length
        ? Math.round(communityChallenges.reduce((sum, item) => sum + item.progress, 0) / communityChallenges.length)
        : 0,
      route: '/community',
      detail: `${metrics.reviewsCount} reviews | ${metrics.commentsCount} comments`,
    },
    {
      id: 'rank-chase',
      title: 'Rank Chase',
      description: 'Every mission completed improves your leaderboard seeding.',
      status: rankSnapshot.rank ? `Rank #${rankSnapshot.rank}` : 'Unranked',
      progress: competitionChallenges.length
        ? Math.round(competitionChallenges.reduce((sum, item) => sum + item.progress, 0) / competitionChallenges.length)
        : 0,
      route: '/leaderboard',
      detail: rankSnapshot.rank ? `Top ${rankSnapshot.percentile}% percentile` : 'Earn points to enter the board',
    },
  ];
};

const buildSeasonSnapshot = (metrics, challenges) => {
  const now = new Date();
  const monthLabel = now.toLocaleString('en-IN', { month: 'long' });
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysRemaining = Math.max(1, Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const completedChallenges = challenges.filter((item) => item.completed).length;

  return {
    label: `${monthLabel} Momentum Season`,
    focus: metrics.solvedAttempts >= 5
      ? 'Push deeper DSA consistency while keeping community momentum'
      : metrics.streak >= 5
        ? 'Consistency and community momentum'
        : 'Rebuild consistency and earn a freeze',
    daysRemaining,
    completionScore: Math.min(100, Math.round((metrics.engagementScore / 220) * 100)),
    completedChallenges,
    totalChallenges: challenges.length,
  };
};

const buildLeaderboardEntry = async (user) => {
  const uploadsCount = await File.countDocuments({ creator: user._id });

  return {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    avatar: user.avatar || (user.fullName || user.username || 'SS').slice(0, 2).toUpperCase(),
    points: user.stats?.points || 0,
    streak: user.stats?.streak || 0,
    longestStreak: user.stats?.longestStreak || 0,
    level: user.stats?.level || 'Beginner',
    uploadsCount,
    solvedCount: await DsaAttempt.countDocuments({ user: user._id, status: 'solved' }),
  };
};

const getGamificationSummary = async (userId) => {
  const metrics = await getUserMetrics(userId);
  if (!metrics) return null;

  const badges = buildBadges(metrics);
  const challenges = buildChallenges(metrics);
  const challengeTracks = buildChallengeTracks(challenges);
  const nextUnlocks = buildNextUnlocks(badges);
  const leaderboard = await getLeaderboard(100);
  const rankIndex = leaderboard.findIndex((entry) => String(entry.id) === String(userId));
  const rank = rankIndex >= 0 ? rankIndex + 1 : null;
  const percentile = leaderboard.length
    ? Math.max(1, Math.round(((leaderboard.length - (rank || leaderboard.length) + 1) / leaderboard.length) * 100))
    : 0;
  const nextLevelIndex = Math.min(LEVEL_ORDER.length - 1, LEVEL_ORDER.indexOf(metrics.level) + 1);
  const completedChallenges = challenges.filter((challenge) => challenge.completed).length;
  const weeklyMissions = challenges.filter((challenge) => challenge.category === 'weekly');
  const practiceMissions = challenges.filter((challenge) => challenge.category === 'dsa');
  const focusRewards = buildFocusRewards(metrics, nextUnlocks);
  const availableStreakFreezes = Math.max(
    0,
    getEarnedStreakFreezeCount(metrics.points) - Number(metrics.streakFreezesUsed || 0)
  );
  const rankSnapshot = {
    rank,
    percentile,
    leaderboardSize: leaderboard.length,
    completedChallenges,
    streakFreezeAvailable: availableStreakFreezes > 0,
    streakFreezeCount: availableStreakFreezes,
    streakFreezeArmed: Boolean(metrics.streakFreezeArmed),
  };
  const rewardLocker = buildRewardLocker(metrics, rank, percentile);
  const competitions = buildCompetitions(metrics, rankSnapshot, challenges);
  const season = buildSeasonSnapshot(metrics, challenges);
  const dsaLane = {
    solvedAttempts: metrics.solvedAttempts,
    uniqueSolvedProblems: metrics.uniqueSolvedProblems,
    averageScore: metrics.averageScore,
    perfectAttempts: metrics.perfectAttempts,
    strongestTopic: metrics.strongestDsaTopic,
  };

  return {
    profile: {
      id: metrics.user._id,
      fullName: metrics.user.fullName,
      username: metrics.user.username,
      role: metrics.user.role,
      avatar: metrics.user.avatar || (metrics.user.fullName || metrics.user.username || 'SS').slice(0, 2).toUpperCase(),
    },
    stats: {
      points: metrics.points,
      streak: metrics.streak,
      longestStreak: metrics.longestStreak,
      level: metrics.level,
      nextLevel: LEVEL_ORDER[nextLevelIndex],
      uploadsCount: metrics.uploadsCount,
      approvedUploads: metrics.approvedUploads,
      totalDownloads: metrics.totalDownloads,
      totalViews: metrics.totalViews,
      reviewsCount: metrics.reviewsCount,
      commentsCount: metrics.commentsCount,
      totalDsaAttempts: metrics.totalDsaAttempts,
      attemptedProblems: metrics.attemptedProblems,
      solvedAttempts: metrics.solvedAttempts,
      uniqueSolvedProblems: metrics.uniqueSolvedProblems,
      perfectAttempts: metrics.perfectAttempts,
      hardSolved: metrics.hardSolved,
      averageScore: metrics.averageScore,
      streakFreezesUsed: metrics.streakFreezesUsed,
    },
    badges,
    earnedBadges: badges.filter((badge) => badge.earned),
    challenges,
    challengeTracks,
    weeklyMissions,
    practiceMissions,
    nextUnlocks,
    focusRewards,
    rankSnapshot,
    rewardLocker,
    competitions,
    season,
    dsaLane,
    momentum: {
      engagementScore: metrics.engagementScore,
      approvalRate: metrics.uploadsCount ? Math.round((metrics.approvedUploads / metrics.uploadsCount) * 100) : 0,
      downloadVelocity: metrics.totalDownloads,
      dsaAccuracy: metrics.averageScore,
      strongestTrack: [...challengeTracks].sort((left, right) => right.progress - left.progress)[0] || null,
    },
    milestones: [
      { label: 'Points to next level', value: metrics.level === 'Master' ? 0 : Math.max(0, { Beginner: 25, Intermediate: 75, Advanced: 150, Expert: 250 }[metrics.level] - metrics.points) },
      { label: 'Uploads to next badge', value: Math.max(0, 5 - metrics.uploadsCount) },
      { label: 'Reviews to next badge', value: Math.max(0, 3 - metrics.reviewsCount) },
      { label: 'Solved attempts to next DSA badge', value: Math.max(0, 5 - metrics.solvedAttempts) },
      { label: 'Approved uploads to contributor cup', value: Math.max(0, 2 - metrics.approvedUploads) },
    ],
  };
};

const getLeaderboard = async (limit = 15) => {
  const users = await User.find({ isActive: true })
    .sort({ 'stats.points': -1, 'stats.streak': -1, createdAt: 1 })
    .limit(limit);

  const entries = await Promise.all(users.map((user) => buildLeaderboardEntry(user)));

  return entries.map((entry, index) => ({
    rank: index + 1,
    ...entry,
  }));
};

const activateStreakFreeze = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    return { ok: false, status: 404, message: 'User not found.' };
  }

  const available = Math.max(
    0,
    getEarnedStreakFreezeCount(user.stats?.points || 0) - Number(user.rewardInventory?.streakFreezesUsed || 0)
  );

  if (available <= 0) {
    return { ok: false, status: 400, message: 'No streak freeze is available yet.' };
  }

  if (user.rewardInventory?.streakFreezeArmed) {
    return { ok: true, status: 200, message: 'Your streak freeze is already armed.' };
  }

  user.rewardInventory.streakFreezeArmed = true;
  user.rewardInventory.lastFreezeArmedAt = new Date();
  await user.save();

  return { ok: true, status: 200, message: 'Streak freeze armed for your next missed day.' };
};

module.exports = {
  getGamificationSummary,
  getLeaderboard,
  BADGE_DEFINITIONS,
  activateStreakFreeze,
};
