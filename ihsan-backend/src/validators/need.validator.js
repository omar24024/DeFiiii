// ===================================
// IHSAN — Validators : Need (Zod)
// ===================================
const { z } = require('zod');

const createNeedSchema = z.object({
    title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères.'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères.'),
    type: z.enum(['IFTAR', 'MEDICAL', 'FOOD', 'OTHER'], {
        errorMap: () => ({ message: 'Type invalide. Choix: IFTAR, MEDICAL, FOOD, OTHER.' }),
    }),
    amountRequired: z.number().positive('Le montant doit être positif.'),
    neighborhood: z.string().min(2, 'Le quartier est requis.'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

const updateNeedStatusSchema = z.object({
    status: z.enum(['OPEN', 'FUNDED', 'DELIVERED'], {
        errorMap: () => ({ message: 'Statut invalide. Choix: OPEN, FUNDED, DELIVERED.' }),
    }),
});

module.exports = { createNeedSchema, updateNeedStatusSchema };
