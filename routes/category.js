const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

router.post('/', authMiddleware, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById); 
router.patch('/:id', authMiddleware, categoryController.updateCategory); 
router.delete('/:id', authMiddleware, categoryController.deleteCategory); 
router.get('/:id/posts', optionalAuth, categoryController.getPostCategories);

module.exports = router;