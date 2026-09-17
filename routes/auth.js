const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); 

// Define the POST endpoint for registration
router.post('/register', authController.register);

router.post('/login', authController.login);

// A protected test route
router.get('/me', authMiddleware, (req, res) => {
    // If the middleware passed, req.user will contain the decoded token data
    res.json({ 
        message: 'You have access to this protected route!',
        userData: req.user 
    });
});

module.exports = router;