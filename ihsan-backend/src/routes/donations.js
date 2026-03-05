// ===================================
// IHSAN — Routes : Dons (Donations)
// ===================================
const express = require('express');
const { authMiddleware, roleMiddleware, validate } = require('../middleware/auth');
const { createDonationSchema } = require('../validators/donation.validator');
const { confirmDonationSchema } = require('../validators/confirmation.validator');
const { createDonation, getDonationById } = require('../controllers/donation.controller');
const { confirmDonation } = require('../controllers/confirmation.controller');

const router = express.Router();

// POST /donations (DONOR only)
router.post('/', authMiddleware, roleMiddleware('DONOR'), validate(createDonationSchema), createDonation);

// GET /donations/:id
router.get('/:id', getDonationById);

// POST /donations/:id/confirm (VALIDATOR only)
router.post('/:id/confirm', authMiddleware, roleMiddleware('VALIDATOR'), validate(confirmDonationSchema), confirmDonation);

module.exports = router;
