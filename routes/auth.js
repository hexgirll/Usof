const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authMiddleware, authController.logout);
router.get('/confirm/:token', authController.confirmEmail);

router.post('/password-reset', authController.passwordResetRequest);
router.post('/password-reset/:token', authController.passwordReset);

router.get('/me', authMiddleware, (req, res) => {
    res.json({ 
        message: 'You have access to this protected route!',
        userData: req.user 
    });
});

module.exports = router;