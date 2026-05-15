const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const {
  mapNotificationCategory,
  serializeNotification,
  buildNotificationSummary,
  buildReminderCards,
  buildDigestSummary,
} = require('../services/notification.service');

const getNotifications = async (req, res) => {
  try {
    const query = { recipient: req.user.id };
    if (req.query.isRead === 'true') {
      query.isRead = true;
    }
    if (req.query.isRead === 'false') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(80);

    const user = await User.findById(req.user.id).select('notificationPreferences');
    const serialized = notifications.map((notification) => ({
      ...serializeNotification(notification),
      category: mapNotificationCategory(notification.type),
    }));

    const requestedCategory = req.query.category && req.query.category !== 'all'
      ? String(req.query.category).toLowerCase()
      : 'all';
    const filteredNotifications = requestedCategory === 'all'
      ? serialized
      : serialized.filter((notification) => notification.category === requestedCategory);
    const summary = buildNotificationSummary(serialized);

    return res.status(200).json({
      notifications: filteredNotifications,
      unreadCount: summary.unread,
      summary,
      reminderCards: buildReminderCards(serialized, user?.notificationPreferences || null),
      digestSummary: buildDigestSummary(serialized, user?.notificationPreferences || null),
      categories: Object.keys(summary.countsByCategory).map((key) => ({
        id: key,
        total: summary.countsByCategory[key],
        unread: summary.unreadByCategory[key],
      })),
      preferences: user?.notificationPreferences || null,
    });
  } catch (err) {
    console.error('[getNotifications]', err);
    return res.status(500).json({ message: 'Unable to fetch notifications.' });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({ notification: serializeNotification(notification) });
  } catch (err) {
    console.error('[markNotificationRead]', err);
    return res.status(500).json({ message: 'Unable to update notification.' });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (err) {
    console.error('[markAllNotificationsRead]', err);
    return res.status(500).json({ message: 'Unable to update notifications.' });
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('notificationPreferences');
    const currentPreferences = currentUser?.notificationPreferences?.toObject?.() || currentUser?.notificationPreferences || {};
    const currentCategories = currentPreferences.categories || {};
    const nextPreferences = {
      inApp: req.body.inApp !== undefined ? Boolean(req.body.inApp) : currentPreferences.inApp !== false,
      email: req.body.email !== undefined ? Boolean(req.body.email) : Boolean(currentPreferences.email),
      push: req.body.push !== undefined ? Boolean(req.body.push) : Boolean(currentPreferences.push),
      digest: req.body.digest !== undefined ? Boolean(req.body.digest) : currentPreferences.digest !== false,
      studyReminders: req.body.studyReminders !== undefined ? Boolean(req.body.studyReminders) : currentPreferences.studyReminders !== false,
      doNotDisturb: req.body.doNotDisturb !== undefined ? Boolean(req.body.doNotDisturb) : Boolean(currentPreferences.doNotDisturb),
      quietHoursStart: typeof req.body.quietHoursStart === 'string' && req.body.quietHoursStart.trim()
        ? req.body.quietHoursStart.trim()
        : currentPreferences.quietHoursStart || '22:00',
      quietHoursEnd: typeof req.body.quietHoursEnd === 'string' && req.body.quietHoursEnd.trim()
        ? req.body.quietHoursEnd.trim()
        : currentPreferences.quietHoursEnd || '07:00',
      reminderHour: typeof req.body.reminderHour === 'string' && req.body.reminderHour.trim()
        ? req.body.reminderHour.trim()
        : currentPreferences.reminderHour || '19:00',
      digestFrequency: req.body.digestFrequency === 'weekly' ? 'weekly' : (currentPreferences.digestFrequency || 'daily'),
      categories: {
        system: req.body.categories?.system !== undefined ? Boolean(req.body.categories.system) : currentCategories.system !== false,
        resources: req.body.categories?.resources !== undefined ? Boolean(req.body.categories.resources) : currentCategories.resources !== false,
        social: req.body.categories?.social !== undefined ? Boolean(req.body.categories.social) : currentCategories.social !== false,
        dsa: req.body.categories?.dsa !== undefined ? Boolean(req.body.categories.dsa) : currentCategories.dsa !== false,
        ai: req.body.categories?.ai !== undefined ? Boolean(req.body.categories.ai) : currentCategories.ai !== false,
      },
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { notificationPreferences: nextPreferences },
      { new: true }
    ).select('notificationPreferences');

    return res.status(200).json({ preferences: user.notificationPreferences });
  } catch (err) {
    console.error('[updateNotificationPreferences]', err);
    return res.status(500).json({ message: 'Unable to update notification preferences.' });
  }
};

const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.status(200).json({ success: true, id: req.params.id });
  } catch (err) {
    console.error('[dismissNotification]', err);
    return res.status(500).json({ message: 'Unable to dismiss notification.' });
  }
};

const clearReadNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({
      recipient: req.user.id,
      isRead: true,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[clearReadNotifications]', err);
    return res.status(500).json({ message: 'Unable to clear read notifications.' });
  }
};

module.exports = {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  updateNotificationPreferences,
  dismissNotification,
  clearReadNotifications,
};
