const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the POST endpoint for registration
router.post('/register', authController.register);

module.exports = router;