// ===================================
// IHSAN — Routes : Authentification
// ===================================
const express = require('express');
const { authMiddleware, validate } = require('../middleware/auth');
const { registerSchema, loginSchema } = require('../validators/auth.validator');
const { register, login, getMe } = require('../controllers/auth.controller');

const router = express.Router();

// POST /auth/register
router.post('/register', validate(registerSchema), register);

// POST /auth/login
router.post('/login', validate(loginSchema), login);

// GET /auth/me (protected)
router.get('/me', authMiddleware, getMe);

module.exports = router;
