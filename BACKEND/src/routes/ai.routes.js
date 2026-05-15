const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const aiController = require('../controllers/ai.controller');

const router = express.Router();

router.get('/summary', authenticate, aiController.getAiSummary);
router.get('/personalization', authenticate, aiController.getAiPersonalization);
router.get('/sessions/:id', authenticate, aiController.getAiSession);
router.post('/quiz/generate', authenticate, aiController.generateQuiz);
router.post('/quiz/:id/submit', authenticate, aiController.submitQuiz);
router.post('/assistant/message', authenticate, aiController.assistantMessage);
router.post('/interview/session', authenticate, aiController.startInterview);
router.post('/interview/:id/respond', authenticate, aiController.respondInterview);

module.exports = router;
