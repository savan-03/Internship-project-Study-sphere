const express = require('express');

const { getMyGamification, getLeaderboardSummary, activateMyStreakFreeze } = require('../controllers/gamification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/summary', authenticate, getMyGamification);
router.get('/leaderboard', getLeaderboardSummary);
router.post('/streak-freeze/activate', authenticate, activateMyStreakFreeze);

module.exports = router;
