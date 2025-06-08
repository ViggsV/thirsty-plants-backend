const express = require('express');
const { 
    login, 
    register, 
    refreshToken, 
    logout, 
 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); // Your auth middleware
const router = express.Router();

// Public routes (no authentication required)
router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refreshToken); // More RESTful naming

// Protected routes (authentication required)
router.post('/logout', authMiddleware, logout);


module.exports = router;