// ===================================
// IHSAN — Utilitaire : Hash SHA-256
// ===================================
const crypto = require('crypto');

/**
 * Génère un hash SHA-256 pour une transaction de don.
 * Composants: donorId + needId + amount + timestamp
 * Simule l'immutabilité blockchain.
 */
function generateTransactionHash({ donorId, needId, amount, timestamp }) {
  const payload = `${donorId}:${needId}:${amount}:${timestamp}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Génère un hash blockchain simulé pour l'ancrage.
 * Utilise le transactionHash + timestamp de confirmation.
 */
function generateBlockchainHash(transactionHash, confirmedAt) {
  const payload = `BLOCK:${transactionHash}:${confirmedAt}:${crypto.randomBytes(8).toString('hex')}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

module.exports = { generateTransactionHash, generateBlockchainHash };
