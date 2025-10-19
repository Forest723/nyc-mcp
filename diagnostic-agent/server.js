import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import diagnosticEngine from './diagnostic_engine.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://orchestrator:4000';

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'diagnostic-agent' });
});

// Main diagnostic endpoint
app.post('/diagnose', async (req, res) => {
  try {
    const { query, context = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Diagnostic request: ${query}`);

    // Step 1: Get raw data from orchestrator
    const orchestratorResponse = await fetch(`${ORCHESTRATOR_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context })
    });

    if (!orchestratorResponse.ok) {
      throw new Error(`Orchestrator returned ${orchestratorResponse.status}`);
    }

    const orchestratorData = await orchestratorResponse.json();

    // Step 2: Apply diagnostic intelligence
    const diagnosis = await diagnosticEngine.diagnose(query, orchestratorData, context);

    res.json({
      query,
      diagnosis,
      raw_data: orchestratorData // Include for transparency
    });

  } catch (error) {
    console.error('Diagnostic error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Neighborhood health report endpoint
app.post('/neighborhood-health', async (req, res) => {
  try {
    const { borough, zip, days = 90 } = req.body;

    if (!borough && !zip) {
      return res.status(400).json({ error: 'Borough or zip code required' });
    }

    console.log(`Neighborhood health report: ${borough || zip}`);

    // Fetch health data from all relevant MCPs
    const healthData = await diagnosticEngine.getNeighborhoodHealth({ borough, zip, days });

    res.json(healthData);

  } catch (error) {
    console.error('Health report error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Systems analysis endpoint - for understanding interconnections
app.post('/systems-analysis', async (req, res) => {
  try {
    const { focus, borough, days = 90 } = req.body;

    // Focus areas: housing, infrastructure, events, finance
    if (!focus) {
      return res.status(400).json({ error: 'Focus area required' });
    }

    const analysis = await diagnosticEngine.analyzeSystem({ focus, borough, days });

    res.json(analysis);

  } catch (error) {
    console.error('Systems analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Diagnostic Agent running on port ${PORT}`);
  console.log(`Connected to orchestrator at: ${ORCHESTRATOR_URL}`);
});
