// ===================================
// IHSAN — Controller : Besoins (Needs)
// ===================================
const prisma = require('../config/prisma');

/**
 * POST /needs
 * Créer un nouveau besoin (VALIDATOR uniquement)
 */
async function createNeed(req, res) {
    const { title, description, type, amountRequired, neighborhood, latitude, longitude } = req.validatedBody;

    try {
        const need = await prisma.need.create({
            data: {
                title,
                description,
                type,
                amountRequired,
                neighborhood,
                latitude: latitude || null,
                longitude: longitude || null,
                validatorId: req.user.id,
            },
            include: {
                validator: {
                    select: { id: true, name: true, reputationScore: true },
                },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Besoin publié avec succès.',
            need,
        });
    } catch (err) {
        console.error('❌ Create need error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * GET /needs
 * Catalogue public — uniquement les besoins OPEN
 */
async function getNeeds(req, res) {
    try {
        const { type, neighborhood } = req.query;

        const where = { status: 'OPEN' };

        if (type) {
            where.type = type.toUpperCase();
        }
        if (neighborhood) {
            where.neighborhood = { contains: neighborhood, mode: 'insensitive' };
        }

        const needs = await prisma.need.findMany({
            where,
            include: {
                validator: {
                    select: { id: true, name: true, reputationScore: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, count: needs.length, needs });
    } catch (err) {
        console.error('❌ Get needs error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * GET /needs/:id
 * Détail d'un besoin
 */
async function getNeedById(req, res) {
    try {
        const need = await prisma.need.findUnique({
            where: { id: req.params.id },
            include: {
                validator: {
                    select: { id: true, name: true, reputationScore: true },
                },
                donations: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        createdAt: true,
                        transactionHash: true,
                    },
                },
            },
        });

        if (!need) {
            return res.status(404).json({ success: false, message: 'Besoin introuvable.' });
        }

        res.json({ success: true, need });
    } catch (err) {
        console.error('❌ Get need by ID error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * PATCH /needs/:id/status
 * Mettre à jour le statut d'un besoin (VALIDATOR propriétaire)
 */
async function updateNeedStatus(req, res) {
    const { status } = req.validatedBody;

    try {
        // Vérifier que le besoin existe et appartient au validateur
        const existingNeed = await prisma.need.findUnique({
            where: { id: req.params.id },
        });

        if (!existingNeed) {
            return res.status(404).json({ success: false, message: 'Besoin introuvable.' });
        }

        if (existingNeed.validatorId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Non autorisé. Ce besoin ne vous appartient pas.' });
        }

        const need = await prisma.need.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                validator: {
                    select: { id: true, name: true, reputationScore: true },
                },
            },
        });

        res.json({
            success: true,
            message: `Statut mis à jour: ${status}.`,
            need,
        });
    } catch (err) {
        console.error('❌ Update need status error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

module.exports = { createNeed, getNeeds, getNeedById, updateNeedStatus };
