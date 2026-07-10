// src/routes/report.js
const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const { generateCsv } = require('../services/reportGenerator');

// POST /report
// Body: { simulationId }
router.post('/', async (req, res) => {
  try {
    const { simulationId } = req.body;
    if (!simulationId) return res.status(400).json({ error: 'simulationId required' });
    const sim = await Simulation.findOne({ simulationId });
    if (!sim) return res.status(404).json({ error: 'Simulation not found' });
    if (!sim.result) return res.status(400).json({ error: 'Simulation not completed yet' });

    const csv = generateCsv(sim.result);
    const filename = `report_${simulationId}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
