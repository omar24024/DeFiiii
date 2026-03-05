// ===================================
// IHSAN BACKEND — Serveur principal
// SupNum Coding Challenge S3C'1447
// ===================================
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PORT, NODE_ENV } = require('./config/env');

// Routes
const authRoutes = require('./routes/auth');
const needsRoutes = require('./routes/needs');
const donationsRoutes = require('./routes/donations');
const publicRoutes = require('./routes/public');

const app = express();

// ===== MIDDLEWARE GLOBAL =====
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ===== ROUTES =====
app.use('/auth', authRoutes);
app.use('/needs', needsRoutes);
app.use('/donations', donationsRoutes);
app.use('/public', publicRoutes);

// ===== ROUTE DE BIENVENUE =====
app.get('/', (req, res) => {
  res.json({
    message: '🌙 IHSAN API — La charité radicalement transparente',
    version: '2.0.0',
    status: 'running',
    documentation: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        me: 'GET /auth/me',
      },
      needs: {
        create: 'POST /needs (VALIDATOR)',
        list: 'GET /needs',
        detail: 'GET /needs/:id',
        updateStatus: 'PATCH /needs/:id/status (VALIDATOR)',
      },
      donations: {
        create: 'POST /donations (DONOR)',
        detail: 'GET /donations/:id',
        confirm: 'POST /donations/:id/confirm (VALIDATOR)',
      },
      public: {
        transactions: 'GET /public/transactions',
      },
    },
  });
});

// ===== GESTION D'ERREURS GLOBALE =====
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
  });
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable.`,
  });
});

// ===== DÉMARRAGE =====
app.listen(PORT, () => {
  console.log(`\n🌙 =======================================`);
  console.log(`   IHSAN API — Charité Transparente`);
  console.log(`   Version: 2.0.0`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Environnement: ${NODE_ENV}`);
  console.log(`   🔗 http://localhost:${PORT}`);
  console.log(`🌙 =======================================\n`);
});
