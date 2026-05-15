const express = require('express');
const multer = require('multer');

const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.get('/resources', adminController.getResources);
router.get('/resources/reviews', adminController.getReviews);
router.get('/resources/bookmarks/me', authMiddleware.authenticate, adminController.getBookmarks);
router.post('/resources/collections', authMiddleware.authenticate, adminController.createCollection);
router.get('/resources/collections/me', authMiddleware.authenticate, adminController.getCollections);
router.patch('/resources/collections/:collectionId', authMiddleware.authenticate, adminController.updateCollection);
router.delete('/resources/collections/:collectionId', authMiddleware.authenticate, adminController.deleteCollection);
router.post('/resources/collections/:collectionId/resources/:resourceId', authMiddleware.authenticate, adminController.addResourceToCollection);
router.delete('/resources/collections/:collectionId/resources/:resourceId', authMiddleware.authenticate, adminController.removeResourceFromCollection);
router.get('/resources/my-uploads', authMiddleware.authenticate, adminController.getMyUploads);
router.post('/resources/:id/bookmark', authMiddleware.authenticate, adminController.toggleBookmark);
router.post('/resources/:id/reviews', authMiddleware.authenticate, adminController.addReview);
router.get('/resources/:id/comments', adminController.getComments);
router.post('/resources/:id/comments', authMiddleware.authenticate, adminController.addComment);
router.post('/resources/:id/comments/:commentId/replies', authMiddleware.authenticate, adminController.addCommentReply);
router.post('/resources/:id/download', adminController.registerDownload);
router.get('/resources/:id', authMiddleware.optionalAuthenticate, adminController.getResourceById);
router.post('/resources', authMiddleware.authenticate, upload.single('file'), adminController.createFile);
router.patch('/resources/:id', authMiddleware.authenticate, adminController.updateResource);
router.delete('/resources/:id', authMiddleware.authenticate, adminController.deleteResource);

router.get('/admin/dashboard', authMiddleware.adminOnly, adminController.getAdminDashboard);
router.get('/admin/users', authMiddleware.adminOnly, adminController.getAdminUsers);
router.patch('/admin/users/:id/role', authMiddleware.adminOnly, adminController.updateUserRole);
router.patch('/admin/users/:id/status', authMiddleware.adminOnly, adminController.updateUserStatus);
router.get('/admin/resources', authMiddleware.authenticate, authMiddleware.authorize('admin', 'moderator'), adminController.getAdminResources);
router.get('/admin/resources/:id', authMiddleware.authenticate, authMiddleware.authorize('admin', 'moderator'), adminController.getAdminResourceById);
router.patch('/admin/resources/:id/status', authMiddleware.authenticate, authMiddleware.authorize('admin', 'moderator'), adminController.updateResourceStatus);
router.post('/admin/resources/:id/notes', authMiddleware.authenticate, authMiddleware.authorize('admin', 'moderator'), adminController.addModerationNote);
router.post('/admin/upload', authMiddleware.adminOnly, upload.single('admin'), adminController.createAdmin);
router.post('/file', authMiddleware.adminOnly, adminController.createFile);

module.exports = router;

