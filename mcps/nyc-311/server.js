import express from 'express';
import cors from 'cors';
import searchComplaints from './tools/search_complaints.js';
import getResponseTimes from './tools/get_response_times.js';
import analyzeTrends from './tools/analyze_trends.js';
import getNeighborhoodHealth from './tools/get_neighborhood_health.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nyc-311-mcp' });
});

// MCP metadata endpoint
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'nyc-311',
    version: '1.0.0',
    description: 'NYC 311 Service Requests MCP',
    capabilities: ['complaints', 'response_times', 'trends', 'health_assessment'],
    tools: [
      {
        name: 'search_complaints',
        description: 'Search 311 service requests by type, location, or date range',
        parameters: {
          complaint_type: 'string (optional)',
          borough: 'string (optional)',
          start_date: 'string (optional, YYYY-MM-DD)',
          end_date: 'string (optional, YYYY-MM-DD)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_response_times',
        description: 'Analyze response times for service requests',
        parameters: {
          complaint_type: 'string (optional)',
          borough: 'string (optional)',
          days: 'number (optional, default: 30)'
        }
      },
      {
        name: 'analyze_trends',
        description: 'Identify trends in 311 complaints over time',
        parameters: {
          complaint_type: 'string (optional)',
          borough: 'string (optional)',
          group_by: 'string (optional: day, week, month)',
          days: 'number (optional, default: 90)'
        }
      },
      {
        name: 'get_neighborhood_health',
        description: 'Get comprehensive health indicators from 311 data including resolution rates, trends, and civic engagement',
        parameters: {
          borough: 'string (optional)',
          days: 'number (optional, default: 90)'
        }
      }
    ]
  });
});

// Tool endpoints
app.post('/tools/search_complaints', async (req, res) => {
  try {
    const result = await searchComplaints(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_response_times', async (req, res) => {
  try {
    const result = await getResponseTimes(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/analyze_trends', async (req, res) => {
  try {
    const result = await analyzeTrends(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_neighborhood_health', async (req, res) => {
  try {
    const result = await getNeighborhoodHealth(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC 311 MCP Server running on port ${PORT}`);
});
