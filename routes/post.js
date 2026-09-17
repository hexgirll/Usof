const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const commentController = require('../controllers/commentController');
const likeController = require('../controllers/likeController');

// POST endpoint for creating a new post
router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getAllPosts);
// GET endpoint to retrieve a specific post by ID
// The ':id' is a dynamic parameter
router.get('/:id', postController.getPostById);
// PUT endpoint to update a specific post by ID
router.put('/:id', authMiddleware, postController.updatePost);
// DELETE endpoint to delete a specific post by ID
router.delete('/:id', authMiddleware, postController.deletePost);
router.post('/:postId/comments', authMiddleware, commentController.createComment);
router.get('/:postId/comments', commentController.getPostComments);
router.post('/:postId/like', authMiddleware, likeController.addPostReaction);
router.get('/:postId/likes', likeController.getPostLikes);
router.delete('/:postId/like', authMiddleware, likeController.deletePostReaction);

module.exports = router;