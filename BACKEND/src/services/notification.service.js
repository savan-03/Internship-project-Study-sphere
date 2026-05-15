const Notification = require('../models/notification.model');
const User = require('../models/user.model');

const mapNotificationCategory = (type = '') => {
  if (['register', 'login', 'profile_update', 'role_update', 'account_status'].includes(type)) {
    return 'system';
  }
  if (type.startsWith('resource') || type.includes('review') || type.includes('comment') || type.includes('collection') || type.includes('bookmark')) {
    return 'resources';
  }
  if (type.startsWith('social')) {
    return 'social';
  }
  if (type.startsWith('dsa')) {
    return 'dsa';
  }
  if (type.startsWith('ai')) {
    return 'ai';
  }
  return 'system';
};

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  link = '',
  metadata = {},
}) => {
  if (!recipient || !type || !title || !message) {
    return null;
  }

  const user = await User.findById(recipient).select('notificationPreferences');
  const preferences = user?.notificationPreferences;
  const category = mapNotificationCategory(type);

  if (preferences?.inApp === false) {
    return null;
  }

  if (preferences?.categories && preferences.categories[category] === false) {
    return null;
  }

  return Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    metadata,
  });
};

const serializeNotification = (notification) => ({
  id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  link: notification.link,
  metadata: notification.metadata || {},
  isRead: Boolean(notification.isRead),
  readAt: notification.readAt,
  createdAt: notification.createdAt,
});

const buildNotificationSummary = (notifications = []) => {
  const countsByCategory = {
    system: 0,
    resources: 0,
    social: 0,
    dsa: 0,
    ai: 0,
  };
  const unreadByCategory = {
    system: 0,
    resources: 0,
    social: 0,
    dsa: 0,
    ai: 0,
  };

  notifications.forEach((notification) => {
    const category = mapNotificationCategory(notification.type);
    countsByCategory[category] = (countsByCategory[category] || 0) + 1;
    if (!notification.isRead) {
      unreadByCategory[category] = (unreadByCategory[category] || 0) + 1;
    }
  });

  return {
    total: notifications.length,
    unread: notifications.filter((item) => !item.isRead).length,
    countsByCategory,
    unreadByCategory,
  };
};

const buildReminderCards = (notifications = [], preferences = null) => {
  const unread = notifications.filter((item) => !item.isRead);
  const cards = [];
  const summary = buildNotificationSummary(notifications);

  if (unread.length) {
    cards.push({
      id: 'unread-review',
      title: 'Clear your unread queue',
      message: `${unread.length} unread notification${unread.length === 1 ? '' : 's'} still need your attention.`,
      actionLabel: 'Review unread',
      route: '/notifications',
      tone: 'blue',
    });
  }

  if (preferences?.studyReminders !== false) {
    const dsaUnread = summary.unreadByCategory.dsa || 0;
    cards.push({
      id: 'study-reminder',
      title: 'Study reminder is active',
      message: dsaUnread
        ? `You have ${dsaUnread} DSA update${dsaUnread === 1 ? '' : 's'} waiting before your ${preferences?.reminderHour || '19:00'} study block.`
        : `Your reminder window is set for around ${preferences?.reminderHour || '19:00'}.`,
      actionLabel: dsaUnread ? 'Open DSA practice' : 'Open AI plan',
      route: dsaUnread ? '/dsa/practice' : '/ai',
      tone: 'violet',
    });
  }

  if (preferences?.digest !== false) {
    cards.push({
      id: 'digest-card',
      title: 'Digest-style updates enabled',
      message: 'You will keep getting a compact in-app summary through your notification center.',
      actionLabel: 'Tune preferences',
      route: '/notifications',
      tone: 'emerald',
    });
  }

  if (preferences?.doNotDisturb) {
    cards.push({
      id: 'quiet-hours-card',
      title: 'Quiet hours are enabled',
      message: `Study alerts are softened between ${preferences?.quietHoursStart || '22:00'} and ${preferences?.quietHoursEnd || '07:00'}.`,
      actionLabel: 'Adjust quiet hours',
      route: '/notifications',
      tone: 'slate',
    });
  }

  return cards.slice(0, 3);
};

const buildDigestSummary = (notifications = [], preferences = null) => {
  const summary = buildNotificationSummary(notifications);
  const latest = notifications.slice(0, 5);
  const highlights = latest.map((item) => ({
    id: item.id || item._id,
    title: item.title,
    type: item.type,
    category: mapNotificationCategory(item.type),
    isRead: Boolean(item.isRead),
    createdAt: item.createdAt,
    link: item.link || '',
  }));

  const busiestCategory = Object.entries(summary.countsByCategory)
    .sort((a, b) => b[1] - a[1])[0];
  const unreadPriority = Object.entries(summary.unreadByCategory)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])[0];

  return {
    enabled: preferences?.digest !== false,
    frequency: preferences?.digestFrequency || 'daily',
    total: summary.total,
    unread: summary.unread,
    busiestCategory: busiestCategory ? { id: busiestCategory[0], total: busiestCategory[1] } : null,
    unreadPriority: unreadPriority ? { id: unreadPriority[0], total: unreadPriority[1] } : null,
    highlights,
    quietHours: preferences?.doNotDisturb
      ? {
        start: preferences?.quietHoursStart || '22:00',
        end: preferences?.quietHoursEnd || '07:00',
      }
      : null,
  };
};

module.exports = {
  createNotification,
  serializeNotification,
  mapNotificationCategory,
  buildNotificationSummary,
  buildReminderCards,
  buildDigestSummary,
};
