// src/routes/history.js
const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');

// GET /history?userId=xxxx
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId query param required' });
    const simulations = await Simulation.find({ userId })
      .sort({ createdAt: -1 })
      .select('simulationId scenario status createdAt');
    res.json({ simulations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
