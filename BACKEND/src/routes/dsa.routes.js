const express = require('express');

const dsaController = require('../controllers/dsa.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/problems', authenticate, dsaController.listProblems);
router.get('/problems/:slug', authenticate, dsaController.getProblemBySlug);
router.post('/problems/:id/execute', authenticate, dsaController.executeAttempt);
router.post('/problems/:id/attempts', authenticate, dsaController.submitAttempt);
router.get('/attempts/me', authenticate, dsaController.getMyAttempts);
router.get('/stats/me', authenticate, dsaController.getMyDsaStats);

module.exports = router;
