// ===================================
// IHSAN — Validators : Donation (Zod)
// ===================================
const { z } = require('zod');

const createDonationSchema = z.object({
    needId: z.string().uuid('ID de besoin invalide.'),
    amount: z.number().positive('Le montant doit être positif.'),
});

module.exports = { createDonationSchema };
