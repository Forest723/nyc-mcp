import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

/**
 * Get neighborhood health indicators from 311 data
 * This tool provides contextual analysis, not just raw counts
 */
export default async function getNeighborhoodHealth(params) {
  const {
    borough,
    days = 90
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereConditions = [
    `created_date>='${startDate.toISOString()}'`
  ];

  if (borough) {
    whereConditions.push(`borough='${borough.toUpperCase()}'`);
  }

  const query = {
    $where: whereConditions.join(' AND '),
    $limit: 50000,
    $select: 'complaint_type,created_date,status,resolution_action_updated_date,borough,zip_code'
  };

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.NYC_311_PRIMARY_API_KEY
      }
    });

    // Calculate health indicators
    const totalComplaints = response.data.length;

    // Response quality: how many complaints are actually resolved?
    const resolved = response.data.filter(c => c.status === 'Closed').length;
    const resolutionRate = (resolved / totalComplaints * 100).toFixed(1);

    // Response speed: average time to resolution
    const resolvedWithTime = response.data.filter(c =>
      c.status === 'Closed' && c.resolution_action_updated_date && c.created_date
    );

    let avgResolutionDays = 0;
    if (resolvedWithTime.length > 0) {
      const totalDays = resolvedWithTime.reduce((sum, c) => {
        const created = new Date(c.created_date);
        const resolved = new Date(c.resolution_action_updated_date);
        return sum + ((resolved - created) / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = (totalDays / resolvedWithTime.length).toFixed(1);
    }

    // Complaint diversity: are problems concentrated or varied?
    const typeDistribution = {};
    response.data.forEach(c => {
      const type = c.complaint_type || 'Unknown';
      typeDistribution[type] = (typeDistribution[type] || 0) + 1;
    });

    const topComplaintTypes = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([type, count]) => ({
        type,
        count,
        percentage: (count / totalComplaints * 100).toFixed(1)
      }));

    // Engagement level: complaints per capita indicator
    const complaintsPerDay = (totalComplaints / days).toFixed(1);

    // Temporal pattern: increasing or decreasing?
    const firstHalf = response.data.filter(c => {
      const created = new Date(c.created_date);
      const midpoint = new Date(startDate);
      midpoint.setDate(midpoint.getDate() + (days / 2));
      return created < midpoint;
    }).length;

    const secondHalf = totalComplaints - firstHalf;
    const trend = secondHalf > firstHalf ? 'increasing' : 'decreasing';
    const trendMagnitude = (Math.abs(secondHalf - firstHalf) / firstHalf * 100).toFixed(1);

    // Geographic spread
    const zipDistribution = {};
    response.data.forEach(c => {
      if (c.zip_code) {
        zipDistribution[c.zip_code] = (zipDistribution[c.zip_code] || 0) + 1;
      }
    });

    const uniqueZips = Object.keys(zipDistribution).length;

    return {
      success: true,
      period_days: days,
      borough: borough || 'CITYWIDE',

      // Core metrics
      total_complaints: totalComplaints,
      complaints_per_day: parseFloat(complaintsPerDay),

      // Service quality indicators
      resolution_rate: parseFloat(resolutionRate),
      avg_resolution_days: parseFloat(avgResolutionDays),

      // Pattern indicators
      trend: {
        direction: trend,
        magnitude_percent: parseFloat(trendMagnitude),
        interpretation: trendMagnitude > 20 ? 'significant change' : 'stable'
      },

      // Complaint composition
      top_complaint_types: topComplaintTypes,
      complaint_diversity: {
        unique_types: Object.keys(typeDistribution).length,
        top_type_dominance: parseFloat(topComplaintTypes[0]?.percentage || 0),
        interpretation: topComplaintTypes[0]?.percentage > 50 ? 'concentrated issue' : 'varied issues'
      },

      // Geographic indicators
      geographic_spread: {
        unique_zip_codes: uniqueZips,
        interpretation: uniqueZips > 5 ? 'widespread' : 'localized'
      },

      // Health assessment
      health_signals: {
        service_responsiveness: resolutionRate > 70 ? 'healthy' : resolutionRate > 50 ? 'moderate' : 'stressed',
        complaint_trend: trend === 'decreasing' ? 'improving' : 'worsening',
        issue_concentration: topComplaintTypes[0]?.percentage > 50 ? 'focused problem' : 'systemic issues',
        civic_engagement: complaintsPerDay > 100 ? 'high' : complaintsPerDay > 50 ? 'moderate' : 'low'
      }
    };
  } catch (error) {
    throw new Error(`Failed to get neighborhood health: ${error.message}`);
  }
}
