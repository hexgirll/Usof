const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// Ensure absolute path to uploads/avatars exists
const avatarDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
    fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for storing avatars in absolute path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

// User routes
router.patch('/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.patch('/:id', authMiddleware, userController.updateProfile);
router.get('/:id/posts', optionalAuth, userController.getUserPosts); 
router.get('/', optionalAuth, userController.getAllUsers); 
router.get('/:id', optionalAuth, userController.getUserById); 
router.delete('/:id', authMiddleware, userController.deleteUser);
router.post('/', authMiddleware, userController.newUser);

module.exports = router;