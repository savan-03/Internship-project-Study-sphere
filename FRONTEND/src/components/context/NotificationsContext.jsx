import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import {
  clearReadNotifications,
  dismissNotification,
  fetchNotifications,
  readAllNotifications,
  readNotification,
  updateNotificationPreferences,
} from './Notifications.service';

const NotificationsContext = createContext(null);

const emptySummary = {
  total: 0,
  unread: 0,
  countsByCategory: {
    system: 0,
    resources: 0,
    social: 0,
    dsa: 0,
    ai: 0,
  },
  unreadByCategory: {
    system: 0,
    resources: 0,
    social: 0,
    dsa: 0,
    ai: 0,
  },
};

const buildLocalSummary = (items = []) => {
  const next = JSON.parse(JSON.stringify(emptySummary));
  next.total = items.length;

  items.forEach((item) => {
    const category = item.category || 'system';
    next.countsByCategory[category] = (next.countsByCategory[category] || 0) + 1;
    if (!item.isRead) {
      next.unread += 1;
      next.unreadByCategory[category] = (next.unreadByCategory[category] || 0) + 1;
    }
  });

  return next;
};

const buildLocalCategories = (summary) =>
  Object.keys(summary.countsByCategory).map((key) => ({
    id: key,
    total: summary.countsByCategory[key] || 0,
    unread: summary.unreadByCategory[key] || 0,
  }));

const getTopCategory = (counts = {}) => {
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top?.[1] ? { id: top[0], total: top[1] } : null;
};

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reminderCards, setReminderCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [digestSummary, setDigestSummary] = useState(null);

  const loadNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) {
      setNotifications([]);
      setPreferences(null);
      setSummary(null);
      setReminderCards([]);
      setCategories([]);
      setDigestSummary(null);
      return;
    }

    setNotificationsLoading(true);
    try {
      const data = await fetchNotifications(params);
      setNotifications(data.notifications || []);
      setSummary(data.summary || null);
      setReminderCards(data.reminderCards || []);
      setCategories(data.categories || []);
      setDigestSummary(data.digestSummary || null);
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch {
      setNotifications([]);
      setPreferences(null);
      setSummary(null);
      setReminderCards([]);
      setCategories([]);
      setDigestSummary(null);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!loading) {
      loadNotifications();
    }
  }, [loading, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, loadNotifications]);

  const syncDerivedState = useCallback((items) => {
    const nextSummary = buildLocalSummary(items);
    setSummary(nextSummary);
    setCategories(buildLocalCategories(nextSummary));
    setDigestSummary((current) => current ? {
      ...current,
      total: nextSummary.total,
      unread: nextSummary.unread,
      busiestCategory: getTopCategory(nextSummary.countsByCategory),
      unreadPriority: getTopCategory(nextSummary.unreadByCategory),
    } : current);
  }, []);

  const markAsRead = useCallback(async (id) => {
    const previous = notifications;
    const next = notifications.map((item) => (item.id === id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item));
    setNotifications(next);
    syncDerivedState(next);

    try {
      await readNotification(id);
    } catch {
      setNotifications(previous);
      syncDerivedState(previous);
    }
  }, [notifications, syncDerivedState]);

  const markAllAsRead = useCallback(async () => {
    const previous = notifications;
    const next = notifications.map((item) => ({ ...item, isRead: true, readAt: item.readAt || new Date().toISOString() }));
    setNotifications(next);
    syncDerivedState(next);

    try {
      await readAllNotifications();
    } catch {
      setNotifications(previous);
      syncDerivedState(previous);
    }
  }, [notifications, syncDerivedState]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const savePreferences = useCallback(async (payload) => {
    const { preferences: nextPreferences } = await updateNotificationPreferences(payload);
    setPreferences(nextPreferences);
    setDigestSummary((current) => current ? {
      ...current,
      enabled: nextPreferences?.digest !== false,
      frequency: nextPreferences?.digestFrequency || 'daily',
      quietHours: nextPreferences?.doNotDisturb ? {
        start: nextPreferences?.quietHoursStart || '22:00',
        end: nextPreferences?.quietHoursEnd || '07:00',
      } : null,
    } : current);
    return nextPreferences;
  }, []);

  const dismiss = useCallback(async (id) => {
    const previous = notifications;
    const next = notifications.filter((item) => item.id !== id);
    setNotifications(next);
    syncDerivedState(next);
    try {
      await dismissNotification(id);
      await loadNotifications();
    } catch {
      setNotifications(previous);
      syncDerivedState(previous);
    }
  }, [loadNotifications, notifications, syncDerivedState]);

  const clearRead = useCallback(async () => {
    const previous = notifications;
    const next = notifications.filter((item) => !item.isRead);
    setNotifications(next);
    syncDerivedState(next);
    try {
      await clearReadNotifications();
      await loadNotifications();
    } catch {
      setNotifications(previous);
      syncDerivedState(previous);
    }
  }, [loadNotifications, notifications, syncDerivedState]);

  const value = {
    notifications,
    notificationsLoading,
    unreadCount,
    preferences,
    summary,
    reminderCards,
    categories,
    digestSummary,
    refreshNotifications: loadNotifications,
    markAsRead,
    markAllAsRead,
    savePreferences,
    dismissNotification: dismiss,
    clearReadNotifications: clearRead,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within <NotificationsProvider>');
  }
  return context;
};
