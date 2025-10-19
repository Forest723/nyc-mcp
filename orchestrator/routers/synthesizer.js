/**
 * Synthesizer - Combines results from multiple MCPs into coherent responses
 */

export default {
  synthesize(query, results, routing) {
    if (results.length === 0) {
      return {
        summary: 'No results found',
        insights: []
      };
    }

    // Single MCP result
    if (results.length === 1) {
      return this.synthesizeSingle(results[0], query);
    }

    // Multiple MCP results - find correlations
    return this.synthesizeMultiple(results, query);
  },

  synthesizeSingle(result, query) {
    const { mcp, tool, data } = result;

    const summary = this.generateSummary(mcp, tool, data);
    const insights = this.extractInsights(mcp, tool, data);

    return {
      summary,
      insights,
      data_sources: [mcp],
      query_type: 'single_source'
    };
  },

  synthesizeMultiple(results, query) {
    const summaries = results.map(r => this.generateSummary(r.mcp, r.tool, r.data));
    const insights = results.flatMap(r => this.extractInsights(r.mcp, r.tool, r.data));

    // Find cross-MCP correlations
    const correlations = this.findCorrelations(results);

    return {
      summary: `Analyzed data from ${results.length} sources: ${summaries.join('; ')}`,
      insights,
      correlations,
      data_sources: results.map(r => r.mcp),
      query_type: 'multi_source'
    };
  },

  generateSummary(mcp, tool, data) {
    if (!data.success) {
      return `${mcp} returned no results`;
    }

    if (mcp === 'nyc-311') {
      if (tool === 'search_complaints') {
        return `Found ${data.count} 311 complaints`;
      } else if (tool === 'get_response_times') {
        return `Average response time: ${data.summary?.average_hours?.toFixed(1)} hours`;
      } else if (tool === 'analyze_trends') {
        return `311 complaints are ${data.trend?.direction} by ${Math.abs(data.trend?.percentage_change)}%`;
      }
    }

    if (mcp === 'nyc-dob') {
      if (tool === 'search_violations') {
        return `Found ${data.count} DOB violations`;
      } else if (tool === 'search_permits') {
        return `Found ${data.count} building permits`;
      } else if (tool === 'get_construction_activity') {
        return `${data.total_permits} construction permits filed`;
      }
    }

    if (mcp === 'nyc-property') {
      if (tool === 'get_sales_history') {
        return `${data.count} property sales, median price: $${data.statistics?.median_price?.toLocaleString()}`;
      } else if (tool === 'search_properties') {
        return `Found ${data.count} properties`;
      }
    }

    return `${mcp} returned data`;
  },

  extractInsights(mcp, tool, data) {
    const insights = [];

    if (!data.success) return insights;

    if (mcp === 'nyc-311') {
      if (tool === 'get_response_times' && data.by_complaint_type) {
        const fastest = data.by_complaint_type[0];
        const slowest = data.by_complaint_type[data.by_complaint_type.length - 1];

        if (fastest) {
          insights.push({
            type: 'fastest_response',
            message: `Fastest response: ${fastest.complaint_type} (${fastest.avg_hours.toFixed(1)} hours)`
          });
        }

        if (slowest && slowest !== fastest) {
          insights.push({
            type: 'slowest_response',
            message: `Slowest response: ${slowest.complaint_type} (${slowest.avg_hours.toFixed(1)} hours)`
          });
        }
      }

      if (tool === 'analyze_trends' && data.trend) {
        insights.push({
          type: 'trend',
          message: `Complaints are ${data.trend.direction} by ${Math.abs(data.trend.percentage_change)}%`
        });
      }
    }

    if (mcp === 'nyc-dob') {
      if (tool === 'get_construction_activity' && data.by_borough) {
        const topBorough = data.by_borough[0];
        if (topBorough) {
          insights.push({
            type: 'construction_hotspot',
            message: `Most construction activity in ${topBorough.borough} (${topBorough.count} permits)`
          });
        }
      }
    }

    if (mcp === 'nyc-property') {
      if (tool === 'get_sales_history' && data.statistics) {
        const { average_price, median_price } = data.statistics;
        const diff = ((average_price - median_price) / median_price * 100).toFixed(1);

        insights.push({
          type: 'price_distribution',
          message: `Average price is ${diff}% ${diff > 0 ? 'above' : 'below'} median, suggesting ${Math.abs(diff) > 20 ? 'high-value outliers' : 'balanced distribution'}`
        });
      }
    }

    return insights;
  },

  findCorrelations(results) {
    const correlations = [];

    // Check for 311 complaints + DOB violations correlation
    const complaints311 = results.find(r => r.mcp === 'nyc-311');
    const dobViolations = results.find(r => r.mcp === 'nyc-dob' && r.tool === 'search_violations');

    if (complaints311 && dobViolations) {
      correlations.push({
        type: 'complaint_violation_correlation',
        message: `Area has both 311 complaints (${complaints311.data.count}) and DOB violations (${dobViolations.data.count})`,
        strength: 'moderate'
      });
    }

    // Check for construction activity + property sales correlation
    const construction = results.find(r => r.mcp === 'nyc-dob' && r.tool === 'get_construction_activity');
    const sales = results.find(r => r.mcp === 'nyc-property' && r.tool === 'get_sales_history');

    if (construction && sales) {
      correlations.push({
        type: 'construction_sales_correlation',
        message: `${construction.data.total_permits} construction permits with ${sales.data.count} recent sales in area`,
        strength: 'moderate'
      });
    }

    return correlations;
  }
};
