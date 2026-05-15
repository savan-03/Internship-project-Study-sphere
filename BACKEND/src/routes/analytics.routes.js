const express = require('express');

const {
  getMyAnalytics,
  getAdminAnalytics,
  getMyAnalyticsExport,
  getAdminAnalyticsExport,
} = require('../controllers/analytics.controller');
const { authenticate, adminOnly } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/me', authenticate, getMyAnalytics);
router.get('/me/export', authenticate, getMyAnalyticsExport);
router.get('/admin', authenticate, adminOnly, getAdminAnalytics);
router.get('/admin/export', authenticate, adminOnly, getAdminAnalyticsExport);

module.exports = router;
