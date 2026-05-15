import api from './Axiosinstance';
import {
  clearPersistedAccessToken,
  persistAccessToken,
} from './Auth.storage';

const unwrap = (responseBody) => responseBody?.data ?? responseBody;

export { persistAccessToken, clearPersistedAccessToken };

export const registerUser = async ({
  fullName,
  username,
  email,
  password,
  confirmPassword,
  acceptTerms,
}) => {
  const { data } = await api.post('/auth/register', {
    fullName,
    username,
    email,
    password,
    confirmPassword,
    acceptTerms,
  });

  return unwrap(data);
};

export const loginUser = async ({ email, password, rememberMe }) => {
  const { data } = await api.post('/auth/login', { email, password, rememberMe });
  return unwrap(data);
};

export const logoutUser = async () => {
  const { data } = await api.post('/auth/logout', {}, {
    skipAuthRefresh: true,
  });
  return unwrap(data);
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return unwrap(data);
};

export const refreshSession = async () => {
  const { data } = await api.post('/auth/refresh', {}, {
    skipAuthRefresh: true,
  });

  return unwrap(data);
};

export const getProfileSummary = async () => {
  const { data } = await api.get('/auth/profile/summary');
  return unwrap(data);
};

export const getUserProfileSummaryById = async (userId) => {
  const { data } = await api.get(`/auth/profile/${userId}`);
  return unwrap(data);
};

export const updateProfile = async (profileData) => {
  const { data } = await api.patch('/auth/profile', profileData);
  return unwrap(data);
};

export const oauthLogin = async ({
  provider,
  oauthId,
  email,
  fullName,
  profilePicture,
}) => {
  const { data } = await api.post('/auth/oauth', {
    provider,
    oauthId,
    email,
    fullName,
    profilePicture,
  });

  return unwrap(data);
};
