const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const socialController = require('../controllers/social.controller');

const router = express.Router();

router.get('/summary', authenticate, socialController.getSocialSummary);
router.get('/network', authenticate, socialController.getNetworkOverview);
router.get('/feed', authenticate, socialController.getActivityFeed);
router.post('/follow/:userId', authenticate, socialController.toggleFollowUser);
router.get('/direct', authenticate, socialController.listDirectConversations);
router.get('/direct/:userId/messages', authenticate, socialController.getDirectConversationMessages);
router.post('/direct/:userId/messages', authenticate, socialController.sendDirectMessage);

router.get('/groups', authenticate, socialController.listGroups);
router.post('/groups', authenticate, socialController.createGroup);
router.post('/groups/:id/join', authenticate, socialController.joinGroup);
router.post('/groups/:id/leave', authenticate, socialController.leaveGroup);
router.get('/groups/:id/messages', authenticate, socialController.listGroupMessages);
router.post('/groups/:id/posts', authenticate, socialController.addGroupPost);

router.get('/forums', authenticate, socialController.listThreads);
router.post('/forums', authenticate, socialController.createThread);
router.post('/forums/:id/replies', authenticate, socialController.replyThread);
router.post('/forums/:id/upvote', authenticate, socialController.upvoteThread);

router.get('/mentorship', authenticate, socialController.listMentorship);
router.post('/mentorship', authenticate, socialController.createMentorship);
router.post('/mentorship/:id/accept', authenticate, socialController.acceptMentorship);
router.post('/mentorship/:id/close', authenticate, socialController.closeMentorship);

module.exports = router;
