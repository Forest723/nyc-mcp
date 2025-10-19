import express from 'express';
import cors from 'cors';
import searchSpending from './tools/search_spending.js';
import searchContracts from './tools/search_contracts.js';
import getPayroll from './tools/get_payroll.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nyc-comptroller-mcp' });
});

// MCP metadata endpoint
app.get('/mcp/info', (req, res) => {
  res.json({
    name: 'nyc-comptroller',
    version: '1.0.0',
    description: 'NYC Comptroller Financial Data MCP',
    capabilities: ['spending', 'contracts', 'payroll', 'budget'],
    tools: [
      {
        name: 'search_spending',
        description: 'Search city spending data',
        parameters: {
          agency: 'string (optional)',
          min_amount: 'number (optional)',
          max_amount: 'number (optional)',
          fiscal_year: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'search_contracts',
        description: 'Search city contracts',
        parameters: {
          agency: 'string (optional)',
          vendor: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      },
      {
        name: 'get_payroll',
        description: 'Get city payroll data',
        parameters: {
          agency: 'string (optional)',
          fiscal_year: 'string (optional)',
          title: 'string (optional)',
          limit: 'number (optional, default: 100)'
        }
      }
    ]
  });
});

// Tool endpoints
app.post('/tools/search_spending', async (req, res) => {
  try {
    const result = await searchSpending(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/search_contracts', async (req, res) => {
  try {
    const result = await searchContracts(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tools/get_payroll', async (req, res) => {
  try {
    const result = await getPayroll(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC Comptroller MCP Server running on port ${PORT}`);
});
