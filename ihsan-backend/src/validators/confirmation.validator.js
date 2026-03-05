// ===================================
// IHSAN — Validators : Confirmation (Zod)
// ===================================
const { z } = require('zod');

const confirmDonationSchema = z.object({
    photoUrl: z.string().url('URL de photo invalide.').optional().nullable(),
    confirmationMessage: z.string().min(5, 'Le message de confirmation est requis (min 5 caractères).'),
});

module.exports = { confirmDonationSchema };
