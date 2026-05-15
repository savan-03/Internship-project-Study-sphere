const { getGamificationSummary, getLeaderboard, activateStreakFreeze } = require('../services/gamification.service');

const getMyGamification = async (req, res) => {
  try {
    const summary = await getGamificationSummary(req.user.id);
    if (!summary) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json(summary);
  } catch (err) {
    console.error('[getMyGamification]', err);
    return res.status(500).json({ message: 'Unable to fetch gamification summary.' });
  }
};

const getLeaderboardSummary = async (_req, res) => {
  try {
    const leaderboard = await getLeaderboard();
    return res.status(200).json({ leaderboard });
  } catch (err) {
    console.error('[getLeaderboardSummary]', err);
    return res.status(500).json({ message: 'Unable to fetch leaderboard.' });
  }
};

const activateMyStreakFreeze = async (req, res) => {
  try {
    const result = await activateStreakFreeze(req.user.id);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    const summary = await getGamificationSummary(req.user.id);
    return res.status(200).json({
      message: result.message,
      summary,
    });
  } catch (err) {
    console.error('[activateMyStreakFreeze]', err);
    return res.status(500).json({ message: 'Unable to activate streak freeze.' });
  }
};

module.exports = {
  getMyGamification,
  getLeaderboardSummary,
  activateMyStreakFreeze,
};
