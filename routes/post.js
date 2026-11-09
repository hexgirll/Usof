const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');
const upload = require('../middleware/upload');

router.post('/', authMiddleware, upload.array('images', 5), postController.createPost);
router.get('/', optionalAuth, postController.getAllPosts);
router.get('/:id', optionalAuth, postController.getPostById);
router.put('/:id', authMiddleware, upload.array('images', 5), postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);
router.patch('/:id', authMiddleware, upload.array('images', 5), postController.updatePost);

router.post('/:postId/comments', authMiddleware, commentController.createComment);
router.get('/:postId/comments', optionalAuth, commentController.getPostComments);

router.post('/:postId/like', authMiddleware, likeController.addPostReaction);
router.get('/:postId/like', likeController.getPostLikes);
router.delete('/:postId/like', authMiddleware, likeController.deletePostReaction);

router.get('/:postId/categories', optionalAuth, postController.getPostCategories);


module.exports = router;