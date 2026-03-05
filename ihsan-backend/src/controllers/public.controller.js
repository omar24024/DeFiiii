// ===================================
// IHSAN — Controller : Transparence Publique
// ===================================
const prisma = require('../config/prisma');

/**
 * GET /public/transactions
 * Retourne la liste des dons confirmés — IMMUTABLE (lecture seule)
 * → montant, quartier, date, transactionHash, statut
 */
async function getTransactions(req, res) {
    try {
        const transactions = await prisma.donation.findMany({
            where: { status: 'CONFIRMED' },
            select: {
                id: true,
                amount: true,
                transactionHash: true,
                blockchainHash: true,
                status: true,
                createdAt: true,
                confirmedAt: true,
                need: {
                    select: {
                        title: true,
                        neighborhood: true,
                        type: true,
                    },
                },
                impactProof: {
                    select: {
                        confirmationMessage: true,
                        photoUrl: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { confirmedAt: 'desc' },
        });

        // Formater pour la transparence publique
        const publicTransactions = transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            neighborhood: t.need.neighborhood,
            needTitle: t.need.title,
            needType: t.need.type,
            date: t.createdAt,
            confirmedAt: t.confirmedAt,
            transactionHash: t.transactionHash,
            blockchainHash: t.blockchainHash,
            status: t.status,
            impactProof: t.impactProof
                ? {
                    message: t.impactProof.confirmationMessage,
                    photoUrl: t.impactProof.photoUrl,
                    date: t.impactProof.createdAt,
                }
                : null,
        }));

        res.json({
            success: true,
            count: publicTransactions.length,
            message: '📋 Liste des transactions confirmées — Données immuables, lecture seule.',
            transactions: publicTransactions,
        });
    } catch (err) {
        console.error('❌ Public transactions error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

module.exports = { getTransactions };
