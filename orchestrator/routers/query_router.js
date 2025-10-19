/**
 * Query Router - Analyzes queries and routes to appropriate MCPs
 */

export default {
  async routeQuery(query, registry, context = {}) {
    const queryLower = query.toLowerCase();
    const selectedMCPs = [];
    const toolCalls = [];
    let reasoning = [];

    // Analyze query for each MCP
    for (const mcp of registry.mcps) {
      const score = this.calculateRelevanceScore(queryLower, mcp);

      if (score > 0) {
        selectedMCPs.push({ ...mcp, relevanceScore: score });

        // Determine which tools to call
        const tools = this.selectTools(queryLower, mcp, context);
        toolCalls.push(...tools);

        reasoning.push(`${mcp.name} (score: ${score}): ${this.explainSelection(queryLower, mcp)}`);
      }
    }

    // Sort by relevance score
    selectedMCPs.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // If no MCPs selected, default to 311 for general queries
    if (selectedMCPs.length === 0) {
      const defaultMCP = registry.mcps.find(m => m.name === 'nyc-311');
      if (defaultMCP) {
        selectedMCPs.push({ ...defaultMCP, relevanceScore: 0.5 });
        toolCalls.push({
          mcpName: 'nyc-311',
          toolName: 'search_complaints',
          parameters: { limit: 50 }
        });
        reasoning.push('No specific matches found, defaulting to 311 search');
      }
    }

    return {
      selectedMCPs,
      toolCalls,
      reasoning
    };
  },

  calculateRelevanceScore(query, mcp) {
    let score = 0;

    // Check keyword matches
    for (const keyword of mcp.keywords) {
      if (query.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }

    // Check capability matches
    for (const capability of mcp.capabilities) {
      if (query.includes(capability)) {
        score += 2;
      }
    }

    // Check description match
    const descWords = mcp.description.toLowerCase().split(' ');
    for (const word of descWords) {
      if (word.length > 3 && query.includes(word)) {
        score += 0.5;
      }
    }

    return score;
  },

  selectTools(query, mcp, context) {
    const tools = [];

    // Extract common parameters
    const params = this.extractParameters(query, context);

    if (mcp.name === 'nyc-311') {
      if (query.includes('trend') || query.includes('over time') || query.includes('increase') || query.includes('decrease')) {
        tools.push({
          mcpName: 'nyc-311',
          toolName: 'analyze_trends',
          parameters: params
        });
      } else if (query.includes('response time') || query.includes('how long') || query.includes('fast')) {
        tools.push({
          mcpName: 'nyc-311',
          toolName: 'get_response_times',
          parameters: params
        });
      } else {
        tools.push({
          mcpName: 'nyc-311',
          toolName: 'search_complaints',
          parameters: params
        });
      }
    }

    if (mcp.name === 'nyc-dob') {
      if (query.includes('permit')) {
        tools.push({
          mcpName: 'nyc-dob',
          toolName: 'search_permits',
          parameters: params
        });
      } else if (query.includes('violation')) {
        tools.push({
          mcpName: 'nyc-dob',
          toolName: 'search_violations',
          parameters: params
        });
      } else if (query.includes('construction') || query.includes('activity')) {
        tools.push({
          mcpName: 'nyc-dob',
          toolName: 'get_construction_activity',
          parameters: params
        });
      } else {
        tools.push({
          mcpName: 'nyc-dob',
          toolName: 'search_violations',
          parameters: params
        });
      }
    }

    if (mcp.name === 'nyc-property') {
      if (query.includes('sale') || query.includes('sold') || query.includes('price')) {
        tools.push({
          mcpName: 'nyc-property',
          toolName: 'get_sales_history',
          parameters: params
        });
      } else if (query.includes('property') || query.includes('building')) {
        tools.push({
          mcpName: 'nyc-property',
          toolName: 'search_properties',
          parameters: params
        });
      }
    }

    return tools;
  },

  extractParameters(query, context) {
    const params = {};

    // Extract borough
    const boroughs = ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island'];
    for (const borough of boroughs) {
      if (query.includes(borough)) {
        params.borough = borough;
        break;
      }
    }

    // Extract time ranges
    if (query.includes('last week')) {
      params.days = 7;
    } else if (query.includes('last month')) {
      params.days = 30;
    } else if (query.includes('last year')) {
      params.days = 365;
    }

    // Extract complaint types (common ones)
    const complaintTypes = [
      'noise', 'heat', 'water', 'garbage', 'parking',
      'graffiti', 'pothole', 'street condition'
    ];
    for (const type of complaintTypes) {
      if (query.includes(type)) {
        params.complaint_type = type.toUpperCase();
        break;
      }
    }

    // Use context overrides
    if (context.borough) params.borough = context.borough;
    if (context.days) params.days = context.days;
    if (context.limit) params.limit = context.limit;

    return params;
  },

  explainSelection(query, mcp) {
    const matches = mcp.keywords.filter(k => query.includes(k.toLowerCase()));
    if (matches.length > 0) {
      return `Matched keywords: ${matches.join(', ')}`;
    }
    return 'General relevance to query';
  }
};
