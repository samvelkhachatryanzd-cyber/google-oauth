const express = require('express');
const { login, register, googleLogin, logout, me } = require('../controllers');
const requireAuth = require('../middleware/requireAuth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimit');

const router = express.Router();

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/google', loginLimiter, googleLogin);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

module.exports = router;
