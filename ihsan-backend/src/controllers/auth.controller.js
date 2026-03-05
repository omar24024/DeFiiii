// ===================================
// IHSAN — Controller : Authentification
// ===================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * POST /auth/register
 * Inscription d'un nouvel utilisateur
 */
async function register(req, res) {
    const { name, email, password, role } = req.validatedBody;

    try {
        // Vérifier si l'email est déjà utilisé
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email déjà utilisé.' });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        // Créer l'utilisateur
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                reputationScore: true,
                createdAt: true,
            },
        });

        // Générer le token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Compte créé avec succès.',
            token,
            user,
        });
    } catch (err) {
        console.error('❌ Register error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * POST /auth/login
 * Connexion d'un utilisateur
 */
async function login(req, res) {
    const { email, password } = req.validatedBody;

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Connexion réussie.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                reputationScore: user.reputationScore,
            },
        });
    } catch (err) {
        console.error('❌ Login error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * GET /auth/me
 * Profil de l'utilisateur connecté
 */
async function getMe(req, res) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                reputationScore: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
        }

        res.json({ success: true, user });
    } catch (err) {
        console.error('❌ GetMe error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

module.exports = { register, login, getMe };
