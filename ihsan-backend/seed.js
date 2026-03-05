// ===================================
// IHSAN — Script de Seed
// Données de test pour le développement
// ===================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Créer des utilisateurs de test
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                name: 'Ahmed Diallo',
                email: 'ahmed@example.com',
                password: hashedPassword,
                role: 'VALIDATOR',
                reputationScore: 4.8,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Fatima Bâ',
                email: 'fatima@example.com',
                password: hashedPassword,
                role: 'DONOR',
                reputationScore: 5.0,
            },
        }),
        prisma.user.create({
            data: {
                name: 'Mamadou Sow',
                email: 'mamadou@example.com',
                password: hashedPassword,
                role: 'DONOR',
                reputationScore: 4.9,
            },
        }),
    ]);

    console.log('✅ Utilisateurs créés');

    // Créer des besoins
    const needs = await Promise.all([
        prisma.need.create({
            data: {
                title: 'Aide pour Iftar collectif',
                description: 'Besoin de nourriture pour 50 personnes pendant le Ramadan dans le quartier de Plateau.',
                type: 'IFTAR',
                amountRequired: 1500,
                neighborhood: 'Plateau',
                latitude: 18.0735,
                longitude: -15.9582,
                validatorId: users[0].id,
            },
        }),
        prisma.need.create({
            data: {
                title: 'Soutien médical d\'urgence',
                description: 'Achat de médicaments essentiels pour une famille en difficulté.',
                type: 'MEDICAL',
                amountRequired: 800,
                neighborhood: 'Keur Massar',
                latitude: 14.7935,
                longitude: -17.3158,
                validatorId: users[0].id,
            },
        }),
        prisma.need.create({
            data: {
                title: 'Distribution alimentaire',
                description: 'Riz, huile et conserves pour 20 familles dans le quartier de Yoff.',
                type: 'FOOD',
                amountRequired: 1200,
                neighborhood: 'Yoff',
                latitude: 14.7542,
                longitude: -17.4677,
                validatorId: users[0].id,
            },
        }),
        prisma.need.create({
            data: {
                title: 'Éducation et fournitures scolaires',
                description: 'Cahiers, stylos et manuels pour enfants défavorisés.',
                type: 'OTHER',
                amountRequired: 600,
                neighborhood: 'Parcelles Assainies',
                latitude: 14.6750,
                longitude: -17.4358,
                validatorId: users[0].id,
            },
        }),
    ]);

    console.log('✅ Besoins créés');

    // Créer des donations confirmées
    const donations = await Promise.all([
        prisma.donation.create({
            data: {
                donorId: users[1].id,
                needId: needs[0].id,
                amount: 500,
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockchainHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'CONFIRMED',
                confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours ago
            },
        }),
        prisma.donation.create({
            data: {
                donorId: users[2].id,
                needId: needs[1].id,
                amount: 300,
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockchainHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'CONFIRMED',
                confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours ago
            },
        }),
        prisma.donation.create({
            data: {
                donorId: users[1].id,
                needId: needs[2].id,
                amount: 750,
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockchainHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'CONFIRMED',
                confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours ago
            },
        }),
        prisma.donation.create({
            data: {
                donorId: users[2].id,
                needId: needs[3].id,
                amount: 400,
                transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                blockchainHash: '0x' + Math.random().toString(16).substr(2, 64),
                status: 'CONFIRMED',
                confirmedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour ago
            },
        }),
    ]);

    console.log('✅ Donations créées');

    // Créer des preuves d'impact
    await Promise.all([
        prisma.impactProof.create({
            data: {
                donationId: donations[0].id,
                confirmationMessage: 'Repas distribués avec succès à 50 familles pendant l\'Aïd',
                photoUrl: 'https://example.com/photo1.jpg',
            },
        }),
        prisma.impactProof.create({
            data: {
                donationId: donations[1].id,
                confirmationMessage: 'Médicaments livrés et distribués aux bénéficiaires',
                photoUrl: 'https://example.com/photo2.jpg',
            },
        }),
        prisma.impactProof.create({
            data: {
                donationId: donations[2].id,
                confirmationMessage: 'Nourriture distribuée à 20 familles dans le quartier Yoff',
                photoUrl: 'https://example.com/photo3.jpg',
            },
        }),
    ]);

    console.log('✅ Preuves d\'impact créées');

    console.log('🎉 Base de données seedée avec succès !');
    console.log(`📊 Statistiques:`);
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`   - ${needs.length} besoins`);
    console.log(`   - ${donations.length} donations confirmées`);
    console.log(`   - Total distribué: ${donations.reduce((sum, d) => sum + d.amount, 0)} MRU`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });