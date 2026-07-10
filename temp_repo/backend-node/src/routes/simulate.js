// src/routes/simulate.js
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const Simulation = require('../models/Simulation');
const { runWorkflow } = require('../services/workflow');
const logger = require('../utils/logger');

// POST /simulate
router.post('/', async (req, res) => {
  try {
    const { scenario, userId = 'demo-user' } = req.body;
    if (!scenario || typeof scenario !== 'string' || !scenario.trim()) {
      return res.status(400).json({ error: 'Invalid scenario' });
    }
    const simulationId = uuidv4();
    const ttlDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await Simulation.create({
      simulationId,
      userId,
      scenario: scenario.trim(),
      status: 'PENDING',
      ttl: ttlDate
    });
    // Fire‑and‑forget workflow (no awaiting)
    runWorkflow(simulationId).catch(err => {
      logger.error(`Workflow error for ${simulationId}: ${err}`);
    });
    res.status(202).json({ simulationId, status: 'PENDING' });
  } catch (err) {
    logger.error(`/simulate error: ${err}`);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
