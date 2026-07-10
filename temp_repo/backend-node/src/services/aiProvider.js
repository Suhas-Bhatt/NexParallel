// src/services/aiProvider.js
const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const logger = require('../utils/logger');

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.BEDROCK_ACCESS_KEY_ID,
    secretAccessKey: process.env.BEDROCK_SECRET_ACCESS_KEY
  }
});

/**
 * Helper to invoke Claude via Bedrock.
 * @param {string} prompt - Full prompt string (including user scenario)
 * @returns {Promise<any>} Parsed JSON response from Claude.
 */
async function invokeClaude(prompt) {
  const command = new InvokeModelCommand({
    modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // example model
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({ prompt })
  });
  const response = await client.send(command);
  const payload = Buffer.from(response.body).toString('utf-8');
  return JSON.parse(payload);
}

async function parseScenario(scenarioText) {
  const prompt = `Parse the following stock‑market scenario into a structured JSON with an array of events and parameters.\nScenario: "${scenarioText}"`;
  logger.info('Calling Bedrock for scenario parsing');
  const result = await invokeClaude(prompt);
  return result; // Expected to be JSON object
}

async function recommend(topUniverse) {
  const prompt = `Given the following universe data, generate a concise set of actionable recommendations in plain English.\nUniverse: ${JSON.stringify(topUniverse, null, 2)}`;
  logger.info('Calling Bedrock for recommendations');
  const result = await invokeClaude(prompt);
  return result; // Expected to be a string or structured object
}

module.exports = { parseScenario, recommend };
