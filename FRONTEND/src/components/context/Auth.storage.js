export const getStoredAccessToken = () =>
  localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';

export const getStoredAuthPersistence = () =>
  localStorage.getItem('authPersistence') ||
  sessionStorage.getItem('authPersistence') ||
  (localStorage.getItem('accessToken') ? 'local' : 'session');

export const persistAccessToken = (accessToken, storageMode = null) => {
  if (!accessToken) {
    return;
  }

  const nextStorageMode = storageMode || getStoredAuthPersistence();

  if (nextStorageMode === 'local') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('authPersistence', 'local');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('authPersistence');
    return;
  }

  sessionStorage.setItem('accessToken', accessToken);
  sessionStorage.setItem('authPersistence', 'session');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authPersistence');
};

export const clearPersistedAccessToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authPersistence');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('authPersistence');
};
