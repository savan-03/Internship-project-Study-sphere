import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { activateStreakFreeze, fetchGamificationSummary, fetchLeaderboard } from './Gamification.service';

const GamificationContext = createContext(null);

export const GamificationProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [gamificationLoading, setGamificationLoading] = useState(false);
  const [streakFreezeLoading, setStreakFreezeLoading] = useState(false);

  const loadGamification = useCallback(async () => {
    setGamificationLoading(true);
    try {
      const [leaderboardData, summaryData] = await Promise.all([
        fetchLeaderboard(),
        isAuthenticated ? fetchGamificationSummary() : Promise.resolve(null),
      ]);

      setLeaderboard(leaderboardData.leaderboard || []);
      setSummary(summaryData);
    } catch {
      setLeaderboard([]);
      setSummary(null);
    } finally {
      setGamificationLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) {
      loadGamification();
    }
  }, [loading, loadGamification]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadGamification();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loadGamification]);

  const value = useMemo(() => ({
    summary,
    leaderboard,
    gamificationLoading,
    streakFreezeLoading,
    refreshGamification: loadGamification,
    activateStreakFreeze: async () => {
      setStreakFreezeLoading(true);
      try {
        const data = await activateStreakFreeze();
        if (data.summary) {
          setSummary(data.summary);
        } else {
          await loadGamification();
        }
        return data;
      } finally {
        setStreakFreezeLoading(false);
      }
    },
  }), [summary, leaderboard, gamificationLoading, streakFreezeLoading, loadGamification]);

  return <GamificationContext.Provider value={value}>{children}</GamificationContext.Provider>;
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within <GamificationProvider>');
  }
  return context;
};
