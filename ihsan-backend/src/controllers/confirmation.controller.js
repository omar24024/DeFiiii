// ===================================
// IHSAN — Controller : Confirmation
// ===================================
const prisma = require('../config/prisma');
const { generateBlockchainHash } = require('../utils/hash');

/**
 * POST /donations/:id/confirm
 * Confirmer un don (VALIDATOR uniquement)
 * → Change status to CONFIRMED
 * → Create ImpactProof
 * → Set confirmedAt
 * → Increment validator reputation
 * → Change Need status to DELIVERED
 * → Simulate blockchain anchoring (store second hash)
 */
async function confirmDonation(req, res) {
    const donationId = req.params.id;
    const { photoUrl, confirmationMessage } = req.validatedBody;

    try {
        // Récupérer le don avec son besoin
        const donation = await prisma.donation.findUnique({
            where: { id: donationId },
            include: {
                need: true,
            },
        });

        if (!donation) {
            return res.status(404).json({ success: false, message: 'Don introuvable.' });
        }

        if (donation.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Ce don est déjà confirmé.' });
        }

        // Vérifier que le validateur est bien celui du besoin
        if (donation.need.validatorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Non autorisé. Seul le validateur du besoin peut confirmer.',
            });
        }

        const confirmedAt = new Date();

        // Simuler l'ancrage blockchain
        const blockchainHash = generateBlockchainHash(donation.transactionHash, confirmedAt.toISOString());

        // Transaction Prisma: tout ou rien
        const result = await prisma.$transaction(async (tx) => {
            // 1. Mettre à jour le don → CONFIRMED + confirmedAt + blockchainHash
            const updatedDonation = await tx.donation.update({
                where: { id: donationId },
                data: {
                    status: 'CONFIRMED',
                    confirmedAt,
                    blockchainHash,
                },
            });

            // 2. Créer la preuve d'impact
            const impactProof = await tx.impactProof.create({
                data: {
                    donationId,
                    photoUrl: photoUrl || null,
                    confirmationMessage,
                },
            });

            // 3. Changer le statut du besoin → DELIVERED
            await tx.need.update({
                where: { id: donation.needId },
                data: { status: 'DELIVERED' },
            });

            // 4. Incrémenter la réputation du validateur (+0.5, max 10)
            await tx.user.update({
                where: { id: req.user.id },
                data: {
                    reputationScore: {
                        increment: 0.5,
                    },
                },
            });

            // Limiter la réputation à 10
            const validator = await tx.user.findUnique({
                where: { id: req.user.id },
                select: { reputationScore: true },
            });
            if (validator.reputationScore > 10) {
                await tx.user.update({
                    where: { id: req.user.id },
                    data: { reputationScore: 10 },
                });
            }

            return { updatedDonation, impactProof };
        });

        res.status(201).json({
            success: true,
            message: 'Don confirmé avec succès. Preuve d\'impact créée.',
            confirmation: {
                donationId: result.updatedDonation.id,
                status: result.updatedDonation.status,
                confirmedAt: result.updatedDonation.confirmedAt,
                transactionHash: result.updatedDonation.transactionHash,
                blockchainHash: result.updatedDonation.blockchainHash,
                impactProof: result.impactProof,
            },
        });
    } catch (err) {
        console.error('❌ Confirm donation error:', err);
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
}

module.exports = { confirmDonation };
