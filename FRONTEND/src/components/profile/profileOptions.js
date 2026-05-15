export const skillOptions = [
  'JavaScript',
  'Python',
  'Java',
  'C++',
  'React',
  'Node.js',
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'SQL',
  'System Design',
  'Cloud Computing',
  'DevOps',
  'Docker',
  'Kubernetes',
];

export const interestOptions = [
  'Web Development',
  'Mobile Apps',
  'AI/ML',
  'Data Science',
  'Cloud Computing',
  'DevOps',
  'Cybersecurity',
  'Game Development',
  'Open Source',
  'Competitive Programming',
];

export const learningGoalOptions = [
  'Get a job in tech',
  'Switch career to tech',
  'Prepare for interviews',
  'Learn new skills',
  'Advance in current role',
  'Start my own project',
  'Get certified',
  'Build portfolio',
];

export const dailyStudyHourOptions = ['<1', '1-2', '2-3', '3-4', '4-5', '5+'];

export const experienceOptions = ['0-1', '1-3', '3-5', '5-8', '8+'];

export const calculateProfileCompletion = (profile = {}) => {
  const checks = [
    profile.fullName,
    profile.username,
    profile.email,
    profile.bio,
    profile.location,
    profile.currentRole,
    profile.targetRole,
    profile.careerGoal,
    profile.dailyStudyHours,
    profile.skills?.length,
    profile.interests?.length,
    profile.learningGoals?.length,
    profile.socialHeadline,
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};
