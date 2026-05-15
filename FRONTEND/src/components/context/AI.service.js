import api from './Axiosinstance';

export const fetchAiSummary = async () => {
  const { data } = await api.get('/ai/summary');
  return data;
};

export const fetchAiPersonalization = async () => {
  const { data } = await api.get('/ai/personalization');
  return data;
};

export const fetchAiSession = async (id) => {
  const { data } = await api.get(`/ai/sessions/${id}`);
  return data;
};

export const generateAiQuiz = async (payload) => {
  const { data } = await api.post('/ai/quiz/generate', payload);
  return data;
};

export const submitAiQuiz = async (id, payload) => {
  const { data } = await api.post(`/ai/quiz/${id}/submit`, payload);
  return data;
};

export const sendAssistantMessage = async (payload) => {
  const { data } = await api.post('/ai/assistant/message', payload);
  return data;
};

export const startInterviewSession = async (payload) => {
  const { data } = await api.post('/ai/interview/session', payload);
  return data;
};

export const respondInterviewSession = async (id, payload) => {
  const { data } = await api.post(`/ai/interview/${id}/respond`, payload);
  return data;
};
