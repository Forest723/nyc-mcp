#!/usr/bin/env node

/**
 * NYC Open Data MCP Server
 *
 * A single MCP server providing access to multiple NYC Open Data sources:
 * - 311 Service Requests
 * - HPD Housing Violations
 * - NYC Events Calendar
 * - DOT Traffic/Street Closures
 * - Comptroller Financial Data
 *
 * Uses Socrata Open Data API (no authentication required, 1000 req/day limit)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool implementations
import searchComplaints from './mcps/nyc-311/tools/search_complaints.js';
import getResponseTimes from './mcps/nyc-311/tools/get_response_times.js';
import analyzeTrends from './mcps/nyc-311/tools/analyze_trends.js';
import getNeighborhoodHealth from './mcps/nyc-311/tools/get_neighborhood_health.js';

const server = new Server(
  {
    name: 'nyc-open-data',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
const TOOLS = [
  // ========== 311 Service Requests ==========
  {
    name: 'search_311_complaints',
    description: 'Search NYC 311 service requests by type, location, or date range. Use this to find specific complaints like noise, heat/hot water, street conditions, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        complaint_type: {
          type: 'string',
          description: 'Type of complaint (e.g., "Noise - Residential", "Heat/Hot Water", "Illegal Parking")',
        },
        borough: {
          type: 'string',
          description: 'NYC borough (MANHATTAN, BROOKLYN, QUEENS, BRONX, STATEN ISLAND)',
        },
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 100)',
          default: 100,
        },
      },
    },
  },
  {
    name: 'get_311_response_times',
    description: 'Analyze response times for 311 service requests. Shows average time to close tickets by complaint type and borough.',
    inputSchema: {
      type: 'object',
      properties: {
        complaint_type: {
          type: 'string',
          description: 'Type of complaint to analyze',
        },
        borough: {
          type: 'string',
          description: 'NYC borough to filter by',
        },
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 30)',
          default: 30,
        },
      },
    },
  },
  {
    name: 'analyze_311_trends',
    description: 'Identify trends in 311 complaints over time. Shows patterns by day, week, or month.',
    inputSchema: {
      type: 'object',
      properties: {
        complaint_type: {
          type: 'string',
          description: 'Type of complaint to analyze',
        },
        borough: {
          type: 'string',
          description: 'NYC borough to filter by',
        },
        group_by: {
          type: 'string',
          enum: ['day', 'week', 'month'],
          description: 'Time period to group by',
        },
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 90)',
          default: 90,
        },
      },
    },
  },
  {
    name: 'get_neighborhood_health',
    description: 'Get comprehensive neighborhood health indicators from 311 data including resolution rates, complaint density, trends, and civic engagement metrics.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'NYC borough to analyze',
        },
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 90)',
          default: 90,
        },
      },
    },
  },

  // ========== Housing (HPD) ==========
  // TODO: Add HPD tools once implemented

  // ========== Events ==========
  // TODO: Add Events tools once implemented

  // ========== DOT Traffic ==========
  // TODO: Add DOT tools once implemented

  // ========== Comptroller ==========
  // TODO: Add Comptroller tools once implemented
];

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    let result;

    // 311 Service Request tools
    switch (name) {
      case 'search_311_complaints':
        result = await searchComplaints(args || {});
        break;
      case 'get_311_response_times':
        result = await getResponseTimes(args || {});
        break;
      case 'analyze_311_trends':
        result = await analyzeTrends(args || {});
        break;
      case 'get_neighborhood_health':
        result = await getNeighborhoodHealth(args || {});
        break;

      // HPD tools
      // case 'search_hpd_violations':
      //   result = await searchViolations(args || {});
      //   break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('NYC Open Data MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
