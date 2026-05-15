const User = require('../models/user.model');
const File = require('../models/file.model');
const DsaAttempt = require('../models/dsa-attempt.model');
const AiSession = require('../models/ai-session.model');
const CommunityGroup = require('../models/community-group.model');
const ForumThread = require('../models/forum-thread.model');
const MentorshipRequest = require('../models/mentorship-request.model');

const monthLabel = (date) =>
  new Date(date).toLocaleDateString('en-IN', { month: 'short' });

const dayLabel = (date) =>
  new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

const weekdayLabel = (date) =>
  new Date(date).toLocaleDateString('en-IN', { weekday: 'short' });

const timestampLabel = (date = new Date()) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const buildMonthBuckets = (count = 6) => {
  const now = new Date();
  const buckets = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: monthLabel(date),
      start: new Date(date.getFullYear(), date.getMonth(), 1),
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
    });
  }
  return buckets;
};

const buildDayBuckets = (count = 14) => {
  const now = new Date();
  const buckets = [];
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - index);
    date.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setDate(date.getDate() + 1);
    buckets.push({
      key: date.toISOString().slice(0, 10),
      label: dayLabel(date),
      start: date,
      end,
    });
  }
  return buckets;
};

const toBucketMap = (buckets) =>
  Object.fromEntries(buckets.map((bucket) => [bucket.key, 0]));

const monthKeyForDate = (date) => {
  const value = new Date(date);
  return `${value.getFullYear()}-${value.getMonth()}`;
};

const dayKeyForDate = (date) => {
  const value = new Date(date);
  return value.toISOString().slice(0, 10);
};

const average = (values = [], digits = 1) => {
  if (!values.length) return 0;
  return Number(
    (values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length).toFixed(digits)
  );
};

const percent = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

const idString = (value) => String(value?._id || value?.id || value || '');

const calculateAverageRating = (resources) => {
  const ratings = resources.flatMap((resource) =>
    (resource.reviews || []).map((review) => Number(review.rating || 0))
  );
  return average(ratings, 1);
};

const calculateModerationTurnaround = (resources = []) => {
  const durations = resources
    .map((resource) => {
      const resolvedEntry = (resource.moderationHistory || []).find((entry) =>
        ['approved', 'rejected'].includes(entry.action)
      );
      if (!resolvedEntry?.createdAt || !resource.createdAt) return null;
      const diff = new Date(resolvedEntry.createdAt) - new Date(resource.createdAt);
      if (Number.isNaN(diff) || diff < 0) return null;
      return diff / 86400000;
    })
    .filter((value) => value !== null);

  return average(durations, 1);
};

const buildProfileCompletion = (user) => {
  const checklist = [
    { label: 'Name', done: Boolean(user.fullName) },
    { label: 'Username', done: Boolean(user.username) },
    { label: 'Email', done: Boolean(user.email) },
    { label: 'Target Role', done: Boolean(user.targetRole) },
    { label: 'Bio', done: Boolean(user.bio) },
    { label: 'Skills', done: (user.skills || []).length > 0 },
    { label: 'Interests', done: (user.interests || []).length > 0 },
    { label: 'Learning Goals', done: (user.learningGoals || []).length > 0 },
  ];

  const completedSteps = checklist.filter((item) => item.done).length;
  return {
    completedSteps,
    totalSteps: checklist.length,
    percent: percent(completedSteps, checklist.length),
    missing: checklist.filter((item) => !item.done).map((item) => item.label),
  };
};

const summarizeActivityActions = (activityLog = []) => {
  const actionMap = {};
  activityLog.forEach((entry) => {
    actionMap[entry.action] = (actionMap[entry.action] || 0) + 1;
  });
  return Object.entries(actionMap)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value);
};

const pushUnique = (set, value) => {
  const next = idString(value);
  if (next) set.add(next);
};

const buildWeekdayMap = () => ({
  Mon: 0,
  Tue: 0,
  Wed: 0,
  Thu: 0,
  Fri: 0,
  Sat: 0,
  Sun: 0,
});

const buildUserAnalyticsReport = ({
  overview,
  weakAreas = [],
  strongAreas = [],
  focusAlerts = [],
  recommendations = [],
  weeklySummary = [],
  goalAlignment = null,
  studyHabits = null,
}) => {
  const solvedDelta = weeklySummary.find((item) => item.label === 'Solved problems')?.delta || 0;
  const attemptsDelta = weeklySummary.find((item) => item.label === 'Practice attempts')?.delta || 0;
  const leadWeakArea = weakAreas[0];
  const leadStrongArea = strongAreas[0];
  const topRisk = focusAlerts.find((item) => ['risk', 'warning'].includes(item.tone));

  return {
    headline:
      solvedDelta > 0
        ? `You solved ${solvedDelta} more problem${solvedDelta === 1 ? '' : 's'} than last week.`
        : attemptsDelta > 0
          ? `Practice volume is climbing with ${attemptsDelta} more attempt${attemptsDelta === 1 ? '' : 's'} this week.`
          : `Your current readiness sits at ${overview.profileCompletion}% profile completion and ${overview.averageDsaScore}% average DSA score.`,
    pulse: {
      consistency: studyHabits?.consistencyScore || 0,
      activeDays: overview.activeDaysLast14 || 0,
      solvedProblems: overview.solvedProblems || 0,
      alignment: goalAlignment?.score || 0,
    },
    wins: [
      leadStrongArea
        ? `${leadStrongArea.label} is your strongest repeat topic at ${leadStrongArea.averageScore}% average score.`
        : null,
      overview.aiSessions
        ? `You already created ${overview.aiSessions} AI session${overview.aiSessions === 1 ? '' : 's'}, so recommendations can keep improving.`
        : null,
      overview.totalDownloads
        ? `Your resources generated ${overview.totalDownloads} download${overview.totalDownloads === 1 ? '' : 's'} so far.`
        : null,
    ].filter(Boolean),
    risks: [
      topRisk?.detail || null,
      leadWeakArea
        ? `${leadWeakArea.label} is still the biggest weak area with a ${leadWeakArea.solvedRate}% solve rate.`
        : null,
      overview.activeDaysLast14 < 5
        ? `You were active on only ${overview.activeDaysLast14} of the last 14 days, so consistency needs attention.`
        : null,
    ].filter(Boolean),
    nextSteps: recommendations.slice(0, 4),
  };
};

const buildAdminAnalyticsReport = ({
  overview,
  featureAdoption = [],
  moderationInsights = [],
  learnerHealth = [],
  topicDemand = [],
  recentPlatformActivity = [],
}) => {
  const topAdoption = featureAdoption.slice().sort((left, right) => right.percentage - left.percentage)[0];
  const lowestAdoption = featureAdoption.slice().sort((left, right) => left.percentage - right.percentage)[0];
  const approvalRate = moderationInsights.find((item) => item.label === 'Approval Rate')?.value || '0%';
  const pendingQueue = moderationInsights.find((item) => item.label === 'Pending Queue')?.value || 0;
  const dormantUsers = learnerHealth.find((item) => item.label === 'Dormant Users')?.value || 0;
  const topTopic = topicDemand[0];

  return {
    headline:
      overview.monthlyGrowth > 0
        ? `Platform growth is up ${overview.monthlyGrowth}% month over month with ${overview.totalUsers} total learners.`
        : `The platform currently serves ${overview.totalUsers} learners across resources, DSA, AI, and community modules.`,
    strengths: [
      topAdoption ? `${topAdoption.label} leads adoption at ${topAdoption.percentage}% of users.` : null,
      topTopic ? `${topTopic.label} is the most in-demand DSA topic with ${topTopic.attempts} attempts.` : null,
      `Moderation is clearing content at an approval rate of ${approvalRate}.`,
    ].filter(Boolean),
    risks: [
      lowestAdoption ? `${lowestAdoption.label} is the weakest-adopted feature at ${lowestAdoption.percentage}% and needs better visibility.` : null,
      Number(pendingQueue) > 0 ? `${pendingQueue} resource${Number(pendingQueue) === 1 ? ' is' : 's are'} still waiting in the moderation queue.` : null,
      Number(dormantUsers) > 0 ? `${dormantUsers} learner${Number(dormantUsers) === 1 ? ' looks' : 's look'} dormant and may need re-engagement.` : null,
    ].filter(Boolean),
    nextSteps: [
      topAdoption ? `Use ${topAdoption.label} as the benchmark UX for lower-adoption modules.` : null,
      Number(pendingQueue) > 0 ? 'Clear the pending moderation queue to reduce contributor friction.' : null,
      recentPlatformActivity[0] ? `Review the latest ${recentPlatformActivity[0].type} activity to spot manual follow-up needs.` : null,
    ].filter(Boolean),
  };
};

const buildCertificateReadiness = ({
  profileCompletionPercent = 0,
  solvedProblems = 0,
  activeDaysLast14 = 0,
  averageDsaScore = 0,
  completedAiSessions = 0,
  learningGoalsCount = 0,
  readinessScore = 0,
}) => {
  const criteria = [
    { label: 'Profile completion', current: profileCompletionPercent, target: 75, unit: '%', route: '/profile/setup' },
    { label: 'Solved DSA problems', current: solvedProblems, target: 20, unit: '', route: '/dsa' },
    { label: 'Active days in last 14', current: activeDaysLast14, target: 7, unit: '', route: '/analytics' },
    { label: 'Average DSA score', current: averageDsaScore, target: 60, unit: '%', route: '/dsa/attempts' },
    { label: 'Completed AI practice sessions', current: completedAiSessions, target: 3, unit: '', route: '/ai' },
    { label: 'Learning goals defined', current: learningGoalsCount, target: 1, unit: '', route: '/profile/setup' },
  ];

  const progressItems = criteria.map((item) => ({
    ...item,
    met: Number(item.current || 0) >= Number(item.target || 0),
    progress: Math.min(
      100,
      item.target ? Math.round((Number(item.current || 0) / Number(item.target || 1)) * 100) : 0
    ),
  }));

  const achievedCriteria = progressItems.filter((item) => item.met);
  const remainingCriteria = progressItems.filter((item) => !item.met);
  const readinessPercent = Math.round(
    progressItems.reduce((sum, item) => sum + item.progress, 0) / progressItems.length
  );
  const ready = remainingCriteria.length === 0;
  const primaryGap = remainingCriteria
    .slice()
    .sort((left, right) => left.progress - right.progress)[0];

  return {
    certificateName: 'StudySphere Momentum Certificate',
    ready,
    readinessPercent,
    statusLabel: ready
      ? 'Ready to unlock'
      : readinessPercent >= 75
        ? 'Almost there'
        : readinessPercent >= 45
          ? 'In progress'
          : 'Early build',
    summary: ready
      ? 'You have enough consistency, DSA progress, and AI activity to qualify for the StudySphere Momentum Certificate.'
      : primaryGap
        ? `${primaryGap.label} is the biggest gap before this certificate is ready.`
        : 'Keep building steady activity to unlock certificate readiness.',
    readinessScore: Math.round((readinessPercent + Number(readinessScore || 0)) / 2),
    achievedCriteria: achievedCriteria.map((item) => ({
      label: item.label,
      current: item.current,
      target: item.target,
      unit: item.unit,
    })),
    remainingCriteria: remainingCriteria.map((item) => ({
      label: item.label,
      current: item.current,
      target: item.target,
      unit: item.unit,
      route: item.route,
      progress: item.progress,
    })),
    nextRoute: primaryGap?.route || '/analytics',
  };
};

const buildUserAnalyticsExportMarkdown = (analytics, user) => {
  const lines = [
    '# StudySphere Analytics Report',
    '',
    `Generated: ${timestampLabel()}`,
    `Learner: ${user?.fullName || user?.username || 'StudySphere User'}`,
    `Username: @${user?.username || 'learner'}`,
    '',
    '## Overview',
    `- Points: ${analytics.overview?.points || 0}`,
    `- Level: ${analytics.overview?.level || 'Beginner'}`,
    `- Readiness Score: ${analytics.overview?.readinessScore || 0}%`,
    `- Solved Problems: ${analytics.overview?.solvedProblems || 0}`,
    `- Total Attempts: ${analytics.overview?.attemptsCount || 0}`,
    `- Average DSA Score: ${analytics.overview?.averageDsaScore || 0}%`,
    `- Estimated Study Hours: ${analytics.overview?.estimatedStudyHours || 0}`,
    `- Active Days (Last 14): ${analytics.overview?.activeDaysLast14 || 0}/14`,
    `- AI Sessions: ${analytics.overview?.aiSessions || 0}`,
    `- Profile Completion: ${analytics.overview?.profileCompletion || 0}%`,
    '',
    '## Analytics Brief',
    analytics.report?.headline || 'No analytics brief available yet.',
    '',
    '## Wins',
    ...((analytics.report?.wins || []).length ? analytics.report.wins.map((item) => `- ${item}`) : ['- No major wins recorded yet.']),
    '',
    '## Risks',
    ...((analytics.report?.risks || []).length ? analytics.report.risks.map((item) => `- ${item}`) : ['- No urgent risk signals right now.']),
    '',
    '## Priority Board',
    ...((analytics.priorityBoard || []).length ? analytics.priorityBoard.map((item) => `- ${item.title}: ${item.detail}`) : ['- No immediate priority actions right now.']),
    '',
    '## Weak Areas',
    ...((analytics.weakAreas || []).length
      ? analytics.weakAreas.map((item) => `- ${item.label}: ${item.averageScore}% avg score, ${item.solvedRate}% solved`)
      : ['- No repeat weak areas yet.']),
    '',
    '## Strong Areas',
    ...((analytics.strongAreas || []).length
      ? analytics.strongAreas.map((item) => `- ${item.label}: ${item.averageScore}% avg score, ${item.solvedRate}% solved`)
      : ['- Strong areas will appear after more practice.']),
    '',
    '## Goal Tracking',
    ...((analytics.goalsProgress || []).map((item) => `- ${item.label}: ${item.progress}% (${item.current}; target: ${item.target})`)),
    '',
    '## Milestone Progress',
    ...((analytics.milestoneProgress || []).map((item) => `- ${item.label}: ${item.progress}% (${item.current}/${item.target})`)),
    '',
    '## Certificate Readiness',
    `- Certificate: ${analytics.certificateReadiness?.certificateName || 'StudySphere Momentum Certificate'}`,
    `- Status: ${analytics.certificateReadiness?.statusLabel || 'Tracking'}`,
    `- Readiness: ${analytics.certificateReadiness?.readinessPercent || 0}%`,
    `- Summary: ${analytics.certificateReadiness?.summary || 'No certificate summary yet.'}`,
    ...((analytics.certificateReadiness?.remainingCriteria || []).length
      ? analytics.certificateReadiness.remainingCriteria.map((item) => `- Remaining: ${item.label} (${item.current}/${item.target}${item.unit || ''})`)
      : ['- All certificate criteria are met.']),
    '',
    '## Next Steps',
    ...((analytics.report?.nextSteps || []).length ? analytics.report.nextSteps.map((item) => `- ${item}`) : ['- Keep studying to generate next-step recommendations.']),
  ];

  return lines.join('\n');
};

const buildAdminAnalyticsExportMarkdown = (analytics) => {
  const lines = [
    '# StudySphere Admin Analytics Report',
    '',
    `Generated: ${timestampLabel()}`,
    '',
    '## Platform Overview',
    `- Total Users: ${analytics.overview?.totalUsers || 0}`,
    `- Total Resources: ${analytics.overview?.totalResources || 0}`,
    `- Active Users: ${analytics.overview?.activeUsers || 0}`,
    `- Pending Resources: ${analytics.overview?.pendingResources || 0}`,
    `- DSA Attempts: ${analytics.overview?.totalDsaAttempts || 0}`,
    `- AI Sessions: ${analytics.overview?.aiSessions || 0}`,
    `- Community Groups: ${analytics.overview?.communityGroups || 0}`,
    `- Forum Threads: ${analytics.overview?.forumThreads || 0}`,
    `- Mentorship Requests: ${analytics.overview?.mentorshipRequests || 0}`,
    `- Monthly Growth: ${analytics.overview?.monthlyGrowth || 0}%`,
    '',
    '## Platform Brief',
    analytics.report?.headline || 'No platform headline available yet.',
    '',
    '## Strengths',
    ...((analytics.report?.strengths || []).length ? analytics.report.strengths.map((item) => `- ${item}`) : ['- No strengths summary available.']),
    '',
    '## Risks',
    ...((analytics.report?.risks || []).length ? analytics.report.risks.map((item) => `- ${item}`) : ['- No major risk signals right now.']),
    '',
    '## Feature Adoption',
    ...((analytics.featureAdoption || []).map((item) => `- ${item.label}: ${item.percentage}% (${item.summary})`)),
    '',
    '## Moderation Insights',
    ...((analytics.moderationInsights || []).map((item) => `- ${item.label}: ${item.value}`)),
    '',
    '## Learner Health',
    ...((analytics.learnerHealth || []).map((item) => `- ${item.label}: ${item.value}`)),
    '',
    '## Topic Demand',
    ...((analytics.topicDemand || []).slice(0, 8).map((item) => `- ${item.label}: ${item.attempts} attempts, ${item.solvedRate}% solved`)),
    '',
    '## Next Steps',
    ...((analytics.report?.nextSteps || []).length ? analytics.report.nextSteps.map((item) => `- ${item}`) : ['- No admin next steps available yet.']),
  ];

  return lines.join('\n');
};

const buildUserAnalytics = async (userId) => {
  const [user, uploads, attempts, aiSessions, groups, threads, mentorships, peerUsers, peerAttempts, peerUploads] = await Promise.all([
    User.findById(userId),
    File.find({ creator: userId }).sort({ createdAt: -1 }),
    DsaAttempt.find({ user: userId })
      .populate({ path: 'problem', select: 'title topic category difficulty estimatedMinutes companyTags' })
      .sort({ createdAt: -1 }),
    AiSession.find({ user: userId }).sort({ createdAt: -1 }),
    CommunityGroup.find({
      $or: [{ owner: userId }, { members: userId }, { 'posts.author': userId }],
    }).sort({ createdAt: -1 }),
    ForumThread.find({
      $or: [{ author: userId }, { 'replies.author': userId }],
    }).sort({ createdAt: -1 }),
    MentorshipRequest.find({
      $or: [{ requester: userId }, { mentor: userId }],
    }).sort({ createdAt: -1 }),
    User.find().select('stats fullName username email targetRole bio skills interests learningGoals'),
    DsaAttempt.find().select('user status scorePercent'),
    File.find().select('creator'),
  ]);

  if (!user) return null;

  const monthBuckets = buildMonthBuckets();
  const uploadsMap = toBucketMap(monthBuckets);
  const viewsMap = toBucketMap(monthBuckets);
  const downloadsMap = toBucketMap(monthBuckets);
  const pointsMap = toBucketMap(monthBuckets);
  const attemptsMap = toBucketMap(monthBuckets);
  const solvedMap = toBucketMap(monthBuckets);
  const avgScoreMap = toBucketMap(monthBuckets);
  const aiMap = toBucketMap(monthBuckets);

  uploads.forEach((resource) => {
    const key = monthKeyForDate(resource.createdAt);
    if (uploadsMap[key] !== undefined) {
      uploadsMap[key] += 1;
      viewsMap[key] += Number(resource.views || 0);
      downloadsMap[key] += Number(resource.downloads || 0);
    }
  });

  (user.activityLog || []).forEach((entry) => {
    const key = monthKeyForDate(entry.createdAt);
    if (pointsMap[key] !== undefined) {
      pointsMap[key] += Number(entry.pointsAwarded || 0);
    }
  });

  attempts.forEach((attempt) => {
    const key = monthKeyForDate(attempt.createdAt);
    if (attemptsMap[key] !== undefined) {
      attemptsMap[key] += 1;
      solvedMap[key] += attempt.status === 'solved' ? 1 : 0;
      avgScoreMap[key] += Number(attempt.scorePercent || 0);
    }
  });

  aiSessions.forEach((session) => {
    const key = monthKeyForDate(session.createdAt);
    if (aiMap[key] !== undefined) {
      aiMap[key] += 1;
    }
  });

  const progressSeries = monthBuckets.map((bucket) => ({
    label: bucket.label,
    points: pointsMap[bucket.key],
    attempts: attemptsMap[bucket.key],
    solved: solvedMap[bucket.key],
    aiSessions: aiMap[bucket.key],
    averageScore: attemptsMap[bucket.key]
      ? Number((avgScoreMap[bucket.key] / attemptsMap[bucket.key]).toFixed(1))
      : 0,
  }));

  const contributionSeries = monthBuckets.map((bucket) => ({
    label: bucket.label,
    uploads: uploadsMap[bucket.key],
    views: viewsMap[bucket.key],
    downloads: downloadsMap[bucket.key],
  }));

  const categoryCount = {};
  uploads.forEach((resource) => {
    const label = resource.category || 'General';
    categoryCount[label] = (categoryCount[label] || 0) + 1;
  });

  const topicMap = {};
  const difficultyMap = {
    easy: { label: 'Easy', attempts: 0, solved: 0, scoreTotal: 0 },
    medium: { label: 'Medium', attempts: 0, solved: 0, scoreTotal: 0 },
    hard: { label: 'Hard', attempts: 0, solved: 0, scoreTotal: 0 },
  };
  const languageMap = {};
  const topicTimeMap = {};
  const companyTagMap = {};
  const weekdayActivityMap = buildWeekdayMap();
  const solvedProblemIds = new Set();
  let estimatedStudyMinutes = 0;

  attempts.forEach((attempt) => {
    const problem = attempt.problem || {};
    const topic = problem.topic || problem.category || 'General';
    const difficulty = problem.difficulty || 'medium';
    const language = attempt.language || 'javascript';

    if (!topicMap[topic]) {
      topicMap[topic] = { label: topic, attempts: 0, solved: 0, scoreTotal: 0 };
    }
    topicMap[topic].attempts += 1;
    topicMap[topic].solved += attempt.status === 'solved' ? 1 : 0;
    topicMap[topic].scoreTotal += Number(attempt.scorePercent || 0);

    if (!difficultyMap[difficulty]) {
      difficultyMap[difficulty] = { label: difficulty, attempts: 0, solved: 0, scoreTotal: 0 };
    }
    difficultyMap[difficulty].attempts += 1;
    difficultyMap[difficulty].solved += attempt.status === 'solved' ? 1 : 0;
    difficultyMap[difficulty].scoreTotal += Number(attempt.scorePercent || 0);

    if (!languageMap[language]) {
      languageMap[language] = { label: language, attempts: 0, solved: 0, scoreTotal: 0 };
    }
    languageMap[language].attempts += 1;
    languageMap[language].solved += attempt.status === 'solved' ? 1 : 0;
    languageMap[language].scoreTotal += Number(attempt.scorePercent || 0);

    if (!topicTimeMap[topic]) {
      topicTimeMap[topic] = { label: topic, minutes: 0, attempts: 0 };
    }

    const estimatedMinutes = Math.max(10, Number(problem.estimatedMinutes || 20));
    const weightedMinutes = estimatedMinutes * (attempt.status === 'solved' ? 1 : 0.6);
    topicTimeMap[topic].minutes += weightedMinutes;
    topicTimeMap[topic].attempts += 1;

    (problem.companyTags || []).forEach((tag) => {
      if (!companyTagMap[tag]) {
        companyTagMap[tag] = { label: tag, attempts: 0, solved: 0 };
      }
      companyTagMap[tag].attempts += 1;
      companyTagMap[tag].solved += attempt.status === 'solved' ? 1 : 0;
    });

    const weekday = weekdayLabel(attempt.createdAt);
    if (weekdayActivityMap[weekday] !== undefined) {
      weekdayActivityMap[weekday] += 1;
    }

    if (attempt.status === 'solved') {
      solvedProblemIds.add(idString(problem));
    }

    estimatedStudyMinutes += weightedMinutes;
  });

  const topicPerformance = Object.values(topicMap)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solved: item.solved,
      solvedRate: percent(item.solved, item.attempts),
      averageScore: item.attempts ? Number((item.scoreTotal / item.attempts).toFixed(1)) : 0,
    }))
    .sort((left, right) => (right.attempts - left.attempts) || (left.averageScore - right.averageScore));

  const difficultyBreakdown = Object.values(difficultyMap)
    .filter((item) => item.attempts > 0)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solved: item.solved,
      solvedRate: percent(item.solved, item.attempts),
      averageScore: item.attempts ? Number((item.scoreTotal / item.attempts).toFixed(1)) : 0,
    }));

  const languageBreakdown = Object.values(languageMap)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solved: item.solved,
      solvedRate: percent(item.solved, item.attempts),
      averageScore: item.attempts ? Number((item.scoreTotal / item.attempts).toFixed(1)) : 0,
    }))
    .sort((left, right) => right.attempts - left.attempts);

  const dayBuckets = buildDayBuckets();
  const heatActivityMap = toBucketMap(dayBuckets);
  const heatPointsMap = toBucketMap(dayBuckets);
  const heatAttemptsMap = toBucketMap(dayBuckets);

  (user.activityLog || []).forEach((entry) => {
    const key = dayKeyForDate(entry.createdAt);
    if (heatActivityMap[key] !== undefined) {
      heatActivityMap[key] += 1;
      heatPointsMap[key] += Number(entry.pointsAwarded || 0);
    }

    const weekday = weekdayLabel(entry.createdAt);
    if (weekdayActivityMap[weekday] !== undefined) {
      weekdayActivityMap[weekday] += 1;
    }
  });

  attempts.forEach((attempt) => {
    const key = dayKeyForDate(attempt.createdAt);
    if (heatActivityMap[key] !== undefined) {
      heatActivityMap[key] += 1;
      heatAttemptsMap[key] += 1;
    }
  });

  aiSessions.forEach((session) => {
    const key = dayKeyForDate(session.createdAt);
    if (heatActivityMap[key] !== undefined) {
      heatActivityMap[key] += 1;
    }

    const weekday = weekdayLabel(session.createdAt);
    if (weekdayActivityMap[weekday] !== undefined) {
      weekdayActivityMap[weekday] += 1;
    }
  });

  const activityHeatmap = dayBuckets.map((bucket) => ({
    date: bucket.key,
    label: bucket.label,
    activityCount: heatActivityMap[bucket.key],
    points: heatPointsMap[bucket.key],
    attempts: heatAttemptsMap[bucket.key],
  }));

  const activeDaysLast14 = activityHeatmap.filter((item) => item.activityCount > 0).length;

  const timeByTopic = Object.values(topicTimeMap)
    .map((item) => ({
      label: item.label,
      minutes: Math.round(item.minutes),
      hours: Number((item.minutes / 60).toFixed(1)),
      attempts: item.attempts,
    }))
    .sort((left, right) => right.minutes - left.minutes)
    .slice(0, 6);

  const companyReadiness = Object.values(companyTagMap)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solvedRate: percent(item.solved, item.attempts),
    }))
    .sort((left, right) => right.attempts - left.attempts)
    .slice(0, 5);

  const weekdayPattern = Object.entries(weekdayActivityMap)
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(left.label) - ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(right.label));

  const strongestTopic = topicPerformance
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => (right.averageScore - left.averageScore) || (right.solvedRate - left.solvedRate))[0];

  const weakAreas = topicPerformance
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => (left.averageScore - right.averageScore) || (left.solvedRate - right.solvedRate))
    .slice(0, 4);

  const strongAreas = topicPerformance
    .filter((item) => item.attempts >= 2)
    .sort((left, right) => (right.averageScore - left.averageScore) || (right.solvedRate - left.solvedRate))
    .slice(0, 4);

  const assistantSessions = aiSessions.filter((session) => session.type === 'assistant');
  const quizSessions = aiSessions.filter((session) => session.type === 'quiz');
  const interviewSessions = aiSessions.filter((session) => session.type === 'interview');
  const completedQuizSessions = quizSessions.filter((session) => session.status === 'completed');
  const completedInterviewSessions = interviewSessions.filter((session) => session.status === 'completed');
  const totalAssistantMessages = assistantSessions.reduce(
    (sum, session) => sum + (session.messages || []).length,
    0
  );

  const groupPostsCount = groups.reduce(
    (sum, group) => sum + (group.posts || []).filter((post) => idString(post.author) === String(userId)).length,
    0
  );
  const forumThreadsAuthored = threads.filter((thread) => idString(thread.author) === String(userId));
  const forumRepliesCount = threads.reduce(
    (sum, thread) => sum + (thread.replies || []).filter((reply) => idString(reply.author) === String(userId)).length,
    0
  );
  const mentorshipRequested = mentorships.filter((item) => idString(item.requester) === String(userId)).length;
  const mentorshipAccepted = mentorships.filter(
    (item) => idString(item.mentor) === String(userId) && item.status === 'accepted'
  ).length;

  const approvedUploads = uploads.filter((item) => item.status === 'approved').length;
  const pendingUploads = uploads.filter((item) => item.status === 'pending').length;
  const rejectedUploads = uploads.filter((item) => item.status === 'rejected').length;
  const totalViews = uploads.reduce((sum, item) => sum + Number(item.views || 0), 0);
  const totalDownloads = uploads.reduce((sum, item) => sum + Number(item.downloads || 0), 0);
  const reviewsCount = await File.countDocuments({ 'reviews.user': user._id });
  const commentsCount = await File.countDocuments({
    $or: [{ 'comments.user': user._id }, { 'comments.replies.user': user._id }],
  });

  const resourceCategoryEngagementMap = {};
  uploads.forEach((resource) => {
    const label = resource.category || 'General';
    if (!resourceCategoryEngagementMap[label]) {
      resourceCategoryEngagementMap[label] = {
        label,
        uploads: 0,
        views: 0,
        downloads: 0,
      };
    }
    resourceCategoryEngagementMap[label].uploads += 1;
    resourceCategoryEngagementMap[label].views += Number(resource.views || 0);
    resourceCategoryEngagementMap[label].downloads += Number(resource.downloads || 0);
  });

  const resourceImpact = Object.values(resourceCategoryEngagementMap)
    .map((item) => ({
      ...item,
      engagementScore: item.views + item.downloads * 2,
    }))
    .sort((left, right) => right.engagementScore - left.engagementScore)
    .slice(0, 6);

  const profileCompletion = buildProfileCompletion(user);
  const topResources = uploads
    .slice()
    .sort(
      (left, right) =>
        Number(right.downloads || 0) +
          Number(right.views || 0) -
        (Number(left.downloads || 0) + Number(left.views || 0))
    )
    .slice(0, 5)
    .map((resource) => ({
      id: resource._id,
      title: resource.title,
      category: resource.category,
      status: resource.status,
      views: Number(resource.views || 0),
      downloads: Number(resource.downloads || 0),
      rating: resource.reviews?.length
        ? Number(
            (
              resource.reviews.reduce(
                (sum, review) => sum + Number(review.rating || 0),
                0
              ) / resource.reviews.length
            ).toFixed(1)
          )
        : 0,
    }));

  const recommendations = [];
  const weakestTopic = weakAreas[0];

  if (weakestTopic) {
    recommendations.push(`Spend one focused practice session on ${weakestTopic.label}; it currently has your lowest average DSA score.`);
  }
  if ((user.learningGoals || []).length === 0) {
    recommendations.push('Add learning goals in your profile so analytics can reflect a clearer study direction.');
  }
  if (activeDaysLast14 < 5) {
    recommendations.push('Your recent consistency dipped. Aim for short study check-ins on at least 5 days over the next two weeks.');
  }
  if (!completedQuizSessions.length) {
    recommendations.push('Try an AI quiz to add assessment data and reveal weak areas beyond coding practice.');
  }
  if (pendingUploads > 0) {
    recommendations.push('Review your pending uploads and strengthen descriptions or notes so they can clear moderation faster.');
  }

  const goalKeywords = [
    ...(user.learningGoals || []),
    ...(user.interests || []),
    ...(user.skills || []),
    user.targetRole || '',
  ]
    .flatMap((value) => String(value || '').split(/[,\s/]+/))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const alignedTopics = topicPerformance.filter((item) =>
    goalKeywords.some((keyword) => item.label.toLowerCase().includes(keyword))
  );
  const alignedResources = Object.values(categoryCount).length
    ? Object.entries(categoryCount).filter(([label]) =>
        goalKeywords.some((keyword) => String(label).toLowerCase().includes(keyword))
      ).length
    : 0;

  const goalAlignment = {
    alignedTopics: alignedTopics.slice(0, 4).map((item) => item.label),
    alignedTopicCount: alignedTopics.length,
    alignedResourceCategories: alignedResources,
    score: Math.min(
      100,
      alignedTopics.length * 20 +
        alignedResources * 10 +
        Math.min(30, (user.learningGoals || []).length * 10)
    ),
    message: alignedTopics.length
      ? `Your recent practice is aligning with ${alignedTopics.slice(0, 2).map((item) => item.label).join(' and ')}.`
      : 'Your goals and your recent study activity are not strongly aligned yet.',
  };

  const mostActiveWeekday =
    weekdayPattern.slice().sort((left, right) => right.value - left.value)[0]?.label || 'Mon';
  const averageSessionsPerActiveDay = activeDaysLast14
    ? Number((activityHeatmap.reduce((sum, item) => sum + item.activityCount, 0) / activeDaysLast14).toFixed(1))
    : 0;

  const studyHabits = {
    mostActiveWeekday,
    activeDaysLast14,
    averageSessionsPerActiveDay,
    strongestTopic: strongestTopic?.label || 'Not enough data',
    weakestTopic: weakestTopic?.label || 'Not enough data',
    momentum: 'Tracking',
    consistencyScore: Math.min(100, Math.round((activeDaysLast14 / 14) * 100)),
  };

  const milestoneProgress = [
    {
      label: 'Consistency milestone',
      current: activeDaysLast14,
      target: 10,
      progress: Math.min(100, percent(activeDaysLast14, 10)),
      detail: 'Be active on 10 of the last 14 days.',
    },
    {
      label: 'Problem solving milestone',
      current: solvedProblemIds.size,
      target: 25,
      progress: Math.min(100, percent(solvedProblemIds.size, 25)),
      detail: 'Reach 25 solved DSA problems.',
    },
    {
      label: 'Contribution milestone',
      current: approvedUploads,
      target: 5,
      progress: Math.min(100, percent(approvedUploads, 5)),
      detail: 'Publish 5 approved learning resources.',
    },
    {
      label: 'AI practice milestone',
      current: completedQuizSessions.length + completedInterviewSessions.length,
      target: 8,
      progress: Math.min(100, percent(completedQuizSessions.length + completedInterviewSessions.length, 8)),
      detail: 'Complete 8 AI quiz/interview sessions.',
    },
  ];

  const recentWins = [
    solvedProblemIds.size > 0
      ? {
          title: `${solvedProblemIds.size} solved problem${solvedProblemIds.size === 1 ? '' : 's'}`,
          detail: 'You are building real coding momentum.',
        }
      : null,
    approvedUploads > 0
      ? {
          title: `${approvedUploads} approved resource${approvedUploads === 1 ? '' : 's'}`,
          detail: 'Your contributions are reaching other learners.',
        }
      : null,
    completedQuizSessions.length > 0
      ? {
          title: `${completedQuizSessions.length} completed AI quiz${completedQuizSessions.length === 1 ? '' : 'zes'}`,
          detail: 'You have assessment data to guide your next steps.',
        }
      : null,
    Number(user.stats?.streak || 0) > 0
      ? {
        title: `${user.stats?.streak || 0}-day streak`,
          detail: 'Consistency is one of your strongest growth signals right now.',
        }
      : null,
  ].filter(Boolean);

  const now = Date.now();
  const withinDays = (value, days) => {
    if (!value) return false;
    return now - new Date(value).getTime() <= days * 86400000;
  };

  const currentWeek = {
    uploads: uploads.filter((item) => withinDays(item.createdAt, 7)).length,
    attempts: attempts.filter((item) => withinDays(item.createdAt, 7)).length,
    solved: attempts.filter((item) => withinDays(item.createdAt, 7) && item.status === 'solved').length,
    aiSessions: aiSessions.filter((item) => withinDays(item.createdAt, 7)).length,
    points: (user.activityLog || [])
      .filter((entry) => withinDays(entry.createdAt, 7))
      .reduce((sum, entry) => sum + Number(entry.pointsAwarded || 0), 0),
  };
  const previousWeek = {
    uploads: uploads.filter((item) => {
      const diff = now - new Date(item.createdAt).getTime();
      return diff > 7 * 86400000 && diff <= 14 * 86400000;
    }).length,
    attempts: attempts.filter((item) => {
      const diff = now - new Date(item.createdAt).getTime();
      return diff > 7 * 86400000 && diff <= 14 * 86400000;
    }).length,
    solved: attempts.filter((item) => {
      const diff = now - new Date(item.createdAt).getTime();
      return diff > 7 * 86400000 && diff <= 14 * 86400000 && item.status === 'solved';
    }).length,
    aiSessions: aiSessions.filter((item) => {
      const diff = now - new Date(item.createdAt).getTime();
      return diff > 7 * 86400000 && diff <= 14 * 86400000;
    }).length,
    points: (user.activityLog || [])
      .filter((entry) => {
        const diff = now - new Date(entry.createdAt).getTime();
        return diff > 7 * 86400000 && diff <= 14 * 86400000;
      })
      .reduce((sum, entry) => sum + Number(entry.pointsAwarded || 0), 0),
  };

  studyHabits.momentum =
    currentWeek.attempts + currentWeek.aiSessions >= previousWeek.attempts + previousWeek.aiSessions
      ? 'Improving'
      : 'Needs attention';

  const weeklySummary = [
    {
      label: 'Practice attempts',
      current: currentWeek.attempts,
      previous: previousWeek.attempts,
      delta: currentWeek.attempts - previousWeek.attempts,
    },
    {
      label: 'Solved problems',
      current: currentWeek.solved,
      previous: previousWeek.solved,
      delta: currentWeek.solved - previousWeek.solved,
    },
    {
      label: 'AI sessions',
      current: currentWeek.aiSessions,
      previous: previousWeek.aiSessions,
      delta: currentWeek.aiSessions - previousWeek.aiSessions,
    },
    {
      label: 'Points earned',
      current: currentWeek.points,
      previous: previousWeek.points,
      delta: currentWeek.points - previousWeek.points,
    },
  ];

  const readinessScore = Math.min(
    100,
    Math.round(
      profileCompletion.percent * 0.22 +
        average(attempts.map((attempt) => attempt.scorePercent || 0), 1) * 0.33 +
        goalAlignment.score * 0.2 +
        studyHabits.consistencyScore * 0.25
    )
  );

  const readinessLabel =
    readinessScore >= 80
      ? 'Strong'
      : readinessScore >= 60
        ? 'Building'
        : 'Early';

  const trendSignals = weeklySummary.map((item) => ({
    label: item.label,
    current: item.current,
    previous: item.previous,
    delta: item.delta,
    direction: item.delta > 0 ? 'up' : item.delta < 0 ? 'down' : 'flat',
    summary:
      item.delta > 0
        ? `${item.delta} above last week`
        : item.delta < 0
          ? `${Math.abs(item.delta)} below last week`
          : 'Holding steady',
  }));

  const priorityBoard = [
    weakestTopic
      ? {
          id: 'weak-topic',
          title: `Rebuild ${weakestTopic.label}`,
          detail: `${weakestTopic.label} is your weakest repeat topic at ${weakestTopic.averageScore}% average score and ${weakestTopic.solvedRate}% solve rate.`,
          metric: `${weakestTopic.averageScore}% avg`,
          tone: 'warning',
          route: '/dsa',
          ctaLabel: 'Practice DSA',
        }
      : null,
    (user.learningGoals || []).length === 0
      ? {
          id: 'set-goals',
          title: 'Set your learning goals',
          detail: 'Your goals are still empty, so analytics and AI cannot align your work to a clear direction yet.',
          metric: `${goalAlignment.score}% alignment`,
          tone: 'info',
          route: '/profile/setup',
          ctaLabel: 'Update profile',
        }
      : null,
    !completedQuizSessions.length
      ? {
          id: 'run-quiz',
          title: 'Generate your first AI quiz',
          detail: 'You have no completed AI quizzes yet, which leaves a gap in your assessment data.',
          metric: `${aiSessions.length} AI sessions`,
          tone: 'info',
          route: '/ai/quiz',
          ctaLabel: 'Start quiz',
        }
      : null,
    pendingUploads > 0
      ? {
          id: 'pending-uploads',
          title: 'Review pending uploads',
          detail: `You still have ${pendingUploads} pending resource${pendingUploads === 1 ? '' : 's'} waiting for moderation.`,
          metric: `${pendingUploads} pending`,
          tone: 'warning',
          route: '/resources/my-uploads',
          ctaLabel: 'Open uploads',
        }
      : null,
    activeDaysLast14 < 5
      ? {
          id: 'consistency',
          title: 'Recover consistency',
          detail: `You were active on only ${activeDaysLast14} of the last 14 days, so short daily study check-ins would help most.`,
          metric: `${activeDaysLast14}/14 days`,
          tone: 'risk',
          route: '/dashboard',
          ctaLabel: 'Go to dashboard',
        }
      : null,
  ].filter(Boolean).slice(0, 4);

  const peerSolvedMap = {};
  const peerScoreMap = {};
  peerAttempts.forEach((attempt) => {
    const key = idString(attempt.user);
    if (!key) return;
    if (!peerSolvedMap[key]) {
      peerSolvedMap[key] = { solved: 0, attempts: 0 };
      peerScoreMap[key] = [];
    }
    peerSolvedMap[key].attempts += 1;
    peerSolvedMap[key].solved += attempt.status === 'solved' ? 1 : 0;
    peerScoreMap[key].push(Number(attempt.scorePercent || 0));
  });

  const peerUploadMap = {};
  peerUploads.forEach((resource) => {
    const key = idString(resource.creator);
    if (!key) return;
    peerUploadMap[key] = (peerUploadMap[key] || 0) + 1;
  });

  const pointValues = peerUsers.map((item) => Number(item.stats?.points || 0)).sort((a, b) => b - a);
  const solvedValues = Object.values(peerSolvedMap).map((item) => item.solved).sort((a, b) => b - a);
  const uploadValues = Object.values(peerUploadMap).sort((a, b) => b - a);

  const userPoints = Number(user.stats?.points || 0);
  const userSolved = solvedProblemIds.size;
  const userUploads = uploads.length;

  const pointsRank = pointValues.findIndex((value) => value <= userPoints) + 1 || pointValues.length;
  const solvedRank = solvedValues.findIndex((value) => value <= userSolved) + 1 || solvedValues.length;
  const uploadRank = uploadValues.findIndex((value) => value <= userUploads) + 1 || uploadValues.length;

  const peerComparison = {
    totalLearners: peerUsers.length,
    pointsRank,
    solvedRank,
    uploadRank,
    pointsPercentile: pointValues.length ? 100 - percent(pointsRank - 1, pointValues.length) : 0,
    solvedPercentile: solvedValues.length ? 100 - percent(solvedRank - 1, solvedValues.length) : 0,
    uploadPercentile: uploadValues.length ? 100 - percent(uploadRank - 1, uploadValues.length) : 0,
    platformAverages: {
      points: average(pointValues, 0),
      solvedProblems: average(solvedValues, 1),
      uploads: average(uploadValues, 1),
    },
  };

  const focusAlerts = [
    weakestTopic
      ? {
          tone: 'warning',
          title: `${weakestTopic.label} needs attention`,
          detail: `It is currently your weakest repeat topic with a ${weakestTopic.averageScore}% average score.`,
        }
      : null,
    activeDaysLast14 < 5
      ? {
          tone: 'risk',
          title: 'Consistency dropped recently',
          detail: `You were active on only ${activeDaysLast14} of the last 14 days.`,
        }
      : null,
    profileCompletion.percent < 75
      ? {
          tone: 'info',
          title: 'Profile data can sharpen recommendations',
          detail: `Your profile is ${profileCompletion.percent}% complete. Filling the missing fields improves analytics and AI guidance.`,
        }
      : null,
    currentWeek.attempts > previousWeek.attempts
      ? {
          tone: 'success',
          title: 'Practice is trending up',
          detail: `You attempted ${currentWeek.attempts - previousWeek.attempts} more problem${currentWeek.attempts - previousWeek.attempts === 1 ? '' : 's'} than last week.`,
        }
      : null,
  ].filter(Boolean);

  const analyticsReport = buildUserAnalyticsReport({
    overview: {
      points: user.stats?.points || 0,
      streak: user.stats?.streak || 0,
      level: user.stats?.level || 'Beginner',
      uploadsCount: uploads.length,
      approvedUploads,
      pendingUploads,
      rejectedUploads,
      totalViews,
      totalDownloads,
      reviewsCount,
      commentsCount,
      averageRating: calculateAverageRating(uploads),
      attemptsCount: attempts.length,
      solvedProblems: solvedProblemIds.size,
      averageDsaScore: average(attempts.map((attempt) => attempt.scorePercent || 0), 1),
      estimatedStudyHours: Number((estimatedStudyMinutes / 60).toFixed(1)),
      aiSessions: aiSessions.length,
      activeDaysLast14,
      profileCompletion: profileCompletion.percent,
    },
    weakAreas,
    strongAreas,
    focusAlerts,
    recommendations,
    weeklySummary,
    goalAlignment,
    studyHabits,
  });

  return {
    overview: {
      points: user.stats?.points || 0,
      streak: user.stats?.streak || 0,
      level: user.stats?.level || 'Beginner',
      uploadsCount: uploads.length,
      approvedUploads,
      pendingUploads,
      rejectedUploads,
      totalViews,
      totalDownloads,
      reviewsCount,
      commentsCount,
      averageRating: calculateAverageRating(uploads),
      attemptsCount: attempts.length,
      solvedProblems: solvedProblemIds.size,
      averageDsaScore: average(attempts.map((attempt) => attempt.scorePercent || 0), 1),
      estimatedStudyHours: Number((estimatedStudyMinutes / 60).toFixed(1)),
      aiSessions: aiSessions.length,
      activeDaysLast14,
      profileCompletion: profileCompletion.percent,
      readinessScore,
      readinessLabel,
    },
    progressSeries,
    contributionSeries,
    categoryBreakdown: Object.entries(categoryCount)
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value),
    topResources,
    topicPerformance,
    weakAreas,
    strongAreas,
    timeByTopic,
    companyReadiness,
    resourceImpact,
    goalAlignment,
    studyHabits,
    milestoneProgress,
    recentWins,
    weekdayPattern,
    difficultyBreakdown,
    languageBreakdown,
    activityHeatmap,
    goalsProgress: [
      {
        label: 'Profile setup',
        progress: profileCompletion.percent,
        current: `${profileCompletion.completedSteps}/${profileCompletion.totalSteps} fields`,
        target: 'Complete core profile fields',
      },
      {
        label: 'Learning goals',
        progress: Math.min(100, percent((user.learningGoals || []).length, 3)),
        current: `${(user.learningGoals || []).length} goals`,
        target: 'Define 3 learning goals',
      },
      {
        label: 'Problem solving',
        progress: Math.min(100, percent(solvedProblemIds.size, 20)),
        current: `${solvedProblemIds.size} solved`,
        target: 'Solve 20 DSA problems',
      },
      {
        label: 'Consistency',
        progress: Math.min(100, percent(activeDaysLast14, 10)),
        current: `${activeDaysLast14} active days`,
        target: 'Be active on 10 of the last 14 days',
      },
    ],
    aiInsights: {
      assistantSessions: assistantSessions.length,
      quizSessions: quizSessions.length,
      interviewSessions: interviewSessions.length,
      completedQuizSessions: completedQuizSessions.length,
      completedInterviewSessions: completedInterviewSessions.length,
      averageQuizScore: average(
        completedQuizSessions.map((session) => Number(session.score || 0)),
        1
      ),
      averageInterviewScore: average(
        completedInterviewSessions.map((session) => Number(session.score || 0)),
        1
      ),
      totalAssistantMessages,
    },
    weeklySummary,
    trendSignals,
    peerComparison,
    focusAlerts,
    priorityBoard,
    socialInsights: {
      groupsOwned: groups.filter((group) => idString(group.owner) === String(userId)).length,
      groupsJoined: groups.filter((group) => group.members.some((member) => idString(member) === String(userId))).length,
      groupPosts: groupPostsCount,
      forumThreads: forumThreadsAuthored.length,
      forumReplies: forumRepliesCount,
      mentorshipRequested,
      mentorshipAccepted,
    },
    activityBreakdown: summarizeActivityActions(user.activityLog || []).slice(0, 8),
    performanceInsights: [
      {
        label: 'Approval Rate',
        value: uploads.length ? `${percent(approvedUploads, uploads.length)}%` : '0%',
      },
      {
        label: 'Avg DSA Score',
        value: attempts.length
          ? `${average(attempts.map((attempt) => attempt.scorePercent || 0), 1)}%`
          : '0%',
      },
      {
        label: 'Practice Completion',
        value: attempts.length ? `${percent(solvedProblemIds.size, attempts.length)}%` : '0%',
      },
      {
        label: 'Community Interactions',
        value: reviewsCount + commentsCount + forumRepliesCount + groupPostsCount,
      },
      {
        label: 'AI Completion',
        value: `${completedQuizSessions.length + completedInterviewSessions.length} sessions`,
      },
      {
        label: 'Active Days',
        value: `${activeDaysLast14}/14`,
      },
    ],
    certificateReadiness: buildCertificateReadiness({
      profileCompletionPercent: profileCompletion.percent,
      solvedProblems: solvedProblemIds.size,
      activeDaysLast14,
      averageDsaScore: average(attempts.map((attempt) => attempt.scorePercent || 0), 1),
      completedAiSessions: completedQuizSessions.length + completedInterviewSessions.length,
      learningGoalsCount: (user.learningGoals || []).length,
      readinessScore,
    }),
    recommendations,
    report: analyticsReport,
  };
};

const buildAdminAnalytics = async () => {
  const [users, resources, attempts, aiSessions, groups, threads, mentorships] = await Promise.all([
    User.find().sort({ createdAt: -1 }),
    File.find()
      .populate({ path: 'creator', select: 'fullName username email role' })
      .sort({ createdAt: -1 }),
    DsaAttempt.find()
      .populate({ path: 'problem', select: 'title topic difficulty category' })
      .sort({ createdAt: -1 }),
    AiSession.find().sort({ createdAt: -1 }),
    CommunityGroup.find().sort({ createdAt: -1 }),
    ForumThread.find().sort({ createdAt: -1 }),
    MentorshipRequest.find().sort({ createdAt: -1 }),
  ]);

  const monthBuckets = buildMonthBuckets();
  const usersMap = toBucketMap(monthBuckets);
  const resourcesMap = toBucketMap(monthBuckets);
  const attemptsMap = toBucketMap(monthBuckets);
  const aiMap = toBucketMap(monthBuckets);

  users.forEach((user) => {
    const key = monthKeyForDate(user.createdAt);
    if (usersMap[key] !== undefined) {
      usersMap[key] += 1;
    }
  });

  resources.forEach((resource) => {
    const key = monthKeyForDate(resource.createdAt);
    if (resourcesMap[key] !== undefined) {
      resourcesMap[key] += 1;
    }
  });

  attempts.forEach((attempt) => {
    const key = monthKeyForDate(attempt.createdAt);
    if (attemptsMap[key] !== undefined) {
      attemptsMap[key] += 1;
    }
  });

  aiSessions.forEach((session) => {
    const key = monthKeyForDate(session.createdAt);
    if (aiMap[key] !== undefined) {
      aiMap[key] += 1;
    }
  });

  const growthSeries = monthBuckets.map((bucket) => ({
    label: bucket.label,
    users: usersMap[bucket.key],
    resources: resourcesMap[bucket.key],
    attempts: attemptsMap[bucket.key],
    aiSessions: aiMap[bucket.key],
  }));

  const categoryMap = {};
  resources.forEach((resource) => {
    const label = resource.category || 'General';
    categoryMap[label] = (categoryMap[label] || 0) + 1;
  });

  const contributorMap = {};
  resources.forEach((resource) => {
    const creatorId = idString(resource.creator);
    if (!creatorId) return;
    if (!contributorMap[creatorId]) {
      contributorMap[creatorId] = {
        id: creatorId,
        name: resource.creator?.fullName || resource.creator?.username || 'Unknown',
        avatar: (resource.creator?.fullName || resource.creator?.username || 'UN')
          .slice(0, 2)
          .toUpperCase(),
        contributions: 0,
        downloads: 0,
      };
    }
    contributorMap[creatorId].contributions += 1;
    contributorMap[creatorId].downloads += Number(resource.downloads || 0);
  });

  const topContributors = Object.values(contributorMap)
    .sort((left, right) => (right.contributions - left.contributions) || (right.downloads - left.downloads))
    .slice(0, 5);

  const totalDownloads = resources.reduce((sum, resource) => sum + Number(resource.downloads || 0), 0);
  const totalViews = resources.reduce((sum, resource) => sum + Number(resource.views || 0), 0);
  const totalRatings = resources.reduce((sum, resource) => sum + (resource.reviews || []).length, 0);
  const activeUsers = users.filter((user) => {
    if (!user.lastActiveAt) return false;
    return (new Date() - new Date(user.lastActiveAt)) / 86400000 <= 30;
  }).length;

  const attemptUsers = new Set();
  const aiUsers = new Set();
  const resourceUsers = new Set();
  const socialUsers = new Set();
  attempts.forEach((attempt) => pushUnique(attemptUsers, attempt.user));
  aiSessions.forEach((session) => pushUnique(aiUsers, session.user));
  resources.forEach((resource) => pushUnique(resourceUsers, resource.creator));
  groups.forEach((group) => {
    pushUnique(socialUsers, group.owner);
    (group.members || []).forEach((member) => pushUnique(socialUsers, member));
    (group.posts || []).forEach((post) => pushUnique(socialUsers, post.author));
  });
  threads.forEach((thread) => {
    pushUnique(socialUsers, thread.author);
    (thread.replies || []).forEach((reply) => pushUnique(socialUsers, reply.author));
  });
  mentorships.forEach((item) => {
    pushUnique(socialUsers, item.requester);
    pushUnique(socialUsers, item.mentor);
  });

  const topicMap = {};
  const difficultyMap = {
    easy: { label: 'Easy', attempts: 0, solved: 0 },
    medium: { label: 'Medium', attempts: 0, solved: 0 },
    hard: { label: 'Hard', attempts: 0, solved: 0 },
  };
  attempts.forEach((attempt) => {
    const topic = attempt.problem?.topic || attempt.problem?.category || 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { label: topic, attempts: 0, solved: 0, scoreTotal: 0 };
    }
    topicMap[topic].attempts += 1;
    topicMap[topic].solved += attempt.status === 'solved' ? 1 : 0;
    topicMap[topic].scoreTotal += Number(attempt.scorePercent || 0);

    const difficulty = attempt.problem?.difficulty || 'medium';
    if (!difficultyMap[difficulty]) {
      difficultyMap[difficulty] = { label: difficulty, attempts: 0, solved: 0 };
    }
    difficultyMap[difficulty].attempts += 1;
    difficultyMap[difficulty].solved += attempt.status === 'solved' ? 1 : 0;
  });

  const topicDemand = Object.values(topicMap)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solvedRate: percent(item.solved, item.attempts),
      averageScore: item.attempts ? Number((item.scoreTotal / item.attempts).toFixed(1)) : 0,
    }))
    .sort((left, right) => right.attempts - left.attempts)
    .slice(0, 8);

  const difficultyBreakdown = Object.values(difficultyMap)
    .filter((item) => item.attempts > 0)
    .map((item) => ({
      label: item.label,
      attempts: item.attempts,
      solvedRate: percent(item.solved, item.attempts),
    }));

  const profileCompletionRates = users.map((user) => buildProfileCompletion(user).percent);
  const goalSetupUsers = users.filter((user) => (user.learningGoals || []).length > 0).length;
  const streakingUsers = users.filter((user) => Number(user.stats?.streak || 0) >= 3).length;
  const dormantUsers = users.filter((user) => {
    if (!user.lastActiveAt) return true;
    return (new Date() - new Date(user.lastActiveAt)) / 86400000 > 30;
  }).length;

  const averageModerationDays = calculateModerationTurnaround(resources);
  const approvedResources = resources.filter((resource) => resource.status === 'approved').length;
  const rejectedResources = resources.filter((resource) => resource.status === 'rejected').length;
  const pendingResources = resources.filter((resource) => resource.status === 'pending').length;
  const solvedAttempts = attempts.filter((attempt) => attempt.status === 'solved').length;
  const completedQuizSessions = aiSessions.filter(
    (session) => session.type === 'quiz' && session.status === 'completed'
  );

  const recentPlatformActivity = [
    ...resources.slice(0, 4).map((resource) => ({
      id: `resource-${resource._id}`,
      title: resource.title,
      status: resource.status,
      type: 'resource',
      creator: resource.creator?.fullName || resource.creator?.username || 'Unknown',
      createdAt: resource.createdAt,
    })),
    ...threads.slice(0, 3).map((thread) => ({
      id: `thread-${thread._id}`,
      title: thread.title,
      status: `${thread.replies?.length || 0} replies`,
      type: 'forum',
      creator: 'Community',
      createdAt: thread.createdAt,
    })),
    ...groups.slice(0, 2).map((group) => ({
      id: `group-${group._id}`,
      title: group.name,
      status: `${group.members?.length || 0} members`,
      type: 'group',
      creator: 'Community',
      createdAt: group.createdAt,
    })),
  ]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 8);

  const adminReport = buildAdminAnalyticsReport({
    overview: {
      totalUsers: users.length,
      totalResources: resources.length,
      pendingResources,
      approvedResources,
      rejectedResources,
      totalDownloads,
      totalViews,
      activeUsers,
      averageRating: calculateAverageRating(resources),
      monthlyGrowth:
        growthSeries.length > 1 && growthSeries[growthSeries.length - 2].users
          ? Math.round(
              ((growthSeries[growthSeries.length - 1].users -
                growthSeries[growthSeries.length - 2].users) /
                growthSeries[growthSeries.length - 2].users) *
                100
            )
          : growthSeries[growthSeries.length - 1]?.users || 0,
      totalDsaAttempts: attempts.length,
      solvedAttempts,
      aiSessions: aiSessions.length,
      communityGroups: groups.length,
      forumThreads: threads.length,
      mentorshipRequests: mentorships.length,
      profileCompletionRate: average(profileCompletionRates, 0),
    },
    featureAdoption: [
      {
        label: 'Resources',
        users: resourceUsers.size,
        percentage: percent(resourceUsers.size, users.length),
        summary: `${resourceUsers.size} users uploaded at least one resource`,
      },
      {
        label: 'DSA Practice',
        users: attemptUsers.size,
        percentage: percent(attemptUsers.size, users.length),
        summary: `${attempts.length} attempts recorded across the platform`,
      },
      {
        label: 'AI Studio',
        users: aiUsers.size,
        percentage: percent(aiUsers.size, users.length),
        summary: `${aiSessions.length} AI sessions have been created`,
      },
      {
        label: 'Community',
        users: socialUsers.size,
        percentage: percent(socialUsers.size, users.length),
        summary: `${threads.length} threads and ${groups.length} groups are active`,
      },
    ],
    moderationInsights: [
      {
        label: 'Approval Rate',
        value: `${percent(approvedResources, resources.length)}%`,
      },
      {
        label: 'Rejection Rate',
        value: `${percent(rejectedResources, resources.length)}%`,
      },
      {
        label: 'Pending Queue',
        value: pendingResources,
      },
      {
        label: 'Avg Moderation Time',
        value: `${averageModerationDays} days`,
      },
    ],
    learnerHealth: [
      {
        label: 'Profile Completion',
        value: `${average(profileCompletionRates, 0)}%`,
      },
      {
        label: 'Goal Setup Rate',
        value: `${percent(goalSetupUsers, users.length)}%`,
      },
      {
        label: 'Streaking Users',
        value: streakingUsers,
      },
      {
        label: 'Dormant Users',
        value: dormantUsers,
      },
    ],
    topicDemand,
    recentPlatformActivity,
  });

  return {
    overview: {
      totalUsers: users.length,
      totalResources: resources.length,
      pendingResources,
      approvedResources,
      rejectedResources,
      totalDownloads,
      totalViews,
      activeUsers,
      averageRating: calculateAverageRating(resources),
      monthlyGrowth:
        growthSeries.length > 1 && growthSeries[growthSeries.length - 2].users
          ? Math.round(
              ((growthSeries[growthSeries.length - 1].users -
                growthSeries[growthSeries.length - 2].users) /
                growthSeries[growthSeries.length - 2].users) *
                100
            )
          : growthSeries[growthSeries.length - 1]?.users || 0,
      totalDsaAttempts: attempts.length,
      solvedAttempts,
      aiSessions: aiSessions.length,
      communityGroups: groups.length,
      forumThreads: threads.length,
      mentorshipRequests: mentorships.length,
      profileCompletionRate: average(profileCompletionRates, 0),
    },
    growthSeries,
    categoryBreakdown: Object.entries(categoryMap)
      .map(([label, value]) => ({ label, value }))
      .sort((left, right) => right.value - left.value),
    topContributors,
    engagement: {
      activeUsersRate: percent(activeUsers, users.length),
      avgResourcesPerUser: users.length ? Number((resources.length / users.length).toFixed(1)) : 0,
      avgDownloadsPerResource: resources.length ? Number((totalDownloads / resources.length).toFixed(1)) : 0,
      avgRatingsPerResource: resources.length ? Number((totalRatings / resources.length).toFixed(1)) : 0,
      avgAttemptsPerLearner: attemptUsers.size ? Number((attempts.length / attemptUsers.size).toFixed(1)) : 0,
      avgQuizScore: average(
        completedQuizSessions.map((session) => Number(session.score || 0)),
        1
      ),
    },
    featureAdoption: [
      {
        label: 'Resources',
        users: resourceUsers.size,
        percentage: percent(resourceUsers.size, users.length),
        summary: `${resourceUsers.size} users uploaded at least one resource`,
      },
      {
        label: 'DSA Practice',
        users: attemptUsers.size,
        percentage: percent(attemptUsers.size, users.length),
        summary: `${attempts.length} attempts recorded across the platform`,
      },
      {
        label: 'AI Studio',
        users: aiUsers.size,
        percentage: percent(aiUsers.size, users.length),
        summary: `${aiSessions.length} AI sessions have been created`,
      },
      {
        label: 'Community',
        users: socialUsers.size,
        percentage: percent(socialUsers.size, users.length),
        summary: `${threads.length} threads and ${groups.length} groups are active`,
      },
    ],
    learnerHealth: [
      {
        label: 'Profile Completion',
        value: `${average(profileCompletionRates, 0)}%`,
      },
      {
        label: 'Goal Setup Rate',
        value: `${percent(goalSetupUsers, users.length)}%`,
      },
      {
        label: 'Streaking Users',
        value: streakingUsers,
      },
      {
        label: 'Dormant Users',
        value: dormantUsers,
      },
    ],
    moderationInsights: [
      {
        label: 'Approval Rate',
        value: `${percent(approvedResources, resources.length)}%`,
      },
      {
        label: 'Rejection Rate',
        value: `${percent(rejectedResources, resources.length)}%`,
      },
      {
        label: 'Pending Queue',
        value: pendingResources,
      },
      {
        label: 'Avg Moderation Time',
        value: `${averageModerationDays} days`,
      },
    ],
    topicDemand,
    difficultyBreakdown,
    recentPlatformActivity,
    report: adminReport,
  };
};

const buildUserAnalyticsExport = async (userId) => {
  const analytics = await buildUserAnalytics(userId);
  if (!analytics) return null;

  const user = await User.findById(userId).select('fullName username');

  return {
    fileName: `studysphere-analytics-${user?.username || 'user'}.md`,
    contentType: 'text/markdown; charset=utf-8',
    content: buildUserAnalyticsExportMarkdown(analytics, user),
  };
};

const buildAdminAnalyticsExport = async () => {
  const analytics = await buildAdminAnalytics();

  return {
    fileName: 'studysphere-admin-analytics.md',
    contentType: 'text/markdown; charset=utf-8',
    content: buildAdminAnalyticsExportMarkdown(analytics),
  };
};

module.exports = {
  buildUserAnalytics,
  buildAdminAnalytics,
  buildUserAnalyticsExport,
  buildAdminAnalyticsExport,
};
