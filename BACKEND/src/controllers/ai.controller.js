const AiSession = require('../models/ai-session.model');
const User = require('../models/user.model');
const DsaProblem = require('../models/dsa-problem.model');
const DsaAttempt = require('../models/dsa-attempt.model');
const File = require('../models/file.model');
const {
  generateAssistantReply,
  generateInterviewFeedback,
  generateQuizQuestions,
  generateInterviewOpening,
  generateRoadmapPlan,
  hasAiProvider,
} = require('../services/ai-provider.service');
const { createNotification } = require('../services/notification.service');

const formatSessionSummary = (session) => ({
  id: session._id,
  type: session.type,
  title: session.title,
  status: session.status,
  score: session.score,
  context: session.context || {},
  updatedAt: session.updatedAt,
  createdAt: session.createdAt,
});

const formatSession = (session) => ({
  ...formatSessionSummary(session),
  messages: session.messages || [],
  questions: session.questions || [],
});

const buildInterviewPrompt = ({ role, focusAreas = [], round = 1 }) => {
  const focus = focusAreas[round - 1] || focusAreas[0] || 'problem solving';
  const prompts = [
    `Walk me through how you would approach a ${focus} problem in a ${role} interview.`,
    `Tell me about a tradeoff you would explain when solving ${focus} questions for a ${role} role.`,
    `If you made a mistake during a ${focus} interview question, how would you recover and communicate clearly?`,
  ];

  return prompts[Math.min(prompts.length - 1, Math.max(0, round - 1))];
};

const buildPracticeChecklist = (topic, recommendedProblems = []) => {
  const firstProblem = recommendedProblems[0];
  return [
    `Start with one ${topic} warm-up question before switching contexts.`,
    firstProblem
      ? `After the quiz or interview, solve ${firstProblem.title} to reinforce the same signal.`
      : `After the quiz or interview, solve one matching ${topic} DSA problem while the concept is fresh.`,
    'Write one short takeaway so the next AI session has better context.',
  ];
};

const uniqueStrings = (values = []) =>
  [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const wasActiveWithinDays = (value, days) => {
  if (!value) {
    return false;
  }

  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp <= days * 24 * 60 * 60 * 1000;
};

const formatPercent = (value) => clamp(Math.round(Number(value) || 0), 0, 100);

const buildQuizQuestions = async ({ topic = 'Algorithms', difficulty = 'mixed', count = 5 }) => {
  const query =
    difficulty === 'mixed'
      ? {
          $or: [
            { category: { $regex: topic, $options: 'i' } },
            { topic: { $regex: topic, $options: 'i' } },
            { tags: { $regex: topic, $options: 'i' } },
          ],
        }
      : {
          difficulty,
          $or: [
            { category: { $regex: topic, $options: 'i' } },
            { topic: { $regex: topic, $options: 'i' } },
            { tags: { $regex: topic, $options: 'i' } },
          ],
        };

  const problems = await DsaProblem.find(query).limit(Math.max(3, count));

  if (!problems.length) {
    return [
      {
        question: `Which data structure is most useful when working on ${topic}?`,
        options: ['Hash Map', 'Queue', 'Graph', 'Heap'],
        answer: 'Hash Map',
        explanation: `For many ${topic} style problems, a hash map is a strong first tool to consider.`,
      },
    ];
  }

  return problems.slice(0, count).map((problem) => ({
    question: `For "${problem.title}", which category best matches the core pattern?`,
    options: uniqueStrings([problem.category, problem.topic, ...(problem.tags || []).slice(0, 2)]),
    answer: problem.category,
    explanation: problem.editorial || `The primary pattern here is ${problem.category}.`,
  }));
};

const buildLearningSnapshot = async (userId) => {
  const [user, attempts, problems, resources, sessions] = await Promise.all([
    User.findById(userId),
    DsaAttempt.find({ user: userId })
      .sort({ updatedAt: -1 })
      .populate('problem', 'title slug difficulty category topic tags companyTags'),
    DsaProblem.find().select('title slug difficulty category topic tags companyTags estimatedMinutes'),
    File.find({ status: 'approved' })
      .select('title category tags rating reviews downloads views')
      .sort({ downloads: -1, views: -1 })
      .limit(40),
    AiSession.find({ user: userId }).sort({ updatedAt: -1 }).limit(18),
  ]);

  const latestByProblem = new Map();
  attempts.forEach((attempt) => {
    const key = String(attempt.problem?._id || attempt.problem || '');
    if (key && !latestByProblem.has(key)) {
      latestByProblem.set(key, attempt);
    }
  });
  const latestAttempts = [...latestByProblem.values()];
  const solvedAttempts = latestAttempts.filter((attempt) => attempt.status === 'solved');
  const attemptedProblemsCount = latestAttempts.length;
  const solvedProblemsCount = solvedAttempts.length;
  const strugglingProblemsCount = Math.max(0, attemptedProblemsCount - solvedProblemsCount);
  const overallSolveRate = attemptedProblemsCount
    ? formatPercent((solvedProblemsCount / attemptedProblemsCount) * 100)
    : 0;
  const recentPracticeCount = latestAttempts.filter((attempt) => wasActiveWithinDays(attempt.updatedAt, 10)).length;
  const recentAiSessionsCount = sessions.filter((session) => wasActiveWithinDays(session.updatedAt, 10)).length;
  const profileSignalsCount = [
    user?.targetRole,
    user?.currentRole,
    user?.bio,
    user?.location,
    user?.skills?.length,
    user?.interests?.length,
    user?.learningGoals?.length,
  ].filter(Boolean).length;
  const profileCompletionScore = formatPercent((profileSignalsCount / 7) * 100);

  const topicStats = {};
  latestAttempts.forEach((attempt) => {
    const problem = attempt.problem;
    const topic = problem?.topic || problem?.category || 'General';
    if (!topicStats[topic]) {
      topicStats[topic] = {
        label: topic,
        attempts: 0,
        solved: 0,
        struggling: 0,
        averageScore: 0,
        totalScore: 0,
      };
    }

    topicStats[topic].attempts += 1;
    topicStats[topic].totalScore += Number(attempt.scorePercent || 0);
    if (attempt.status === 'solved') {
      topicStats[topic].solved += 1;
    } else {
      topicStats[topic].struggling += 1;
    }
  });

  const topicInsights = Object.values(topicStats).map((entry) => ({
    label: entry.label,
    attempts: entry.attempts,
    solved: entry.solved,
    struggling: entry.struggling,
    averageScore: entry.attempts ? Math.round(entry.totalScore / entry.attempts) : 0,
    solveRate: entry.attempts ? Math.round((entry.solved / entry.attempts) * 100) : 0,
  }));

  const weakTopics = topicInsights
    .filter((entry) => entry.struggling > 0 || entry.solveRate < 60)
    .sort((left, right) => (left.solveRate - right.solveRate) || (right.struggling - left.struggling))
    .slice(0, 4);

  const strongTopics = topicInsights
    .filter((entry) => entry.solved > 0)
    .sort((left, right) => (right.solveRate - left.solveRate) || (right.solved - left.solved))
    .slice(0, 3);

  const solvedProblemIds = new Set(
    latestAttempts
      .filter((attempt) => attempt.status === 'solved')
      .map((attempt) => String(attempt.problem?._id || attempt.problem))
  );

  const interestSignals = uniqueStrings([
    ...(weakTopics.map((topic) => topic.label) || []),
    ...(user?.skills || []).slice(0, 3),
    ...(user?.interests || []).slice(0, 3),
    ...(user?.learningGoals || []).slice(0, 3),
  ]);

  const recommendedProblems = problems
    .filter((problem) => !solvedProblemIds.has(String(problem._id)))
    .filter((problem) => {
      const searchable = uniqueStrings([problem.category, problem.topic, ...(problem.tags || []), ...(problem.companyTags || [])]).join(' ').toLowerCase();
      return !interestSignals.length || interestSignals.some((signal) => searchable.includes(signal.toLowerCase()));
    })
    .slice(0, 4)
    .map((problem) => ({
      id: problem._id,
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      category: problem.category,
      topic: problem.topic || problem.category,
      estimatedMinutes: problem.estimatedMinutes || 20,
      companyTags: (problem.companyTags || []).slice(0, 3),
      reason: weakTopics.some((topic) => topic.label === (problem.topic || problem.category))
        ? `Recommended because ${problem.topic || problem.category} is one of your current weak areas.`
        : problem.companyTags?.length
          ? `Recommended to reinforce ${problem.topic || problem.category} with company-style practice from ${problem.companyTags.slice(0, 2).join(', ')}.`
          : `Recommended because it matches your current focus on ${problem.topic || problem.category}.`,
    }));

  const recommendedResources = resources
    .filter((resource) => {
      const searchable = uniqueStrings([resource.category, ...(resource.tags || [])]).join(' ').toLowerCase();
      return !interestSignals.length || interestSignals.some((signal) => searchable.includes(signal.toLowerCase()));
    })
    .slice(0, 4)
    .map((resource) => ({
      id: resource._id,
      title: resource.title,
      category: resource.category,
      rating: resource.reviews?.length
        ? Number(
            (
              resource.reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
              resource.reviews.length
            ).toFixed(1)
          )
        : 0,
      downloads: Number(resource.downloads || 0),
      reason: weakTopics.some((topic) => topic.label.toLowerCase() === String(resource.category || '').toLowerCase())
        ? `Recommended because it supports ${resource.category}, which needs more repetition right now.`
        : `Recommended because learners are using this ${resource.category} resource heavily.`,
    }));

  const fallbackRoadmap = [
    {
      title: 'Stabilize the basics',
      focus: weakTopics[0]?.label || 'Core DSA',
      actionItems: [
        'Re-solve one weak-topic problem without hints.',
        'Review one editorial and write down the pattern in your own words.',
        'Turn one useful resource into short revision notes.',
      ],
    },
    {
      title: 'Build interview confidence',
      focus: weakTopics[1]?.label || user?.targetRole || 'Interview readiness',
      actionItems: [
        'Generate a targeted quiz from your weak areas.',
        'Run one mock interview round and improve one answer.',
        'Track one measurable weakness to revisit later this week.',
      ],
    },
    {
      title: 'Convert practice into momentum',
      focus: strongTopics[0]?.label || 'Consistency',
      actionItems: [
        'Mix one confidence topic with one stretch topic.',
        'Save your best resources into a focused collection.',
        'Set one small goal for the next study session.',
      ],
    },
  ];

  const generatedRoadmap = await generateRoadmapPlan({
    targetRole: user?.targetRole || user?.currentRole || 'Software Engineer',
    weakTopics: weakTopics.map((topic) => topic.label),
    goals: user?.learningGoals || [],
    fallbackRoadmap,
  });

  const roadmap = generatedRoadmap.map((stage, index) => ({
    ...stage,
    reason:
      index === 0
        ? `Start here because ${weakTopics[0]?.label || 'your core fundamentals'} needs the fastest reinforcement.`
        : index === 1
          ? `This stage turns practice into interview-ready confidence for ${user?.targetRole || user?.currentRole || 'your target role'}.`
          : 'Use this stage to keep momentum going and make your progress stick.',
  }));

  const recentSessions = sessions.map(formatSessionSummary);
  const quizHistory = recentSessions.filter((session) => session.type === 'quiz').slice(0, 5);
  const interviewHistory = recentSessions.filter((session) => session.type === 'interview').slice(0, 5);
  const assistantHistory = recentSessions.filter((session) => session.type === 'assistant').slice(0, 5);

  const suggestedQuizTopic =
    weakTopics[0]?.label ||
    user?.learningGoals?.[0] ||
    user?.interests?.[0] ||
    'Algorithms';
  const suggestedInterviewRole =
    user?.targetRole || user?.currentRole || 'Software Engineer';
  const suggestedFocusAreas = uniqueStrings([
    ...weakTopics.map((topic) => topic.label),
    ...(user?.skills || []).slice(0, 2),
    ...(user?.interests || []).slice(0, 2),
  ]).slice(0, 4);

  const readinessScore = formatPercent(
    profileCompletionScore * 0.3 +
      overallSolveRate * 0.45 +
      Math.min(100, recentPracticeCount * 18 + recentAiSessionsCount * 12) * 0.25
  );

  const momentumLabel =
    recentPracticeCount >= 5 || recentAiSessionsCount >= 4
      ? 'High'
      : recentPracticeCount >= 2 || recentAiSessionsCount >= 2
        ? 'Building'
        : 'Low';

  const nextActions = [
    {
      id: 'focus-quiz',
      title: `Run a quiz on ${suggestedQuizTopic}`,
      description: 'Use a personalized quiz to tighten your weakest pattern before the next practice session.',
      route: '/ai/quiz',
      ctaLabel: 'Start quiz',
      reason: weakTopics[0]
        ? `${weakTopics[0].label} is currently your lowest-confidence topic at ${weakTopics[0].solveRate}% solve rate.`
        : 'A short quiz is the fastest way to create a fresh AI signal.',
      priority: 'high',
    },
    {
      id: 'practice-problem',
      title: 'Solve one recommended DSA problem',
      description: 'Turn the AI signal into hands-on repetition while the topic is still fresh.',
      route: recommendedProblems[0]?.slug ? `/dsa/practice/${recommendedProblems[0].slug}` : '/dsa',
      ctaLabel: 'Open problem',
      reason: recommendedProblems[0]?.reason || 'A targeted problem builds retention faster than passive review.',
      priority: 'high',
    },
    {
      id: 'assistant-plan',
      title: 'Ask the assistant for a short revision checklist',
      description: 'Convert your weak areas into a small, concrete study checklist.',
      route: '/ai/assistant',
      ctaLabel: 'Open assistant',
      reason: user?.learningGoals?.length
        ? `You already set ${user.learningGoals.length} learning goal${user.learningGoals.length > 1 ? 's' : ''}; the assistant can turn them into a tighter plan.`
        : 'The assistant can help you structure your next session even before your profile is fully complete.',
      priority: 'medium',
    },
    {
      id: 'interview-round',
      title: `Practice one ${suggestedInterviewRole} mock interview`,
      description: 'Strengthen communication and readiness around your target role.',
      route: '/ai/interview',
      ctaLabel: 'Start interview',
      reason: `Your current signals point toward ${suggestedInterviewRole} as the best role to rehearse next.`,
      priority: 'medium',
    },
  ];

  const weeklyPlan = [
    {
      id: 'day-1',
      label: 'Day 1',
      title: `Rebuild ${weakTopics[0]?.label || suggestedQuizTopic}`,
      action: `Take a quick quiz and solve one ${weakTopics[0]?.label || suggestedQuizTopic} problem.`,
      route: '/ai/quiz',
      ctaLabel: 'Quiz first',
      reason: weakTopics[0]
        ? `${weakTopics[0].label} is the biggest accuracy gap right now.`
        : 'Starting with a quiz helps the system find your real focus area.',
    },
    {
      id: 'day-2',
      label: 'Day 2',
      title: 'Convert learning into notes',
      action: 'Open one recommended resource and turn it into three revision bullets.',
      route: '/resources',
      ctaLabel: 'Open resources',
      reason: recommendedResources[0]?.reason || 'Light review helps the previous day stick.',
    },
    {
      id: 'day-3',
      label: 'Day 3',
      title: 'Pressure-test your explanation',
      action: `Run a short ${suggestedInterviewRole} mock interview focused on ${suggestedFocusAreas[0] || 'your current priorities'}.`,
      route: '/ai/interview',
      ctaLabel: 'Mock interview',
      reason: 'Speaking the answer out loud exposes weak understanding quickly.',
    },
    {
      id: 'day-4',
      label: 'Day 4',
      title: 'Ask for the next upgrade',
      action: 'Use the assistant to generate your next revision checklist or mini roadmap.',
      route: '/ai/assistant',
      ctaLabel: 'Ask assistant',
      reason: 'A small retrospective keeps the plan adaptive instead of static.',
    },
  ];

  return {
    profile: {
      fullName: user?.fullName || '',
      targetRole: user?.targetRole || '',
      currentRole: user?.currentRole || '',
      learningGoals: user?.learningGoals || [],
      skills: user?.skills || [],
      interests: user?.interests || [],
    },
    weakTopics,
    strongTopics,
    overview: {
      attemptedProblemsCount,
      solvedProblemsCount,
      strugglingProblemsCount,
      overallSolveRate,
      profileCompletionScore,
      readinessScore,
      recentPracticeCount,
      recentAiSessionsCount,
      approvedResourceMatches: recommendedResources.length,
      momentumLabel,
    },
    recommendedProblems,
    recommendedResources,
    roadmap,
    nextActions,
    weeklyPlan,
    suggestedQuizTopic,
    suggestedInterviewRole,
    suggestedFocusAreas,
    assistantPrompts: [
      `Build me a 3-day plan for ${suggestedQuizTopic}.`,
      `Turn my weak areas into a revision checklist.`,
      `How should I prepare for a ${suggestedInterviewRole} interview this week?`,
    ],
    history: {
      quiz: quizHistory,
      interview: interviewHistory,
      assistant: assistantHistory,
      totals: {
        quiz: recentSessions.filter((session) => session.type === 'quiz').length,
        interview: recentSessions.filter((session) => session.type === 'interview').length,
        assistant: recentSessions.filter((session) => session.type === 'assistant').length,
      },
    },
  };
};

const getAiSummary = async (req, res) => {
  try {
    const [sessions, resources, problems, personalization] = await Promise.all([
      AiSession.find({ user: req.user.id }).sort({ updatedAt: -1 }).limit(12),
      File.find({ creator: req.user.id }).sort({ createdAt: -1 }).limit(5),
      DsaProblem.find().limit(6),
      buildLearningSnapshot(req.user.id),
    ]);

    return res.status(200).json({
      sessions: sessions.map(formatSessionSummary),
      suggestions: [
        hasAiProvider()
          ? `Generate a provider-backed quiz from ${personalization.suggestedQuizTopic}.`
          : `Generate a fallback quiz from ${personalization.suggestedQuizTopic}.`,
        'Use the assistant to turn a resource into revision notes.',
        `Run a mock interview for ${personalization.suggestedInterviewRole}.`,
      ],
      resources: resources.map((resource) => ({
        id: resource._id,
        title: resource.title,
        category: resource.category,
      })),
      featuredTopics: problems.map((problem) => ({
        id: problem._id,
        title: problem.title,
        category: problem.category,
      })),
      highlights: {
        weakTopics: personalization.weakTopics,
        strongTopics: personalization.strongTopics,
        suggestedQuizTopic: personalization.suggestedQuizTopic,
        suggestedInterviewRole: personalization.suggestedInterviewRole,
      },
    });
  } catch (err) {
    console.error('[getAiSummary]', err);
    return res.status(500).json({ message: 'Unable to fetch AI summary.' });
  }
};

const getAiPersonalization = async (req, res) => {
  try {
    const personalization = await buildLearningSnapshot(req.user.id);
    return res.status(200).json(personalization);
  } catch (err) {
    console.error('[getAiPersonalization]', err);
    return res.status(500).json({ message: 'Unable to build your AI personalization plan.' });
  }
};

const getAiSession = async (req, res) => {
  try {
    const session = await AiSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'AI session not found.' });
    }

    return res.status(200).json({ session: formatSession(session) });
  } catch (err) {
    console.error('[getAiSession]', err);
    return res.status(500).json({ message: 'Unable to load this AI session.' });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const personalization = await buildLearningSnapshot(req.user.id);
    const mode = req.body.mode === 'personalized' ? 'personalized' : 'manual';
    const topic = mode === 'personalized'
      ? personalization.suggestedQuizTopic
      : (req.body.topic || personalization.suggestedQuizTopic || 'Algorithms');
    const difficulty = req.body.difficulty || (mode === 'personalized' ? 'mixed' : 'mixed');
    const count = Number(req.body.count) || 5;

    const fallbackQuestions = await buildQuizQuestions({ topic, difficulty, count });
    const questions = await generateQuizQuestions({
      topic,
      difficulty,
      count,
      fallbackQuestions,
    });

    const session = await AiSession.create({
      user: req.user.id,
      type: 'quiz',
      title: mode === 'personalized' ? `${topic} personalized quiz` : `${topic} quiz`,
      prompt: `Quiz for ${topic}`,
      questions,
      context: {
        topic,
        difficulty,
        mode,
        providerEnabled: hasAiProvider(),
        weakTopics: personalization.weakTopics.map((entry) => entry.label),
        practiceChecklist: buildPracticeChecklist(topic, personalization.recommendedProblems),
      },
      status: 'completed',
    });

    await createNotification({
      recipient: req.user.id,
      type: 'ai_quiz',
      title: 'AI quiz generated',
      message: `Your ${topic} quiz is ready to practice.`,
      link: '/ai/quiz',
      metadata: { sessionId: session._id },
    });

    return res.status(201).json({ session: formatSession(session), personalization });
  } catch (err) {
    console.error('[generateQuiz]', err);
    return res.status(500).json({ message: 'Unable to generate quiz.' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const session = await AiSession.findOne({ _id: req.params.id, user: req.user.id, type: 'quiz' });
    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found.' });
    }

    const rawAnswers = Array.isArray(req.body.answers)
      ? req.body.answers
      : Object.values(req.body.answers || {});
    const normalizedAnswers = rawAnswers.map((value) => String(value || '').trim());
    const review = (session.questions || []).map((question, index) => {
      const selectedAnswer = normalizedAnswers[index] || '';
      const correctAnswer = String(question.answer || '').trim();
      return {
        index,
        question: question.question,
        selectedAnswer,
        correctAnswer,
        isCorrect: Boolean(selectedAnswer) && selectedAnswer === correctAnswer,
        explanation: question.explanation || '',
      };
    });

    const correctCount = review.filter((item) => item.isCorrect).length;
    const totalQuestions = review.length;
    const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;

    session.score = score;
    session.status = 'completed';
    session.context = {
      ...(session.context || {}),
      submittedAt: new Date().toISOString(),
      selectedAnswers: normalizedAnswers,
      correctCount,
      totalQuestions,
    };
    await session.save();

    return res.status(200).json({
      session: formatSession(session),
      review,
      score,
      correctCount,
      totalQuestions,
    });
  } catch (err) {
    console.error('[submitQuiz]', err);
    return res.status(500).json({ message: 'Unable to submit this quiz.' });
  }
};

const assistantMessage = async (req, res) => {
  try {
    const { message = '', context = 'general', sessionId = '' } = req.body;
    if (!message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }

    const [user, personalization] = await Promise.all([
      User.findById(req.user.id),
      buildLearningSnapshot(req.user.id),
    ]);

    const fallbackReply = `StudySphere AI suggests focusing on ${personalization.suggestedQuizTopic}. Based on your profile, prioritize ${user?.targetRole || 'your next goal'} and take one concrete step today: solve one ${personalization.suggestedQuizTopic} problem, review one resource, and write one takeaway.`;
    const reply = await generateAssistantReply({
      message: message.trim(),
      context: [
        `Mode: ${context}`,
        `Target role: ${user?.targetRole || user?.currentRole || 'Not set'}`,
        `Learning goals: ${(user?.learningGoals || []).join(', ') || 'Not set'}`,
        `Weak topics: ${personalization.weakTopics.map((topic) => topic.label).join(', ') || 'None yet'}`,
        `Strong topics: ${personalization.strongTopics.map((topic) => topic.label).join(', ') || 'None yet'}`,
        `Suggested resources: ${personalization.recommendedResources.map((resource) => resource.title).join(', ') || 'None'}`,
      ].join('\n'),
      fallbackReply,
    });

    let session = null;
    if (sessionId) {
      session = await AiSession.findOne({ _id: sessionId, user: req.user.id, type: 'assistant' });
    }

    if (!session) {
      session = new AiSession({
        user: req.user.id,
        type: 'assistant',
        title: `${context} assistant chat`,
        prompt: message.trim(),
        context: {
          context,
          weakTopics: personalization.weakTopics.map((topic) => topic.label),
          suggestedQuizTopic: personalization.suggestedQuizTopic,
          practiceChecklist: buildPracticeChecklist(
            personalization.suggestedQuizTopic,
            personalization.recommendedProblems
          ),
        },
        messages: [],
        status: 'active',
      });
    } else {
      session.context = {
        ...(session.context || {}),
        context,
        weakTopics: personalization.weakTopics.map((topic) => topic.label),
        suggestedQuizTopic: personalization.suggestedQuizTopic,
        practiceChecklist: buildPracticeChecklist(
          personalization.suggestedQuizTopic,
          personalization.recommendedProblems
        ),
      };
    }

    session.messages.push({ role: 'user', content: message.trim() });
    session.messages.push({ role: 'assistant', content: reply });
    await session.save();

    return res.status(200).json({ session: formatSession(session), reply, personalization });
  } catch (err) {
    console.error('[assistantMessage]', err);
    return res.status(500).json({ message: 'Unable to get assistant reply.' });
  }
};

const startInterview = async (req, res) => {
  try {
    const personalization = await buildLearningSnapshot(req.user.id);
    const role = req.body.role || personalization.suggestedInterviewRole || 'Software Engineer';
    const focusAreas = uniqueStrings(
      req.body.focusAreas?.length
        ? req.body.focusAreas
        : personalization.suggestedFocusAreas
    );

    const fallbackPrompts = [
      `Tell me about a time you solved a difficult ${focusAreas[0] || 'technical'} problem.`,
      `How would you explain your approach to improving ${focusAreas[1] || 'a weak area'}?`,
      `What tradeoffs do you consider when designing a scalable system for a ${role} role?`,
    ];
    const prompts = await generateInterviewOpening({
      role,
      focusAreas,
      fallbackPrompts,
    });
    const targetRounds = 3;

    const session = await AiSession.create({
      user: req.user.id,
      type: 'interview',
      title: `${role} mock interview`,
      context: {
        role,
        focusAreas,
        providerEnabled: hasAiProvider(),
        targetRounds,
        currentRound: 1,
      },
      messages: prompts.map((prompt) => ({ role: 'assistant', content: prompt })),
      status: 'active',
    });

    return res.status(201).json({ session: formatSession(session), personalization });
  } catch (err) {
    console.error('[startInterview]', err);
    return res.status(500).json({ message: 'Unable to start interview.' });
  }
};

const respondInterview = async (req, res) => {
  try {
    const { answer = '' } = req.body;
    if (!answer.trim()) {
      return res.status(400).json({ message: 'Answer is required.' });
    }

    const session = await AiSession.findOne({ _id: req.params.id, user: req.user.id, type: 'interview' });

    if (!session) {
      return res.status(404).json({ message: 'Interview session not found.' });
    }

    session.messages.push({ role: 'user', content: answer.trim() });
    const fallbackReply =
      'Good structure. Tighten your answer by adding one measurable result, one tradeoff, and one lesson learned.';
    const feedback = await generateInterviewFeedback({
      role: session.context?.role || 'Software Engineer',
      focusAreas: session.context?.focusAreas || [],
      answer: answer.trim(),
      fallbackReply,
    });

    session.messages.push({
      role: 'assistant',
      content: feedback,
    });

    const answerStrength = Math.min(25, Math.max(10, Math.round(answer.trim().split(/\s+/).length / 8)));
    session.score = Math.min(100, session.score + answerStrength);
    const targetRounds = Number(session.context?.targetRounds || 3);
    const completedRounds = session.messages.filter((message) => message.role === 'user').length;

    if (session.score >= 70 || completedRounds >= targetRounds) {
      session.status = 'completed';
      session.messages.push({
        role: 'assistant',
        content: `Interview wrap-up: you finished ${completedRounds} round${completedRounds === 1 ? '' : 's'} with a current score of ${session.score}. Revisit ${session.context?.focusAreas?.[0] || 'your weakest area'} before your next mock session.`,
      });
      session.context = {
        ...(session.context || {}),
        currentRound: completedRounds,
        completedRounds,
      };
    } else {
      const nextRound = completedRounds + 1;
      const nextPrompt = buildInterviewPrompt({
        role: session.context?.role || 'Software Engineer',
        focusAreas: session.context?.focusAreas || [],
        round: nextRound,
      });
      session.messages.push({
        role: 'assistant',
        content: nextPrompt,
      });
      session.context = {
        ...(session.context || {}),
        currentRound: nextRound,
        completedRounds,
      };
    }
    await session.save();

    return res.status(200).json({ session: formatSession(session) });
  } catch (err) {
    console.error('[respondInterview]', err);
    return res.status(500).json({ message: 'Unable to continue interview session.' });
  }
};

module.exports = {
  getAiSummary,
  getAiPersonalization,
  getAiSession,
  generateQuiz,
  submitQuiz,
  assistantMessage,
  startInterview,
  respondInterview,
};
