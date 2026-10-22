const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

// Post endpoints
router.post('/', authMiddleware, postController.createPost);
router.get('/', optionalAuth, postController.getAllPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.patch('/:id', authMiddleware, postController.updatePost);

// Post comments endpoints (using commentController & optionalAuth)
router.post('/:postId/comments', authMiddleware, commentController.createComment);
router.get('/:postId/comments', optionalAuth, commentController.getPostComments);

// Post reactions/likes endpoints
router.post('/:postId/like', authMiddleware, likeController.addPostReaction);
router.get('/:postId/like', likeController.getPostLikes);
router.delete('/:postId/like', authMiddleware, likeController.deletePostReaction);

// Post categories endpoint
router.get('/:postId/categories', postController.getPostCategories);

module.exports = router;