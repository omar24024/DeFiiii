// ===================================
// IHSAN — Validators : Auth (Zod)
// ===================================
const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères.'),
    email: z.string().email('Email invalide.'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères.'),
    role: z.enum(['DONOR', 'VALIDATOR', 'PARTNER', 'ADMIN'], {
        errorMap: () => ({ message: 'Rôle invalide. Choix: DONOR, VALIDATOR, PARTNER, ADMIN.' }),
    }),
});

const loginSchema = z.object({
    email: z.string().email('Email invalide.'),
    password: z.string().min(1, 'Mot de passe requis.'),
});

module.exports = { registerSchema, loginSchema };
