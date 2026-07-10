// src/services/reportGenerator.js
/**
 * Convert the simulation result object into a CSV string.
 * The result shape (as stored by workflow.js) is:
 * {
 *   universes: [{id, generatedAt, metrics, aggregateScore, ...}],
 *   scored: [{...universe..., riskScore}],
 *   recommendations: <string or object>
 * }
 */
function generateCsv(result) {
  const lines = [];
  // Header for universes
  lines.push('UniverseID,GeneratedAt,AggregateScore,RiskScore');
  const scoredMap = new Map();
  if (Array.isArray(result.scored)) {
    result.scored.forEach(u => scoredMap.set(u.id, u.riskScore));
  }
  if (Array.isArray(result.universes)) {
    result.universes.forEach(u => {
      const risk = scoredMap.get(u.id) ?? '';
      lines.push(`${u.id},${u.generatedAt},${u.aggregateScore ?? ''},${risk}`);
    });
  }
  // Add a blank line then recommendations
  lines.push('');
  lines.push('Recommendations');
  const rec = typeof result.recommendations === 'object' ? JSON.stringify(result.recommendations) : result.recommendations;
  lines.push(`"${rec?.replace(/"/g, '""') ?? ''}"`);
  return lines.join('\n');
}

module.exports = { generateCsv };
