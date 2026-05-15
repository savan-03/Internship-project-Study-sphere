import axios from 'axios';
import {
  clearPersistedAccessToken,
  getStoredAccessToken,
  persistAccessToken,
} from './Auth.storage';

const rawBaseUrl = import.meta.env.VITE_API_URL;
const normalizedBaseUrl = typeof rawBaseUrl === 'string' ? rawBaseUrl.trim() : '';
const API_ROOT = normalizedBaseUrl
  ? `${normalizedBaseUrl.replace(/\/$/, '')}/api`
  : '/api';

const api = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

const extractAccessToken = (payload) =>
  payload?.data?.accessToken || payload?.accessToken || null;

const resolvePersistence = (headers = {}, fallback = null) => {
  const headerValue = headers?.['x-session-persistence'];
  if (headerValue === 'local' || headerValue === 'session') {
    return headerValue;
  }
  return fallback;
};

const queueRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post('/auth/refresh')
      .then((response) => {
        const refreshedToken = extractAccessToken(response.data);
        if (!refreshedToken) {
          throw new Error('Unable to refresh access token');
        }

        persistAccessToken(
          refreshedToken,
          resolvePersistence(response.headers, response.data?.data?.session?.persistence || response.data?.session?.persistence || null)
        );
        return refreshedToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const refreshedToken =
      response.headers?.['x-access-token'] || extractAccessToken(response.data);

    if (refreshedToken) {
      persistAccessToken(
        refreshedToken,
        resolvePersistence(response.headers, response.data?.data?.session?.persistence || response.data?.session?.persistence || null)
      );
    }

    return response;
  },
  async (error) => {
    const nestedMessage = error.response?.data?.error?.message;
    if (nestedMessage) {
      error.response.data.message = nestedMessage;
      error.message = nestedMessage;
    }

    const originalRequest = error.config || {};
    const shouldSkipRefresh = originalRequest.skipAuthRefresh || originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true;

      try {
        const refreshedToken = await queueRefresh();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearPersistedAccessToken();
        window.dispatchEvent(new Event('auth:session-expired'));
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 401 && !shouldSkipRefresh) {
      clearPersistedAccessToken();
      window.dispatchEvent(new Event('auth:session-expired'));
    }

    return Promise.reject(error);
  }
);

export default api;
