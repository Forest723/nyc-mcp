import express from 'express';
import cors from 'cors';
import searchEvents from './tools/search_events.js';
import getUpcomingEvents from './tools/get_upcoming_events.js';
import analyzeEventImpact from './tools/analyze_event_impact.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nyc-events-mcp' });
});

// MCP metadata endpoint
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'nyc-events',
    version: '1.0.0',
    description: 'NYC Event Calendar MCP',
    capabilities: ['events', 'street_events', 'permits'],
    tools: [
      {
        name: 'search_events',
        description: 'Search permitted events',
        parameters: {
          event_type: 'string (optional)',
          borough: 'string (optional)',
          start_date: 'string (optional, YYYY-MM-DD)',
          end_date: 'string (optional, YYYY-MM-DD)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_upcoming_events',
        description: 'Get upcoming events in the next N days',
        parameters: {
          days: 'number (optional, default: 30)',
          borough: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'analyze_event_impact',
        description: 'Analyze event density and street impact',
        parameters: {
          borough: 'string (optional)',
          days: 'number (optional, default: 30)'
        }
      }
    ]
  });
});

// Tool endpoints
app.post('/tools/search_events', async (req, res) => {
  try {
    const result = await searchEvents(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_upcoming_events', async (req, res) => {
  try {
    const result = await getUpcomingEvents(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/analyze_event_impact', async (req, res) => {
  try {
    const result = await analyzeEventImpact(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC Events MCP Server running on port ${PORT}`);
});
