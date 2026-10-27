// src/services/workflow.js
const Simulation = require('../models/Simulation');
const logger = require('../utils/logger');
const aiProvider = require('./aiProvider');
const { buildGraph } = require('./graphBuilder');
const { simulateUniverse } = require('./simulationEngine');
const { scoreRisks } = require('./riskScorer');

/**
 * Core orchestration logic that mirrors the original Step Functions workflow.
 * For now this is a simplified sequential implementation using async/await.
 * It updates the Simulation document with the final result.
 */
async function runWorkflow(simulationId) {
  try {
    const sim = await Simulation.findOne({ simulationId });
    if (!sim) throw new Error('Simulation not found');
    await Simulation.updateOne({ simulationId }, { status: 'RUNNING' });

    // 1️⃣ Parse scenario via AI (Claude) – placeholder returns structured JSON
    const parsed = await aiProvider.parseScenario(sim.scenario);

    // 2️⃣ Build directed graph from parsed data
    const graph = await buildGraph(parsed);

    // 3️⃣ Run three parallel universe simulations
    const universes = await Promise.all([
      simulateUniverse(graph),
      simulateUniverse(graph),
      simulateUniverse(graph)
    ]);

    // 4️⃣ Score risks using AI
    const scored = await scoreRisks(universes);

    // 5️⃣ Generate recommendations for the top‑risk universe
    const recommendations = await aiProvider.recommend(scored[0]);

    // 6️⃣ Persist final result
    await Simulation.updateOne({ simulationId }, {
      status: 'COMPLETED',
      result: {
        universes,
        scored,
        recommendations
      }
    });
    logger.info(`Workflow completed for ${simulationId}`);
  } catch (err) {
    logger.error(`Workflow failed for ${simulationId}: ${err}`);
    await Simulation.updateOne({ simulationId }, { status: 'FAILED', error: err.message });
  }
}

module.exports = { runWorkflow };
