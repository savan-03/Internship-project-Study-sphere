import api from './Axiosinstance';

export const fetchNotifications = async (params = {}) => {
  const { data } = await api.get('/notifications', { params });
  return data;
};

export const readNotification = async (id) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const readAllNotifications = async () => {
  const { data } = await api.patch('/notifications/read-all');
  return data;
};

export const dismissNotification = async (id) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const clearReadNotifications = async () => {
  const { data } = await api.delete('/notifications/read');
  return data;
};

export const updateNotificationPreferences = async (payload) => {
  const { data } = await api.patch('/notifications/preferences', payload);
  return data;
};
