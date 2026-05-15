import api from './Axiosinstance';

export const fetchMyAnalytics = async () => {
  const { data } = await api.get('/analytics/me');
  return data;
};

export const fetchAdminAnalytics = async () => {
  const { data } = await api.get('/analytics/admin');
  return data;
};

const triggerDownload = (blob, filename) => {
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
};

const parseFilename = (headerValue, fallbackName) => {
  const match = headerValue?.match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallbackName;
};

export const downloadMyAnalyticsExport = async () => {
  const response = await api.get('/analytics/me/export', { responseType: 'blob' });
  const filename = parseFilename(response.headers?.['content-disposition'], 'studysphere-analytics.md');
  triggerDownload(response.data, filename);
};

export const downloadAdminAnalyticsExport = async () => {
  const response = await api.get('/analytics/admin/export', { responseType: 'blob' });
  const filename = parseFilename(response.headers?.['content-disposition'], 'studysphere-admin-analytics.md');
  triggerDownload(response.data, filename);
};
