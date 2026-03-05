// ===================================
// IHSAN — Routes : Transparence Publique
// ===================================
const express = require('express');
const { getTransactions } = require('../controllers/public.controller');

const router = express.Router();

// GET /public/transactions (lecture seule, immuable)
router.get('/transactions', getTransactions);

module.exports = router;
