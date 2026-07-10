// src/services/graphBuilder.js
/**
 * Simple graph builder stub.
 * In the real system this would convert the parsed scenario JSON into a
 * directed graph structure used by the simulation engine.
 * Here we just pass the parsed object forward (or create a trivial adjacency list).
 */
async function buildGraph(parsedScenario) {
  // For demonstration, assume parsedScenario has an array of events.
  // We'll create a node list and an edge list where each event points to the next.
  if (!parsedScenario || !Array.isArray(parsedScenario.events)) {
    return { nodes: [], edges: [] };
  }
  const nodes = parsedScenario.events.map((e, i) => ({ id: i, label: e })));
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id });
  }
  return { nodes, edges };
}

module.exports = { buildGraph };
