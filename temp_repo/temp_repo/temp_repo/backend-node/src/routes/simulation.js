// src/routes/simulation.js
const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');

// GET /simulation/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sim = await Simulation.findOne({ simulationId: id });
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    res.json({
      simulationId: sim.simulationId,
      status: sim.status,
      result: sim.result,
      reportUrl: sim.reportUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
