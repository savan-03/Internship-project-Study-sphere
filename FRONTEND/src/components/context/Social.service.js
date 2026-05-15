import api from './Axiosinstance';

export const fetchSocialSummary = async () => {
  const { data } = await api.get('/social/summary');
  return data;
};

export const fetchNetworkOverview = async () => {
  const { data } = await api.get('/social/network');
  return data;
};

export const fetchActivityFeed = async () => {
  const { data } = await api.get('/social/feed');
  return data;
};

export const toggleFollowUser = async (userId) => {
  const { data } = await api.post(`/social/follow/${userId}`);
  return data;
};

export const fetchDirectInbox = async () => {
  const { data } = await api.get('/social/direct');
  return data;
};

export const fetchDirectMessages = async (userId) => {
  const { data } = await api.get(`/social/direct/${userId}/messages`);
  return data;
};

export const sendDirectMessage = async (userId, payload) => {
  const { data } = await api.post(`/social/direct/${userId}/messages`, payload);
  return data;
};

export const fetchGroups = async () => {
  const { data } = await api.get('/social/groups');
  return data;
};

export const createGroup = async (payload) => {
  const { data } = await api.post('/social/groups', payload);
  return data;
};

export const joinGroup = async (id) => {
  const { data } = await api.post(`/social/groups/${id}/join`);
  return data;
};

export const leaveGroup = async (id) => {
  const { data } = await api.post(`/social/groups/${id}/leave`);
  return data;
};

export const addGroupPost = async (id, payload) => {
  const { data } = await api.post(`/social/groups/${id}/posts`, payload);
  return data;
};

export const fetchGroupMessages = async (id, params = {}) => {
  const { data } = await api.get(`/social/groups/${id}/messages`, { params });
  return data;
};

export const fetchThreads = async () => {
  const { data } = await api.get('/social/forums');
  return data;
};

export const createThread = async (payload) => {
  const { data } = await api.post('/social/forums', payload);
  return data;
};

export const replyThread = async (id, payload) => {
  const { data } = await api.post(`/social/forums/${id}/replies`, payload);
  return data;
};

export const upvoteThread = async (id) => {
  const { data } = await api.post(`/social/forums/${id}/upvote`);
  return data;
};

export const fetchMentorship = async () => {
  const { data } = await api.get('/social/mentorship');
  return data;
};

export const createMentorship = async (payload) => {
  const { data } = await api.post('/social/mentorship', payload);
  return data;
};

export const acceptMentorship = async (id) => {
  const { data } = await api.post(`/social/mentorship/${id}/accept`);
  return data;
};

export const closeMentorship = async (id) => {
  const { data } = await api.post(`/social/mentorship/${id}/close`);
  return data;
};
