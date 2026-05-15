import api from './Axiosinstance';

export const fetchGamificationSummary = async () => {
  const { data } = await api.get('/gamification/summary');
  return data;
};

export const fetchLeaderboard = async () => {
  const { data } = await api.get('/gamification/leaderboard');
  return data;
};

export const activateStreakFreeze = async () => {
  const { data } = await api.post('/gamification/streak-freeze/activate');
  return data;
};
