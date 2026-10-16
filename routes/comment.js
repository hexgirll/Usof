const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

router.patch('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.post('/:id/like', authMiddleware, likeController.addCommentReaction);
router.get('/:id/like', likeController.getCommentLikes);
router.delete('/:id/like', authMiddleware, likeController.deleteCommentReaction);
router.get('/:id', commentController.getCommentById);

module.exports = router;