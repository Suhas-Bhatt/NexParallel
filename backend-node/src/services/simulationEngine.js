// src/services/simulationEngine.js
/**
 * Simple simulation engine that takes a graph (nodes & edges) and produces a
 * deterministic‑looking result for a "universe". In a real implementation this
 * would run a stochastic model; here we produce random values for demonstration.
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function simulateUniverse(graph) {
  // Produce a mock universe result based on the graph structure.
  const { nodes, edges } = graph;
  const universe = {
    id: `universe-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    generatedAt: new Date().toISOString(),
    metrics: {}
  };

  // Example: assign a random "score" to each node.
  nodes.forEach(node => {
    universe.metrics[node.id] = {
      label: node.label,
      value: getRandomInt(1, 100) // placeholder metric
    };
  });

  // Optionally compute a simple aggregate metric.
  const total = Object.values(universe.metrics).reduce((sum, m) => sum + m.value, 0);
  universe.aggregateScore = total / (nodes.length || 1);

  return universe;
}

module.exports = { simulateUniverse };
