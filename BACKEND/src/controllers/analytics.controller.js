const {
  buildUserAnalytics,
  buildAdminAnalytics,
  buildUserAnalyticsExport,
  buildAdminAnalyticsExport,
} = require('../services/analytics.service');

const getMyAnalytics = async (req, res) => {
  try {
    const analytics = await buildUserAnalytics(req.user.id);
    if (!analytics) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(analytics);
  } catch (err) {
    console.error('[getMyAnalytics]', err);
    return res.status(500).json({ message: 'Unable to fetch analytics.' });
  }
};

const getAdminAnalytics = async (_req, res) => {
  try {
    const analytics = await buildAdminAnalytics();
    return res.status(200).json(analytics);
  } catch (err) {
    console.error('[getAdminAnalytics]', err);
    return res.status(500).json({ message: 'Unable to fetch admin analytics.' });
  }
};

const getMyAnalyticsExport = async (req, res) => {
  try {
    const exportData = await buildUserAnalyticsExport(req.user.id);
    if (!exportData) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.fileName}"`);
    return res.status(200).send(exportData.content);
  } catch (err) {
    console.error('[getMyAnalyticsExport]', err);
    return res.status(500).json({ message: 'Unable to export analytics.' });
  }
};

const getAdminAnalyticsExport = async (_req, res) => {
  try {
    const exportData = await buildAdminAnalyticsExport();
    res.setHeader('Content-Type', exportData.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${exportData.fileName}"`);
    return res.status(200).send(exportData.content);
  } catch (err) {
    console.error('[getAdminAnalyticsExport]', err);
    return res.status(500).json({ message: 'Unable to export admin analytics.' });
  }
};

module.exports = {
  getMyAnalytics,
  getAdminAnalytics,
  getMyAnalyticsExport,
  getAdminAnalyticsExport,
};
