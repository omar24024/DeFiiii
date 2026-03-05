// ===================================
// IHSAN — Controller : Dons (Donations)
// ===================================
const prisma = require('../config/prisma');
const { generateTransactionHash } = require('../utils/hash');

/**
 * POST /donations
 * Créer un don (DONOR uniquement)
 * → Génère UUID, timestamp, hash SHA-256 (donorId + needId + amount + timestamp)
 */
async function createDonation(req, res) {
    const { needId, amount } = req.validatedBody;

    try {
        // Vérifier que le besoin existe et est OPEN
        const need = await prisma.need.findUnique({ where: { id: needId } });

        if (!need) {
            return res.status(404).json({ success: false, message: 'Besoin introuvable.' });
        }

        if (need.status !== 'OPEN') {
            return res.status(400).json({ success: false, message: 'Ce besoin n\'est plus ouvert aux dons.' });
        }

        // Générer le timestamp et le hash SHA-256
        const timestamp = new Date().toISOString();
        const transactionHash = generateTransactionHash({
            donorId: req.user.id,
            needId,
            amount,
            timestamp,
        });

        // Créer la donation
        const donation = await prisma.donation.create({
            data: {
                donorId: req.user.id,
                needId,
                amount,
                transactionHash,
            },
            include: {
                need: {
                    select: { title: true, neighborhood: true, type: true },
                },
            },
        });

        // Réponse avec reçu horodaté
        res.status(201).json({
            success: true,
            message: 'Don enregistré avec succès.',
            receipt: {
                transactionId: donation.id,
                donor: req.user.name[0] + '*** (anonyme)',
                needTitle: donation.need.title,
                neighborhood: donation.need.neighborhood,
                amount: donation.amount,
                transactionHash: donation.transactionHash,
                status: donation.status,
                timestamp: donation.createdAt,
            },
        });
    } catch (err) {
        console.error('❌ Create donation error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

/**
 * GET /donations/:id
 * Détail d'un don avec preuve d'impact
 */
async function getDonationById(req, res) {
    try {
        const donation = await prisma.donation.findUnique({
            where: { id: req.params.id },
            include: {
                need: {
                    select: { title: true, neighborhood: true, type: true, description: true },
                },
                donor: {
                    select: { id: true, name: true },
                },
                impactProof: true,
            },
        });

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Transaction introuvable.' });
        }

        // Anonymiser le nom du donneur
        const anonymizedDonation = {
            ...donation,
            donor: {
                id: donation.donor.id,
                name: donation.donor.name[0] + '*** (anonyme)',
            },
        };

        res.json({ success: true, donation: anonymizedDonation });
    } catch (err) {
        console.error('❌ Get donation error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

module.exports = { createDonation, getDonationById };
