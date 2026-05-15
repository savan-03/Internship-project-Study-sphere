import api from './Axiosinstance';

const unwrap = (response) => response?.data ?? response;

export const fetchSettingsSummary = async () => {
  const { data } = await api.get('/settings');
  return unwrap(data);
};

export const updatePrivacySettings = async (payload) => {
  const { data } = await api.patch('/settings/privacy', payload);
  return unwrap(data);
};

export const changePassword = async (payload) => {
  const { data } = await api.post('/settings/password/change', payload);
  return unwrap(data);
};

export const fetchAccountActivity = async () => {
  const { data } = await api.get('/settings/activity');
  return unwrap(data);
};

export const fetchActiveSessions = async () => {
  const { data } = await api.get('/settings/sessions');
  return unwrap(data);
};

export const revokeSession = async (sessionId) => {
  const { data } = await api.delete(`/settings/sessions/${sessionId}`);
  return unwrap(data);
};

export const revokeOtherSessions = async () => {
  const { data } = await api.post('/settings/sessions/revoke-others');
  return unwrap(data);
};

export const deactivateAccount = async (password) => {
  const { data } = await api.post('/settings/account/deactivate', { password });
  return unwrap(data);
};

export const deleteAccount = async (password) => {
  const { data } = await api.delete('/settings/account/delete', {
    data: { password },
  });
  return unwrap(data);
};
