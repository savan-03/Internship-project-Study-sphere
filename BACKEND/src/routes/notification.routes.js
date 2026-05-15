const express = require('express');

const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.patch('/preferences', authenticate, notificationController.updateNotificationPreferences);
router.patch('/read-all', authenticate, notificationController.markAllNotificationsRead);
router.delete('/read', authenticate, notificationController.clearReadNotifications);
router.patch('/:id/read', authenticate, notificationController.markNotificationRead);
router.delete('/:id', authenticate, notificationController.dismissNotification);

module.exports = router;
