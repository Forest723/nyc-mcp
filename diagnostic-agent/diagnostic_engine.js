/**
 * Diagnostic Engine - The City Understanding Brain
 *
 * This module contains the core intelligence for diagnosing urban systems.
 * It takes raw data from multiple MCPs and generates systemic insights.
 */

const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://orchestrator:4000';

export default {
  /**
   * Main diagnostic function
   * Takes raw multi-source data and generates systemic diagnosis
   */
  async diagnose(query, orchestratorData, context) {
    const { results, synthesis } = orchestratorData;

    // Extract structured health data
    const healthMetrics = this.extractHealthMetrics(results);

    // Identify stress signals
    const stressSignals = this.identifyStressSignals(healthMetrics);

    // Find assets and opportunities
    const assets = this.identifyAssets(healthMetrics);

    // Generate narrative
    const narrative = this.generateNarrative(query, healthMetrics, synthesis);

    // Imagine possibilities
    const possibilities = this.imaginePossibilities(healthMetrics, stressSignals, assets);

    // Generate suggestions
    const suggestions = this.generateSuggestions(healthMetrics, stressSignals, possibilities);

    return {
      health_indicators: healthMetrics,
      narrative,
      stress_signals: stressSignals,
      assets_and_opportunities: assets,
      possibilities,
      suggestions,
      overall_assessment: this.generateOverallAssessment(healthMetrics, stressSignals)
    };
  },

  /**
   * Extract health metrics from multi-source data
   */
  extractHealthMetrics(results) {
    const metrics = {
      service_responsiveness: null,
      housing_quality: null,
      infrastructure: null,
      community_vitality: null,
      resource_allocation: null
    };

    results.forEach(result => {
      const { mcp, data } = result;

      // Extract 311 health metrics
      if (mcp === 'nyc-311' && data.health_signals) {
        metrics.service_responsiveness = {
          resolution_rate: data.resolution_rate,
          avg_response_time: data.avg_resolution_days,
          trend: data.trend,
          status: data.health_signals.service_responsiveness,
          civic_engagement: data.health_signals.civic_engagement
        };
      }

      // Extract HPD health metrics
      if (mcp === 'nyc-hpd' && data.health_assessment) {
        metrics.housing_quality = {
          violation_burden: data.violations?.open_rate,
          complaint_resolution: data.complaints?.resolution_rate,
          trend: data.trend?.direction,
          problem_buildings: data.problem_buildings?.count,
          status: data.health_assessment.overall
        };
      }

      // Extract comptroller/spending data
      if (mcp === 'nyc-comptroller' && data.total_spending) {
        metrics.resource_allocation = {
          total_spending: data.total_spending,
          spending_count: data.count,
          avg_transaction: data.total_spending / data.count
        };
      }

      // Extract events data for community vitality
      if (mcp === 'nyc-events' && data.total_events) {
        metrics.community_vitality = {
          event_count: data.total_events,
          event_diversity: data.by_type?.length || 0,
          status: data.total_events > 20 ? 'high' : data.total_events > 10 ? 'moderate' : 'low'
        };
      }
    });

    return metrics;
  },

  /**
   * Identify stress signals in the data
   */
  identifyStressSignals(metrics) {
    const signals = [];

    // Service responsiveness stress
    if (metrics.service_responsiveness) {
      if (metrics.service_responsiveness.resolution_rate < 50) {
        signals.push({
          type: 'critical',
          domain: 'service_responsiveness',
          signal: `Low resolution rate (${metrics.service_responsiveness.resolution_rate}%)`,
          impact: 'Citizens not getting help, eroding trust in government'
        });
      }

      if (metrics.service_responsiveness.trend?.direction === 'increasing' &&
          metrics.service_responsiveness.trend?.magnitude_percent > 20) {
        signals.push({
          type: 'warning',
          domain: 'service_demand',
          signal: `Complaints increasing by ${metrics.service_responsiveness.trend.magnitude_percent}%`,
          impact: 'Worsening conditions or increased civic engagement'
        });
      }
    }

    // Housing quality stress
    if (metrics.housing_quality) {
      if (metrics.housing_quality.violation_burden > 50) {
        signals.push({
          type: 'critical',
          domain: 'housing_quality',
          signal: `High violation rate (${metrics.housing_quality.violation_burden}% open)`,
          impact: 'Significant housing quality issues affecting residents'
        });
      }

      if (metrics.housing_quality.problem_buildings > 10) {
        signals.push({
          type: 'enforcement_opportunity',
          domain: 'housing_quality',
          signal: `${metrics.housing_quality.problem_buildings} buildings with multiple violations`,
          impact: 'Concentrated landlord neglect - targeted enforcement could help many residents'
        });
      }

      if (metrics.housing_quality.trend === 'worsening') {
        signals.push({
          type: 'warning',
          domain: 'housing_trajectory',
          signal: 'Housing complaints increasing',
          impact: 'Deteriorating housing conditions'
        });
      }
    }

    // Resource allocation stress (if we have housing issues but low spending)
    if (metrics.housing_quality && metrics.resource_allocation) {
      if (metrics.housing_quality.violation_burden > 40 && metrics.resource_allocation.total_spending < 1000000) {
        signals.push({
          type: 'systemic',
          domain: 'resource_mismatch',
          signal: 'High housing needs but low city spending',
          impact: 'Resources not matching need - potential systemic neglect'
        });
      }
    }

    return signals;
  },

  /**
   * Identify assets and opportunities
   */
  identifyAssets(metrics) {
    const assets = [];

    // High civic engagement is an asset
    if (metrics.service_responsiveness?.civic_engagement === 'high') {
      assets.push({
        type: 'community_engagement',
        description: 'High 311 usage indicates engaged residents',
        opportunity: 'Leverage community organizing capacity for collective action'
      });
    }

    // Community events indicate social capital
    if (metrics.community_vitality?.status === 'high') {
      assets.push({
        type: 'social_capital',
        description: `${metrics.community_vitality.event_count} community events`,
        opportunity: 'Strong event-organizing infrastructure could be directed toward other community needs'
      });
    }

    // Good service responsiveness
    if (metrics.service_responsiveness?.resolution_rate > 70) {
      assets.push({
        type: 'effective_services',
        description: `${metrics.service_responsiveness.resolution_rate}% resolution rate`,
        opportunity: 'City agencies are responsive - residents can get help'
      });
    }

    // Improving trends
    if (metrics.service_responsiveness?.trend?.direction === 'decreasing') {
      assets.push({
        type: 'positive_trajectory',
        description: 'Complaints decreasing over time',
        opportunity: 'Interventions are working - double down on what is effective'
      });
    }

    if (metrics.housing_quality?.trend === 'improving') {
      assets.push({
        type: 'housing_improvement',
        description: 'Housing complaints trending down',
        opportunity: 'Housing quality improving - identify what is working'
      });
    }

    return assets;
  },

  /**
   * Generate narrative that tells the story
   */
  generateNarrative(query, metrics, synthesis) {
    let narrative = '';

    // Start with what the data is showing
    narrative += 'WHAT THE DATA SHOWS:\n';

    if (metrics.service_responsiveness) {
      narrative += `Service requests are being resolved at ${metrics.service_responsiveness.resolution_rate}% (${metrics.service_responsiveness.status}). `;
      narrative += `Civic engagement is ${metrics.service_responsiveness.civic_engagement}. `;
      if (metrics.service_responsiveness.trend) {
        narrative += `Complaints are ${metrics.service_responsiveness.trend.direction} by ${metrics.service_responsiveness.trend.magnitude_percent}%. `;
      }
      narrative += '\n\n';
    }

    if (metrics.housing_quality) {
      narrative += `Housing quality shows ${metrics.housing_quality.violation_burden}% open violations. `;
      if (metrics.housing_quality.problem_buildings > 0) {
        narrative += `${metrics.housing_quality.problem_buildings} buildings have concentrated issues (potential bad landlords). `;
      }
      narrative += `Overall housing status: ${metrics.housing_quality.status}.\n\n`;
    }

    if (metrics.community_vitality) {
      narrative += `Community shows ${metrics.community_vitality.status} vitality with ${metrics.community_vitality.event_count} events.\n\n`;
    }

    // Add context about what this means
    narrative += 'WHAT THIS MEANS:\n';
    narrative += this.interpretMetrics(metrics);

    return narrative;
  },

  /**
   * Interpret metrics to generate meaning
   */
  interpretMetrics(metrics) {
    let interpretation = '';

    // Assess overall health
    const housingHealthy = metrics.housing_quality?.violation_burden < 30;
    const servicesResponsive = metrics.service_responsiveness?.resolution_rate > 70;
    const communityEngaged = metrics.community_vitality?.status !== 'low';

    if (housingHealthy && servicesResponsive) {
      interpretation += 'This area shows signs of health: housing is well-maintained and city services are responsive. ';
    } else if (!housingHealthy && !servicesResponsive) {
      interpretation += 'This area shows systemic stress: housing quality needs attention AND services are struggling to keep up. ';
    } else if (!housingHealthy && servicesResponsive) {
      interpretation += 'Mixed signals: housing quality is concerning but city services are responding. May indicate recent deterioration or transition. ';
    }

    if (communityEngaged) {
      interpretation += 'High community engagement is an asset that could be leveraged. ';
    }

    // Interpret trends
    if (metrics.service_responsiveness?.trend?.direction === 'increasing' &&
        metrics.housing_quality?.trend === 'worsening') {
      interpretation += '\n\nCONCERNING PATTERN: Both service complaints AND housing issues are increasing, suggesting systemic deterioration. ';
    }

    if (metrics.service_responsiveness?.trend?.direction === 'decreasing' &&
        metrics.housing_quality?.trend === 'improving') {
      interpretation += '\n\nPOSITIVE TRAJECTORY: Both complaints and housing issues are improving - interventions are working. ';
    }

    return interpretation;
  },

  /**
   * Imagine possibilities based on patterns
   */
  imaginePossibilities(metrics, stressSignals, assets) {
    const possibilities = [];

    // If we have problem buildings, enforcement could make a big difference
    const housingEnforcementSignal = stressSignals.find(s => s.type === 'enforcement_opportunity');
    if (housingEnforcementSignal) {
      possibilities.push({
        category: 'targeted_enforcement',
        idea: `Focusing HPD enforcement on ${metrics.housing_quality.problem_buildings} problem buildings could improve conditions for hundreds of residents`,
        impact: 'high',
        feasibility: 'high'
      });
    }

    // If high engagement + community events, could organize
    const engagementAsset = assets.find(a => a.type === 'community_engagement');
    const socialCapitalAsset = assets.find(a => a.type === 'social_capital');

    if (engagementAsset && socialCapitalAsset) {
      possibilities.push({
        category: 'community_organizing',
        idea: 'The organizing capacity that produces community events could be directed toward tenant advocacy and collective action',
        impact: 'high',
        feasibility: 'moderate'
      });
    }

    // If resource mismatch, reallocation opportunity
    const resourceMismatch = stressSignals.find(s => s.domain === 'resource_mismatch');
    if (resourceMismatch) {
      possibilities.push({
        category: 'resource_allocation',
        idea: 'City spending could be redirected to match demonstrated need in this area',
        impact: 'high',
        feasibility: 'moderate'
      });
    }

    // If things are improving, scale what is working
    const improvingTrend = assets.find(a => a.type === 'positive_trajectory');
    if (improvingTrend) {
      possibilities.push({
        category: 'scale_success',
        idea: 'Identify what interventions are working here and apply them elsewhere',
        impact: 'moderate',
        feasibility: 'high'
      });
    }

    return possibilities;
  },

  /**
   * Generate concrete suggestions
   */
  generateSuggestions(metrics, stressSignals, possibilities) {
    const suggestions = {
      for_city_government: [],
      for_community: [],
      for_policy: []
    };

    // City government suggestions
    possibilities.forEach(p => {
      if (p.category === 'targeted_enforcement') {
        suggestions.for_city_government.push({
          action: 'Launch coordinated HPD enforcement campaign',
          target: `${metrics.housing_quality?.problem_buildings} buildings with multiple violations`,
          expected_impact: 'Improve conditions for residents, send signal to bad landlords'
        });
      }

      if (p.category === 'resource_allocation') {
        suggestions.for_city_government.push({
          action: 'Increase housing program funding for this area',
          rationale: 'Data shows high need relative to current spending',
          expected_impact: 'Better match resources to need'
        });
      }
    });

    // Community suggestions
    possibilities.forEach(p => {
      if (p.category === 'community_organizing') {
        suggestions.for_community.push({
          action: 'Form tenant associations in problem buildings',
          leverage: 'Existing organizing capacity from community events',
          expected_impact: 'Collective advocacy for better conditions'
        });
      }
    });

    // Policy suggestions
    stressSignals.forEach(signal => {
      if (signal.type === 'systemic') {
        suggestions.for_policy.push({
          issue: signal.signal,
          recommendation: 'Review resource allocation formulas to ensure equity',
          data_support: 'High needs areas receiving disproportionately low investment'
        });
      }
    });

    return suggestions;
  },

  /**
   * Generate overall assessment
   */
  generateOverallAssessment(metrics, stressSignals) {
    const criticalSignals = stressSignals.filter(s => s.type === 'critical').length;
    const warningSignals = stressSignals.filter(s => s.type === 'warning').length;

    if (criticalSignals > 1) {
      return {
        status: 'CRITICAL',
        summary: 'Multiple critical stress signals - immediate intervention needed',
        priority: 'high'
      };
    } else if (criticalSignals === 1 || warningSignals > 2) {
      return {
        status: 'STRESSED',
        summary: 'Significant concerns that need attention',
        priority: 'medium'
      };
    } else if (warningSignals > 0) {
      return {
        status: 'MODERATE',
        summary: 'Some concerns but generally manageable',
        priority: 'low'
      };
    } else {
      return {
        status: 'HEALTHY',
        summary: 'No major concerns, systems functioning well',
        priority: 'maintenance'
      };
    }
  },

  /**
   * Get comprehensive neighborhood health report
   */
  async getNeighborhoodHealth({ borough, zip, days }) {
    // Call health endpoints on all MCPs
    const healthCalls = [
      fetch(`http://mcp-311:3000/tools/get_neighborhood_health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borough, days })
      }),
      fetch(`http://mcp-hpd:3000/tools/get_housing_health`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ borough, days })
      })
    ];

    const responses = await Promise.all(healthCalls);
    const data = await Promise.all(responses.map(r => r.json()));

    // Synthesize into comprehensive report
    return {
      area: borough || zip,
      period_days: days,
      service_health: data[0],
      housing_health: data[1],
      overall_diagnosis: this.diagnose('neighborhood health', { results: [
        { mcp: 'nyc-311', data: data[0] },
        { mcp: 'nyc-hpd', data: data[1] }
      ]}, {})
    };
  },

  /**
   * Analyze system interconnections
   */
  async analyzeSystem({ focus, borough, days }) {
    // This would call relevant MCPs based on focus area
    // For now, simplified implementation
    return {
      focus,
      analysis: `System analysis for ${focus} would go here`,
      interconnections: [],
      recommendations: []
    };
  }
};
