import express from 'express';
import cors from 'cors';
import searchViolations from './tools/search_violations.js';
import searchComplaints from './tools/search_complaints.js';
import getRegistrations from './tools/get_registrations.js';
import getHousingHealth from './tools/get_housing_health.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nyc-hpd-mcp' });
});

// MCP metadata endpoint
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'nyc-hpd',
    version: '1.0.0',
    description: 'NYC Housing Preservation & Development MCP',
    capabilities: ['violations', 'complaints', 'registrations', 'housing', 'health_assessment'],
    tools: [
      {
        name: 'search_violations',
        description: 'Search HPD housing code violations',
        parameters: {
          borough: 'string (optional)',
          bin: 'string (optional, Building Identification Number)',
          status: 'string (optional: Open, Closed)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'search_complaints',
        description: 'Search HPD housing complaints',
        parameters: {
          borough: 'string (optional)',
          status: 'string (optional)',
          days: 'number (optional, default: 30)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_registrations',
        description: 'Get building registration information',
        parameters: {
          borough: 'string (optional)',
          zip: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_housing_health',
        description: 'Get comprehensive housing health assessment including violation rates, complaint trends, and problem buildings',
        parameters: {
          borough: 'string (optional)',
          days: 'number (optional, default: 90)'
        }
      }
    ]
  });
});

// Tool endpoints
app.post('/tools/search_violations', async (req, res) => {
  try {
    const result = await searchViolations(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/search_complaints', async (req, res) => {
  try {
    const result = await searchComplaints(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_registrations', async (req, res) => {
  try {
    const result = await getRegistrations(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_housing_health', async (req, res) => {
  try {
    const result = await getHousingHealth(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC HPD MCP Server running on port ${PORT}`);
});
