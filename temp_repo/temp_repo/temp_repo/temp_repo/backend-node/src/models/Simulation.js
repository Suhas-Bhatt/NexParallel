// src/models/Simulation.js
const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  simulationId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  scenario: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  ttl: { type: Date }, // TTL index for expiration (30 days)
  result: { type: mongoose.Schema.Types.Mixed }, // stores universes, scores, recommendations
  reportUrl: { type: String }
});

// Create TTL index (MongoDB will automatically delete after ttl)
SimulationSchema.index({ ttl: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Simulation', SimulationSchema);
