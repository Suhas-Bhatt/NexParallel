// src/services/reportGenerator.test.js

const { generateCsv } = require('./reportGenerator');

describe('generateCsv', () => {
  test('creates CSV with headers and data rows', () => {
    const sampleResult = {
      universes: [
        { id: 'U1', generatedAt: '2023-01-01', aggregateScore: 85 },
        { id: 'U2', generatedAt: '2023-01-02', aggregateScore: 90 }
      ],
      scored: [
        { id: 'U1', riskScore: 0.2 },
        { id: 'U2', riskScore: 0.1 }
      ],
      recommendations: 'Increase diversification.'
    };

    const csv = generateCsv(sampleResult);
    const lines = csv.split('\n');
    // Header
    expect(lines[0]).toBe('UniverseID,GeneratedAt,AggregateScore,RiskScore');
    // Data rows
    expect(lines[1]).toBe('U1,2023-01-01,85,0.2');
    expect(lines[2]).toBe('U2,2023-01-02,90,0.1');
    // Blank line then recommendations header
    expect(lines[3]).toBe('');
    expect(lines[4]).toBe('Recommendations');
    expect(lines[5]).toMatch(/Increase diversification/);
  });
});
