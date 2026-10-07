const express = require('express');
const multer = require('multer');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const upload = multer({ dest: 'uploads/avatars/' }); // Configure multer for file uploads

// Define the PATCH endpoint for updating the current user's profile
// The authMiddleware ensures only logged-in users can access this
router.patch('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.patch('/:id', authMiddleware, userController.updateProfile);
router.get('/:id/posts', userController.getUserPosts);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', authMiddleware, userController.deleteUser);
router.post('/', authMiddleware, userController.newUser);

module.exports = router;