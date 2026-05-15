import api from './Axiosinstance';

export const fetchDsaProblems = async (params = {}) => {
  const { data } = await api.get('/dsa/problems', { params });
  return data;
};

export const fetchDsaProblem = async (slug) => {
  const { data } = await api.get(`/dsa/problems/${slug}`);
  return data;
};

export const submitDsaAttempt = async (problemId, payload) => {
  const { data } = await api.post(`/dsa/problems/${problemId}/attempts`, payload);
  return data;
};

export const executeDsaAttempt = async (problemId, payload) => {
  const { data } = await api.post(`/dsa/problems/${problemId}/execute`, payload);
  return data;
};

export const fetchMyDsaAttempts = async () => {
  const { data } = await api.get('/dsa/attempts/me');
  return data;
};

export const fetchMyDsaStats = async () => {
  const { data } = await api.get('/dsa/stats/me');
  return data;
};
