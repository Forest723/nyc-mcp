#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://localhost:4000';

const server = new Server(
  {
    name: 'nyc-mcp-orchestrator',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_nyc_data',
        description: 'Query NYC data across all available sources. The orchestrator will automatically route your question to the appropriate data sources and synthesize the results.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Natural language query about NYC data (e.g., "What are the noise complaints in Brooklyn?" or "Show construction activity and 311 complaints in Manhattan")',
            },
            context: {
              type: 'object',
              description: 'Optional context parameters',
              properties: {
                borough: {
                  type: 'string',
                  description: 'NYC borough (MANHATTAN, BROOKLYN, QUEENS, BRONX, STATEN ISLAND)',
                },
                days: {
                  type: 'number',
                  description: 'Number of days to look back (default: 30)',
                },
                limit: {
                  type: 'number',
                  description: 'Maximum number of results (default: 100)',
                },
              },
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'list_available_mcps',
        description: 'List all available MCP data sources and their capabilities',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'query_nyc_data') {
      const response = await fetch(`${ORCHESTRATOR_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: args.query,
          context: args.context || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } else if (name === 'list_available_mcps') {
      const response = await fetch(`${ORCHESTRATOR_URL}/mcps`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NYC MCP Orchestrator wrapper running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
