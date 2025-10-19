import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import queryRouter from './routers/query_router.js';
import synthesizer from './routers/synthesizer.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Load registry
let registry;
try {
  const registryData = await fs.readFile('./registry.json', 'utf-8');
  registry = JSON.parse(registryData);
  console.log(`Loaded registry with ${registry.mcps.length} MCPs`);
} catch (error) {
  console.error('Failed to load registry:', error);
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'nyc-mcp-orchestrator',
    registered_mcps: registry.mcps.length
  });
});

// Get available MCPs
app.get('/mcps', (req, res) => {
  res.json(registry);
});

// Main query endpoint
app.post('/query', async (req, res) => {
  try {
    const { query, context = {} } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`Received query: ${query}`);

    // Step 1: Route the query to appropriate MCPs
    const routing = await queryRouter.routeQuery(query, registry, context);
    console.log(`Routing to MCPs: ${routing.selectedMCPs.map(m => m.name).join(', ')}`);

    // Step 2: Execute calls to selected MCPs
    const mcpResults = await Promise.allSettled(
      routing.selectedMCPs.map(async (mcp) => {
        const tool = routing.toolCalls.find(tc => tc.mcpName === mcp.name);
        if (!tool) return null;

        try {
          const response = await fetch(`${mcp.url}/tools/${tool.toolName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tool.parameters)
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const data = await response.json();
          return {
            mcp: mcp.name,
            tool: tool.toolName,
            data
          };
        } catch (error) {
          console.error(`Error calling ${mcp.name}:`, error);
          return {
            mcp: mcp.name,
            tool: tool.toolName,
            error: error.message
          };
        }
      })
    );

    // Extract successful results
    const results = mcpResults
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);

    // Step 3: Synthesize results
    const synthesis = synthesizer.synthesize(query, results, routing);

    res.json({
      query,
      routing: {
        selectedMCPs: routing.selectedMCPs.map(m => m.name),
        reasoning: routing.reasoning
      },
      results,
      synthesis
    });

  } catch (error) {
    console.error('Query processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Direct MCP tool call (for advanced use)
app.post('/call/:mcpName/:toolName', async (req, res) => {
  try {
    const { mcpName, toolName } = req.params;
    const parameters = req.body;

    const mcp = registry.mcps.find(m => m.name === mcpName);
    if (!mcp) {
      return res.status(404).json({ error: 'MCP not found' });
    }

    const response = await fetch(`${mcp.url}/tools/${toolName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters)
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`NYC MCP Orchestrator running on port ${PORT}`);
  console.log(`Registered MCPs: ${registry.mcps.map(m => m.name).join(', ')}`);
});
