const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const commentController = require('../controllers/commentController');

router.patch('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;