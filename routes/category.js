const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth'); 

router.post('/', authMiddleware, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id/posts', categoryController.getPostCategories);

module.exports = router;