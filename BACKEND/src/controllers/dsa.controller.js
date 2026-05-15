const DsaProblem = require('../models/dsa-problem.model');
const DsaAttempt = require('../models/dsa-attempt.model');
const {
  ensureStarterProblems,
  evaluateAttemptStatus,
  buildRuntime,
  buildMemory,
  calculateScorePercent,
} = require('../services/dsa.service');
const { executeJavaScriptSolution } = require('../services/dsa-judge.service');
const { logUserActivity } = require('../services/activity.service');
const { createNotification } = require('../services/notification.service');

const formatProblem = (problem, attempt = null) => ({
  id: problem._id,
  title: problem.title,
  slug: problem.slug,
  difficulty: problem.difficulty,
  category: problem.category,
  topic: problem.topic || problem.category,
  tags: problem.tags || [],
  companyTags: problem.companyTags || [],
  patterns: problem.patterns || [],
  statement: problem.statement,
  constraints: problem.constraints || [],
  hints: problem.hints || [],
  examples: problem.examples || [],
  testCases: problem.testCases || [],
  starterCode: problem.starterCode || {},
  functionName: problem.functionName || 'solve',
  complexity: problem.complexity || { time: '', space: '' },
  estimatedMinutes: problem.estimatedMinutes || 20,
  editorial: problem.editorial || '',
  editorialSections: problem.editorialSections || [],
  videoResource: problem.videoResource || null,
  acceptanceRate: problem.acceptanceRate || 0,
  supportedLanguages: Object.keys(problem.starterCode || {}).filter((language) => problem.starterCode?.[language]),
  status: attempt?.status || 'todo',
  lastAttempt: attempt
    ? {
        id: attempt._id,
        language: attempt.language,
        status: attempt.status,
        scorePercent: attempt.scorePercent || 0,
        updatedAt: attempt.updatedAt,
      }
    : null,
});

const formatAttempt = (attempt) => ({
  id: attempt._id,
  language: attempt.language,
  code: attempt.code,
  status: attempt.status,
  runtime: attempt.runtime,
  memory: attempt.memory,
  notes: attempt.notes,
  testResults: attempt.testResults || [],
  publicPassedCount: attempt.publicPassedCount || 0,
  publicTotalTests: attempt.publicTotalTests || 0,
  passedCount: attempt.passedCount || 0,
  totalTests: attempt.totalTests || 0,
  hiddenPassedCount: attempt.hiddenPassedCount || 0,
  hiddenTotalTests: attempt.hiddenTotalTests || 0,
  scorePercent: attempt.scorePercent || 0,
  createdAt: attempt.createdAt,
  updatedAt: attempt.updatedAt,
  problem: attempt.problem
    ? {
        id: attempt.problem._id,
        title: attempt.problem.title,
        slug: attempt.problem.slug,
        difficulty: attempt.problem.difficulty,
        category: attempt.problem.category,
        topic: attempt.problem.topic || attempt.problem.category,
        companyTags: attempt.problem.companyTags || [],
      }
    : null,
});

const buildProblemGuidance = (problem, attempts = []) => {
  const latestAttempt = attempts[0] || null;
  const checklist = [
    `Start by restating the ${problem.topic || problem.category} pattern in one sentence.`,
    `Use the provided examples before touching the hidden tests.`,
    latestAttempt?.status === 'solved'
      ? 'Revisit the editorial only to compare tradeoffs, not to rewrite the same solution.'
      : `After each run, write one short note about what failed before changing the next version.`,
  ];

  return {
    checklist,
    focusAreas: problem.patterns?.length ? problem.patterns : [problem.topic || problem.category],
    recommendedLanguage: latestAttempt?.language || (Object.keys(problem.starterCode || {}).find(Boolean) || 'javascript'),
    note:
      latestAttempt?.status === 'solved'
        ? 'You already have a solved attempt here. Use this workspace to improve clarity, complexity, or interview explanation.'
        : 'Treat this like an interview loop: run public tests first, then tighten one issue at a time.',
  };
};

const buildExecutionInsight = (execution, problem) => {
  if (!execution.supported) {
    return {
      headline: execution.message,
      nextStep: 'Switch to JavaScript for live execution, or keep saving draft attempts in your preferred language.',
      failingHighlights: [],
    };
  }

  const failingHighlights = (execution.publicResults || [])
    .filter((item) => !item.passed)
    .slice(0, 2)
    .map((item) => ({
      index: item.index,
      expectedOutput: item.expectedOutput,
      actualOutput: item.actualOutput,
      error: item.error || '',
    }));

  const nextStep = execution.allPassed
    ? `All visible checks passed. Save this ${problem.topic || problem.category} solution and compare it with the editorial tradeoffs.`
    : failingHighlights.length
      ? `Review public test ${failingHighlights[0].index} and check how your ${problem.patterns?.[0] || problem.topic || problem.category} logic handles that edge case.`
      : `You passed ${execution.passedCount}/${execution.totalTests} checks. Keep the same pattern and fix one failing branch before the next run.`;

  return {
    headline: execution.allPassed
      ? 'Strong run. The visible and hidden checks passed together.'
      : 'The runner finished. Focus on one failing branch before changing the whole solution.',
    nextStep,
    failingHighlights,
  };
};

const listProblems = async (req, res) => {
  try {
    await ensureStarterProblems();

    const { difficulty, category, topic, company, search, status } = req.query;
    const query = {};

    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (category && category !== 'all') query.category = category;
    if (topic && topic !== 'all') query.topic = topic;
    if (company && company !== 'all') query.companyTags = company;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
        { companyTags: { $regex: search, $options: 'i' } },
        { patterns: { $regex: search, $options: 'i' } },
      ];
    }

    const problems = await DsaProblem.find(query).sort({ order: 1, createdAt: 1 });
    const attempts = req.user
      ? await DsaAttempt.find({ user: req.user.id, problem: { $in: problems.map((problem) => problem._id) } }).sort({ updatedAt: -1 })
      : [];

    const attemptMap = {};
    attempts.forEach((attempt) => {
      const key = String(attempt.problem);
      if (!attemptMap[key]) {
        attemptMap[key] = attempt;
      }
    });

    let results = problems.map((problem) => formatProblem(problem, attemptMap[String(problem._id)]));

    if (status && status !== 'all') {
      results = results.filter((problem) => {
        if (status === 'solved') return problem.lastAttempt?.status === 'solved';
        if (status === 'attempted') return ['attempted', 'draft'].includes(problem.lastAttempt?.status);
        if (status === 'todo') return !problem.lastAttempt;
        return true;
      });
    }

    const categories = [...new Set(problems.map((problem) => problem.category))].sort();
    const topics = [...new Set(problems.map((problem) => problem.topic || problem.category))].sort();
    const companies = [...new Set(problems.flatMap((problem) => problem.companyTags || []))].sort();

    return res.status(200).json({
      problems: results,
      categories,
      topics,
      companies,
      summary: {
        total: results.length,
        solved: results.filter((problem) => problem.status === 'solved').length,
        attempted: results.filter((problem) => ['attempted', 'draft'].includes(problem.status)).length,
        todo: results.filter((problem) => problem.status === 'todo').length,
      },
    });
  } catch (err) {
    console.error('[listProblems]', err);
    return res.status(500).json({ message: 'Unable to fetch DSA problems.' });
  }
};

const getProblemBySlug = async (req, res) => {
  try {
    await ensureStarterProblems();
    const problem = await DsaProblem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found.' });
    }

    let attempt = null;
    let attempts = [];
    if (req.user) {
      attempts = await DsaAttempt.find({ user: req.user.id, problem: problem._id })
        .sort({ updatedAt: -1 })
        .limit(12)
        .populate('problem', 'title slug difficulty category topic companyTags');
      attempt = attempts[0] || null;
    }

    const relatedProblems = await DsaProblem.find({
      _id: { $ne: problem._id },
      $or: [
        { category: problem.category },
        { topic: problem.topic || problem.category },
        { companyTags: { $in: problem.companyTags || [] } },
      ],
    })
      .sort({ difficulty: 1, order: 1 })
      .limit(4);

    return res.status(200).json({
      problem: formatProblem(problem, attempt),
      attempts: attempts.map(formatAttempt),
      relatedProblems: relatedProblems.map((item) => formatProblem(item, null)),
      guidance: buildProblemGuidance(problem, attempts),
    });
  } catch (err) {
    console.error('[getProblemBySlug]', err);
    return res.status(500).json({ message: 'Unable to fetch this DSA problem.' });
  }
};

const submitAttempt = async (req, res) => {
  try {
    const { language = 'javascript', code = '', notes = '' } = req.body;
    if (!code.trim()) {
      return res.status(400).json({ message: 'Code is required.' });
    }

    const problem = await DsaProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found.' });
    }

    let status = evaluateAttemptStatus(problem, code, notes);
    let runtime = buildRuntime(status);
    let memory = buildMemory(status);
    let testResults = [];
    let publicPassedCount = 0;
    let publicTotalTests = 0;
    let passedCount = 0;
    let totalTests = 0;
    let hiddenPassedCount = 0;
    let hiddenTotalTests = 0;
    let scorePercent = 0;

    if (language === 'javascript') {
      try {
        const execution = executeJavaScriptSolution({
          code,
          functionName: problem.functionName,
          publicTests: problem.testCases || [],
          hiddenTests: problem.hiddenTests || [],
        });
        testResults = execution.publicResults;
        publicPassedCount = execution.publicPassedCount;
        publicTotalTests = execution.publicTotalTests;
        passedCount = execution.passedCount;
        totalTests = execution.totalTests;
        hiddenPassedCount = execution.hiddenPassedCount;
        hiddenTotalTests = execution.hiddenTotalTests;
        scorePercent = calculateScorePercent({
          passedCount: execution.passedCount,
          totalTests: execution.totalTests,
        });
        status = execution.allPassed ? 'solved' : 'attempted';
        runtime = execution.allPassed ? `${Math.floor(Math.random() * 16) + 8} ms` : '';
        memory = execution.allPassed ? `${Math.floor(Math.random() * 10) + 32} MB` : '';
      } catch (judgeError) {
        testResults = [
          {
            index: 1,
            visibility: 'public',
            passed: false,
            actualOutput: '',
            expectedOutput: '',
            error: judgeError.message,
          },
        ];
        publicTotalTests = 1;
        totalTests = 1;
        passedCount = 0;
        scorePercent = 0;
        status = 'attempted';
      }
    }

    const attempt = await DsaAttempt.create({
      user: req.user.id,
      problem: problem._id,
      language,
      code,
      notes,
      status,
      runtime,
      memory,
      testResults,
      publicPassedCount,
      publicTotalTests,
      passedCount,
      totalTests,
      hiddenPassedCount,
      hiddenTotalTests,
      scorePercent,
    });

    const action = status === 'solved' ? 'review_added' : 'comment_added';
    await logUserActivity(req.user.id, action, {
      label: status === 'solved' ? 'Solved a DSA problem' : 'Worked on a DSA problem',
      metadata: {
        problemId: problem._id,
        problemTitle: problem.title,
        status,
      },
      pointsAwarded: status === 'solved' ? 12 : 4,
    });

    await createNotification({
      recipient: req.user.id,
      type: status === 'solved' ? 'dsa_solved' : 'dsa_attempted',
      title: status === 'solved' ? 'Problem solved' : 'Attempt saved',
      message:
        status === 'solved'
          ? `Great work. You solved ${problem.title}.`
          : `Your latest attempt for ${problem.title} has been saved.`,
      link: `/dsa/practice/${problem.slug}`,
      metadata: {
        problemId: problem._id,
        status,
      },
    });

    const populatedAttempt = await DsaAttempt.findById(attempt._id).populate(
      'problem',
      'title slug difficulty category topic companyTags'
    );

    return res.status(201).json({ attempt: formatAttempt(populatedAttempt) });
  } catch (err) {
    console.error('[submitAttempt]', err);
    return res.status(500).json({ message: 'Unable to save this attempt.' });
  }
};

const executeAttempt = async (req, res) => {
  try {
    const { language = 'javascript', code = '' } = req.body;
    const problem = await DsaProblem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found.' });
    }
    if (language !== 'javascript') {
      return res.status(200).json({
        supported: false,
        message: 'Live test execution is currently available for JavaScript in this local build.',
        results: [],
        passedCount: 0,
        totalTests: 0,
        hiddenPassedCount: 0,
        hiddenTotalTests: 0,
        supportedLanguages: ['javascript'],
      });
    }

    const execution = executeJavaScriptSolution({
      code,
      functionName: problem.functionName,
      publicTests: problem.testCases || [],
      hiddenTests: problem.hiddenTests || [],
    });

    return res.status(200).json({
      supported: true,
      passedCount: execution.passedCount,
      totalTests: execution.totalTests,
      publicPassedCount: execution.publicPassedCount,
      publicTotalTests: execution.publicTotalTests,
      hiddenPassedCount: execution.hiddenPassedCount,
      hiddenTotalTests: execution.hiddenTotalTests,
      results: execution.publicResults,
      allPassed: execution.allPassed,
      scorePercent: calculateScorePercent({
        passedCount: execution.passedCount,
        totalTests: execution.totalTests,
      }),
      executionHeadline: execution.allPassed
        ? 'All public and hidden checks passed.'
        : `${execution.passedCount}/${execution.totalTests} checks passed. Review the failing cases and iterate.`,
      supportedLanguages: ['javascript'],
      insight: buildExecutionInsight(execution, problem),
    });
  } catch (err) {
    console.error('[executeAttempt]', err);
    return res.status(400).json({ message: err.message || 'Unable to execute code.' });
  }
};

const getMyAttempts = async (req, res) => {
  try {
    const attempts = await DsaAttempt.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .populate('problem', 'title slug difficulty category topic companyTags');

    const formattedAttempts = attempts.map(formatAttempt);

    return res.status(200).json({
      attempts: formattedAttempts,
      summary: {
        total: formattedAttempts.length,
        solved: formattedAttempts.filter((attempt) => attempt.status === 'solved').length,
        attempted: formattedAttempts.filter((attempt) => attempt.status === 'attempted').length,
        drafts: formattedAttempts.filter((attempt) => attempt.status === 'draft').length,
      },
    });
  } catch (err) {
    console.error('[getMyAttempts]', err);
    return res.status(500).json({ message: 'Unable to fetch your attempts.' });
  }
};

const getMyDsaStats = async (req, res) => {
  try {
    await ensureStarterProblems();
    const [attempts, totalProblems] = await Promise.all([
      DsaAttempt.find({ user: req.user.id })
        .sort({ updatedAt: -1 })
        .populate('problem', 'difficulty category topic companyTags'),
      DsaProblem.countDocuments(),
    ]);

    const latestByProblem = new Map();
    attempts.forEach((attempt) => {
      const key = String(attempt.problem?._id || attempt.problem);
      if (!latestByProblem.has(key)) {
        latestByProblem.set(key, attempt);
      }
    });

    const latestAttempts = [...latestByProblem.values()];
    const solved = latestAttempts.filter((attempt) => attempt.status === 'solved');
    const attempted = latestAttempts.filter((attempt) => ['attempted', 'draft'].includes(attempt.status));

    const difficultyProgress = ['easy', 'medium', 'hard'].map((difficulty) => ({
      label: difficulty,
      solved: solved.filter((attempt) => attempt.problem?.difficulty === difficulty).length,
    }));

    const categoryMap = {};
    latestAttempts.forEach((attempt) => {
      const category = attempt.problem?.category || 'General';
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const topicMap = {};
    latestAttempts.forEach((attempt) => {
      const topic = attempt.problem?.topic || attempt.problem?.category || 'General';
      topicMap[topic] = (topicMap[topic] || 0) + 1;
    });

    return res.status(200).json({
      stats: {
        totalProblems,
        solvedCount: solved.length,
        attemptedCount: attempted.length,
        accuracy: latestAttempts.length ? Math.round((solved.length / latestAttempts.length) * 100) : 0,
      },
      difficultyProgress,
      categoryProgress: Object.entries(categoryMap).map(([label, value]) => ({ label, value })),
      topicProgress: Object.entries(topicMap).map(([label, value]) => ({ label, value })),
    });
  } catch (err) {
    console.error('[getMyDsaStats]', err);
    return res.status(500).json({ message: 'Unable to fetch DSA stats.' });
  }
};

module.exports = {
  listProblems,
  getProblemBySlug,
  submitAttempt,
  executeAttempt,
  getMyAttempts,
  getMyDsaStats,
};
