// src/services/riskScorer.js
/**
 * Risk scoring service – uses the AI provider (Claude) to assign a risk score
 * to each simulated universe. For the demo we simply compute a random score
 * and attach it, but the real implementation would call Bedrock.
 */
const aiProvider = require('./aiProvider');
const logger = require('../utils/logger');

async function scoreRisks(universes) {
  // In a production system, we'd send each universe to Claude with a prompt.
  // Here we assign a random score and sort descending (higher risk first).
  const scored = universes.map(u => {
    const riskScore = Math.random(); // placeholder 0‑1 score
    return { ...u, riskScore };
  });
  // Sort by riskScore descending
  scored.sort((a, b) => b.riskScore - a.riskScore);
  logger.info('Risk scoring completed (stub)');
  return scored;
}

module.exports = { scoreRisks };
