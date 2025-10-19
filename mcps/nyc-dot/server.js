import express from 'express';
import cors from 'cors';
import searchStreetClosures from './tools/search_street_closures.js';
import getParkingViolations from './tools/get_parking_violations.js';
import getTrafficVolume from './tools/get_traffic_volume.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nyc-dot-mcp' });
});

// MCP metadata endpoint
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'nyc-dot',
    version: '1.0.0',
    description: 'NYC Department of Transportation MCP',
    capabilities: ['street_closures', 'parking', 'traffic', 'transportation'],
    tools: [
      {
        name: 'search_street_closures',
        description: 'Search for street closures',
        parameters: {
          borough: 'string (optional)',
          work_type: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_parking_violations',
        description: 'Get open parking violations',
        parameters: {
          county: 'string (optional)',
          violation_code: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_traffic_volume',
        description: 'Get traffic volume data',
        parameters: {
          boro: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      }
    ]
  });
});

// Tool endpoints
app.post('/tools/search_street_closures', async (req, res) => {
  try {
    const result = await searchStreetClosures(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_parking_violations', async (req, res) => {
  try {
    const result = await getParkingViolations(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_traffic_volume', async (req, res) => {
  try {
    const result = await getTrafficVolume(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC DOT MCP Server running on port ${PORT}`);
});
