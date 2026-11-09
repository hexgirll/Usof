const express = require('express');
const router = express.Router();
const NewsController = require('../controllers/newsController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/', authMiddleware, NewsController.createNews);

router.get('/', NewsController.getAllNews);

router.get('/:id', optionalAuth, NewsController.getNewsById);

router.patch('/:id', authMiddleware, NewsController.updateNews);

router.get('/:id/comments', optionalAuth, NewsController.getComments);
router.post('/:id/comments', authMiddleware, NewsController.addComment);

router.post('/:id/like', authMiddleware, NewsController.handleReaction);
router.delete('/:id/like', authMiddleware, NewsController.deleteReaction);

router.delete('/:id', authMiddleware, NewsController.deleteNews);

module.exports = router;