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
import searchSpending from './mcps/nyc-comptroller/tools/search_spending.js';
import searchContracts from './mcps/nyc-comptroller/tools/search_contracts.js';
import getPayroll from './mcps/nyc-comptroller/tools/get_payroll.js';
import searchStreetClosures from './mcps/nyc-dot/tools/search_street_closures.js';
import getParkingViolations from './mcps/nyc-dot/tools/get_parking_violations.js';
import getTrafficVolume from './mcps/nyc-dot/tools/get_traffic_volume.js';
import searchEvents from './mcps/nyc-events/tools/search_events.js';
import getUpcomingEvents from './mcps/nyc-events/tools/get_upcoming_events.js';
import analyzeEventImpact from './mcps/nyc-events/tools/analyze_event_impact.js';
import searchViolations from './mcps/nyc-hpd/tools/search_violations.js';
import searchHPDComplaints from './mcps/nyc-hpd/tools/search_complaints.js';
import getRegistrations from './mcps/nyc-hpd/tools/get_registrations.js';
import getHousingHealth from './mcps/nyc-hpd/tools/get_housing_health.js';

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

  // ========== Housing Preservation & Development (HPD) ==========
  {
    name: 'search_hpd_violations',
    description: 'Search NYC housing violations from HPD. Find building code violations, safety issues, and compliance problems by borough, building, or status.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'Borough ID (1=Manhattan, 2=Bronx, 3=Brooklyn, 4=Queens, 5=Staten Island)',
        },
        bin: {
          type: 'string',
          description: 'Building Identification Number (BIN)',
        },
        status: {
          type: 'string',
          description: 'Violation status (e.g., "Open", "Close")',
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
    name: 'search_hpd_complaints',
    description: 'Search HPD housing complaints. Find tenant complaints about heating, hot water, pests, leaks, and other housing issues.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'Borough ID to filter by',
        },
        status: {
          type: 'string',
          description: 'Complaint status to filter by',
        },
        days: {
          type: 'number',
          description: 'Number of days to look back (default: 30)',
          default: 30,
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
    name: 'get_hpd_registrations',
    description: 'Get HPD building registrations. View registered rental buildings, owners, and registration status by borough or zip code.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'Borough ID to filter by',
        },
        zip: {
          type: 'string',
          description: 'ZIP code to filter by',
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
    name: 'get_housing_health',
    description: 'Analyze comprehensive housing health indicators. Combines violations and complaints to assess housing quality, identify problem buildings, and track trends.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'Borough ID to analyze',
        },
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 90)',
          default: 90,
        },
      },
    },
  },

  // ========== NYC Events Calendar ==========
  {
    name: 'search_events',
    description: 'Search NYC events sponsored by the City. Find events by type, borough, and date range. Same data as nyc.gov "Find Local Events".',
    inputSchema: {
      type: 'object',
      properties: {
        event_type: {
          type: 'string',
          description: 'Type of event (e.g., "Special Event", "Sport - Youth", "Film/TV Production")',
        },
        borough: {
          type: 'string',
          description: 'NYC borough (Manhattan, Brooklyn, Queens, Bronx, Staten Island)',
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
    name: 'get_upcoming_events',
    description: 'Get upcoming NYC events in the next N days. Filter by borough to see what\'s happening soon in your area.',
    inputSchema: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look ahead (default: 30)',
          default: 30,
        },
        borough: {
          type: 'string',
          description: 'NYC borough to filter by',
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
    name: 'analyze_event_impact',
    description: 'Analyze NYC event patterns and density. Get breakdowns by type, borough, and timeline to understand event impact on neighborhoods.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'NYC borough to analyze',
        },
        days: {
          type: 'number',
          description: 'Number of days to analyze (default: 30)',
          default: 30,
        },
      },
    },
  },

  // ========== DOT Traffic & Transportation ==========
  {
    name: 'search_dot_street_closures',
    description: 'Search NYC DOT street closures and construction worksites. Find active street work, paving projects, and planned road closures by borough.',
    inputSchema: {
      type: 'object',
      properties: {
        borough: {
          type: 'string',
          description: 'Borough code (M=Manhattan, K=Brooklyn, Q=Queens, X=Bronx, S=Staten Island)',
        },
        work_type: {
          type: 'string',
          description: 'Type of work (e.g., "Paving", "Construction")',
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
    name: 'get_dot_parking_violations',
    description: 'Search NYC parking violations data. Find parking tickets by county, violation code, and view fines, penalties, and summons details.',
    inputSchema: {
      type: 'object',
      properties: {
        county: {
          type: 'string',
          description: 'County code (NY=Manhattan, K=Brooklyn/Kings, Q=Queens, BX=Bronx, R=Staten Island/Richmond)',
        },
        violation_code: {
          type: 'string',
          description: 'Violation code to filter by',
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
    name: 'get_dot_traffic_volume',
    description: 'Get NYC DOT traffic volume data with hourly breakdowns. Analyze traffic patterns by roadway, direction, and time of day.',
    inputSchema: {
      type: 'object',
      properties: {
        boro: {
          type: 'string',
          description: 'Borough to filter by',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 100)',
          default: 100,
        },
      },
    },
  },

  // ========== Comptroller Financial Data ==========
  {
    name: 'search_comptroller_spending',
    description: 'Search NYC expense budget data from the Comptroller. View budgeted amounts by agency, fiscal year, and budget category. Note: This shows budgeted amounts, not actual transaction-level spending.',
    inputSchema: {
      type: 'object',
      properties: {
        agency: {
          type: 'string',
          description: 'Agency name to filter by (e.g., "Department of Education", "NYPD")',
        },
        min_amount: {
          type: 'number',
          description: 'Minimum check amount',
        },
        max_amount: {
          type: 'number',
          description: 'Maximum check amount',
        },
        fiscal_year: {
          type: 'string',
          description: 'Fiscal year (e.g., "2024")',
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
    name: 'search_comptroller_contracts',
    description: 'Search NYC government contracts from Checkbook NYC. Find contracts by agency, vendor, and view contract amounts, dates, and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        agency: {
          type: 'string',
          description: 'Agency name to filter by',
        },
        vendor: {
          type: 'string',
          description: 'Vendor name to filter by',
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
    name: 'get_comptroller_payroll',
    description: 'Get NYC government payroll data from Checkbook NYC. Search by agency, fiscal year, and job title to analyze city employee compensation.',
    inputSchema: {
      type: 'object',
      properties: {
        agency: {
          type: 'string',
          description: 'Agency name to filter by',
        },
        fiscal_year: {
          type: 'string',
          description: 'Fiscal year (e.g., "2024")',
        },
        title: {
          type: 'string',
          description: 'Job title to filter by',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 100)',
          default: 100,
        },
      },
    },
  },
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

      // Events tools
      case 'search_events':
        result = await searchEvents(args || {});
        break;
      case 'get_upcoming_events':
        result = await getUpcomingEvents(args || {});
        break;
      case 'analyze_event_impact':
        result = await analyzeEventImpact(args || {});
        break;

      // DOT tools
      case 'search_dot_street_closures':
        result = await searchStreetClosures(args || {});
        break;
      case 'get_dot_parking_violations':
        result = await getParkingViolations(args || {});
        break;
      case 'get_dot_traffic_volume':
        result = await getTrafficVolume(args || {});
        break;

      // Comptroller tools
      case 'search_comptroller_spending':
        result = await searchSpending(args || {});
        break;
      case 'search_comptroller_contracts':
        result = await searchContracts(args || {});
        break;
      case 'get_comptroller_payroll':
        result = await getPayroll(args || {});
        break;

      // HPD tools
      case 'search_hpd_violations':
        result = await searchViolations(args || {});
        break;
      case 'search_hpd_complaints':
        result = await searchHPDComplaints(args || {});
        break;
      case 'get_hpd_registrations':
        result = await getRegistrations(args || {});
        break;
      case 'get_housing_health':
        result = await getHousingHealth(args || {});
        break;

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
