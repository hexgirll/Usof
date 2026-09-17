const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Define the PATCH endpoint for updating the current user's profile
// The authMiddleware ensures only logged-in users can access this
router.patch('/me', authMiddleware, userController.updateProfile);
router.get('/:id/posts', userController.getUserPosts);

module.exports = router;