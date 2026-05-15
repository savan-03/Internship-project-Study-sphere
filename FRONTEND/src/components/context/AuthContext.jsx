/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
  refreshSession,
  updateProfile as updateProfileRequest,
  persistAccessToken,
  clearPersistedAccessToken,
} from './Auth.service';
import { getStoredAccessToken, getStoredAuthPersistence } from './Auth.storage';

const AuthContext = createContext(null);

const normalizeUser = (user) => {
  if (!user) return null;

  const baseName = user.fullName || user.name || '';
  const profile = user.profile || {};
  const socialProfile = user.socialProfile || {};

  return {
    ...user,
    id: user._id || user.id,
    name: baseName,
    fullName: baseName,
    profileSetupCompleted: Boolean(user.profileSetupCompleted),
    website: profile.website || user.website || '',
    phone: profile.phone || user.phone || '',
    socialProfile: {
      headline: socialProfile.headline || '',
      mentorBio: socialProfile.mentorBio || '',
      openToMentoring: Boolean(socialProfile.openToMentoring),
      openToCollaboration: socialProfile.openToCollaboration !== false,
    },
    profile: {
      bio: profile.bio || user.bio || '',
      location: profile.location || user.location || '',
      skills: profile.skills || user.skills || [],
      interests: profile.interests || user.interests || [],
      learningGoals: profile.learningGoals || user.learningGoals || [],
      dailyStudyHours: profile.dailyStudyHours || user.dailyStudyHours || '',
      currentRole: profile.currentRole || user.currentRole || '',
      yearsOfExperience: profile.yearsOfExperience || user.yearsOfExperience || '',
      targetRole: profile.targetRole || user.targetRole || '',
      careerGoal: profile.careerGoal || user.careerGoal || '',
      profileType: profile.profileType || user.profileType || 'user',
      website: profile.website || user.website || '',
      phone: profile.phone || user.phone || '',
    },
    stats: user.stats || {
      points: 0,
      streak: 0,
      level: 'Beginner',
    },
    avatar: user.avatar || (baseName ? baseName.slice(0, 2).toUpperCase() : 'SS'),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restoreCurrentUser = useCallback(async () => {
    const storedToken = getStoredAccessToken();
    const storageMode = getStoredAuthPersistence();
    let sessionData = null;
    let refreshData = null;

    try {
      sessionData = await getMe();
    } catch {
      refreshData = await refreshSession();
      if (refreshData?.accessToken) {
        persistAccessToken(
          refreshData.accessToken,
          refreshData?.session?.persistence || (storedToken ? storageMode : undefined)
        );
      }
      sessionData = await getMe();
    }

    if (sessionData?.accessToken) {
      persistAccessToken(
        sessionData.accessToken,
        refreshData?.session?.persistence || (storedToken ? storageMode : undefined)
      );
    }

    const nextUser = normalizeUser(sessionData?.user);
    setUser(nextUser);
    setError(null);
    return nextUser;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await restoreCurrentUser();
      } catch {
        clearPersistedAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [restoreCurrentUser]);

  useEffect(() => {
    const handleSessionExpired = () => {
      clearPersistedAccessToken();
      setUser(null);
      setError('Your session expired. Please sign in again.');
    };

    window.addEventListener('auth:session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
  }, []);

  const login = useCallback(async ({ email, password, rememberMe }) => {
    setError(null);
    const data = await loginUser({ email, password, rememberMe });
    persistAccessToken(data.accessToken, data?.session?.persistence || (rememberMe ? 'local' : 'session'));
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    const data = await registerUser(formData);
    persistAccessToken(data.accessToken, data?.session?.persistence || 'session');
    const nextUser = normalizeUser(data.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch {
      // ignore logout transport errors and clear session locally
    }
    clearPersistedAccessToken();
    setUser(null);
    setError(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    setError(null);
    const { user: updatedUser } = await updateProfileRequest(profileData);
    const nextUser = normalizeUser(updatedUser);
    setUser(nextUser);
    return nextUser;
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    login,
    register,
    logout,
    updateProfile,
    reloadCurrentUser: restoreCurrentUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isModerator: user?.role === 'moderator',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
