// ===================================
// IHSAN — Routes : Besoins (Needs)
// ===================================
const express = require('express');
const { authMiddleware, roleMiddleware, validate } = require('../middleware/auth');
const { createNeedSchema, updateNeedStatusSchema } = require('../validators/need.validator');
const { createNeed, getNeeds, getNeedById, updateNeedStatus } = require('../controllers/need.controller');

const router = express.Router();

// POST /needs (VALIDATOR only)
router.post('/', authMiddleware, roleMiddleware('VALIDATOR'), validate(createNeedSchema), createNeed);

// GET /needs (public catalogue, only OPEN)
router.get('/', getNeeds);

// GET /needs/:id
router.get('/:id', getNeedById);

// PATCH /needs/:id/status (VALIDATOR only)
router.patch('/:id/status', authMiddleware, roleMiddleware('VALIDATOR'), validate(updateNeedStatusSchema), updateNeedStatus);

module.exports = router;
