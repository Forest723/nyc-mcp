import axios from 'axios';

const VIOLATIONS_ENDPOINT = 'https://data.cityofnewyork.us/resource/wvxf-dwi5.json';
const COMPLAINTS_ENDPOINT = 'https://data.cityofnewyork.us/resource/uwyv-629c.json';

/**
 * Get comprehensive housing health indicators
 * Combines violations and complaints to assess housing quality
 */
export default async function getHousingHealth(params) {
  const {
    borough,
    days = 90
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    // Fetch violations
    const violationsQuery = {
      $where: borough ? `boroid='${borough.toUpperCase()}'` : '1=1',
      $limit: 50000,
      $select: 'violationstatus,novdescription,inspectiondate,currentstatusdate,buildingid'
    };

    const violationsResponse = await axios.get(VIOLATIONS_ENDPOINT, {
      params: violationsQuery,
      headers: {
        'X-App-Token': process.env.HPD_DATAFEED_PRIMARY_API_KEY
      }
    });

    // Fetch recent complaints
    const complaintsQuery = {
      $where: `receiveddate>='${startDate.toISOString().split('T')[0]}'` +
              (borough ? ` AND boroughid='${borough.toUpperCase()}'` : ''),
      $limit: 50000,
      $select: 'status,receiveddate,statusdate,buildingid'
    };

    const complaintsResponse = await axios.get(COMPLAINTS_ENDPOINT, {
      params: complaintsQuery,
      headers: {
        'X-App-Token': process.env.HPD_DATAFEED_PRIMARY_API_KEY
      }
    });

    const violations = violationsResponse.data;
    const complaints = complaintsResponse.data;

    // Calculate violation metrics
    const openViolations = violations.filter(v => v.violationstatus === 'Open').length;
    const totalViolations = violations.length;
    const violationOpenRate = totalViolations > 0 ? (openViolations / totalViolations * 100).toFixed(1) : 0;

    // Calculate complaint metrics
    const totalComplaints = complaints.length;
    const openComplaints = complaints.filter(c => c.status !== 'Close').length;
    const complaintResolutionRate = totalComplaints > 0 ?
      ((totalComplaints - openComplaints) / totalComplaints * 100).toFixed(1) : 0;

    // Identify problem buildings (multiple violations/complaints)
    const buildingIssues = {};

    violations.forEach(v => {
      if (v.buildingid && v.violationstatus === 'Open') {
        buildingIssues[v.buildingid] = buildingIssues[v.buildingid] || { violations: 0, complaints: 0 };
        buildingIssues[v.buildingid].violations++;
      }
    });

    complaints.forEach(c => {
      if (c.buildingid && c.status !== 'Close') {
        buildingIssues[c.buildingid] = buildingIssues[c.buildingid] || { violations: 0, complaints: 0 };
        buildingIssues[c.buildingid].complaints++;
      }
    });

    // Find buildings with multiple issues (potential slumlords)
    const problemBuildings = Object.entries(buildingIssues)
      .filter(([_, issues]) => issues.violations + issues.complaints >= 3)
      .sort((a, b) => (b[1].violations + b[1].complaints) - (a[1].violations + a[1].complaints))
      .slice(0, 20)
      .map(([buildingId, issues]) => ({
        building_id: buildingId,
        open_violations: issues.violations,
        open_complaints: issues.complaints,
        total_issues: issues.violations + issues.complaints
      }));

    // Temporal analysis for complaints (are things getting better or worse?)
    const midpoint = new Date(startDate);
    midpoint.setDate(midpoint.getDate() + (days / 2));

    const firstHalfComplaints = complaints.filter(c =>
      new Date(c.receiveddate) < midpoint
    ).length;
    const secondHalfComplaints = complaints.filter(c =>
      new Date(c.receiveddate) >= midpoint
    ).length;

    const trend = secondHalfComplaints > firstHalfComplaints ? 'worsening' : 'improving';
    const trendMagnitude = firstHalfComplaints > 0 ?
      (Math.abs(secondHalfComplaints - firstHalfComplaints) / firstHalfComplaints * 100).toFixed(1) : 0;

    // Calculate complaint responsiveness
    const resolvedComplaints = complaints.filter(c =>
      c.status === 'Close' && c.receiveddate && c.statusdate
    );

    let avgResolutionDays = 0;
    if (resolvedComplaints.length > 0) {
      const totalDays = resolvedComplaints.reduce((sum, c) => {
        const received = new Date(c.receiveddate);
        const resolved = new Date(c.statusdate);
        return sum + ((resolved - received) / (1000 * 60 * 60 * 24));
      }, 0);
      avgResolutionDays = (totalDays / resolvedComplaints.length).toFixed(1);
    }

    return {
      success: true,
      period_days: days,
      borough: borough || 'CITYWIDE',

      // Violation health
      violations: {
        total: totalViolations,
        open: openViolations,
        open_rate: parseFloat(violationOpenRate),
        interpretation: violationOpenRate > 50 ? 'critical' : violationOpenRate > 30 ? 'stressed' : 'manageable'
      },

      // Complaint health
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        resolution_rate: parseFloat(complaintResolutionRate),
        avg_resolution_days: parseFloat(avgResolutionDays),
        interpretation: complaintResolutionRate > 70 ? 'responsive' : complaintResolutionRate > 50 ? 'moderate' : 'unresponsive'
      },

      // Trend analysis
      trend: {
        direction: trend,
        magnitude_percent: parseFloat(trendMagnitude),
        interpretation: trend === 'worsening' && trendMagnitude > 20 ?
          'significant deterioration' :
          trend === 'improving' && trendMagnitude > 20 ?
          'significant improvement' :
          'stable'
      },

      // Problem buildings (potential enforcement targets)
      problem_buildings: {
        count: problemBuildings.length,
        top_20: problemBuildings,
        interpretation: problemBuildings.length > 10 ?
          'concentrated neglect - enforcement opportunity' :
          'scattered issues'
      },

      // Overall housing health score
      health_assessment: {
        violation_burden: violationOpenRate > 50 ? 'severe' : violationOpenRate > 30 ? 'moderate' : 'low',
        responsiveness: complaintResolutionRate > 70 ? 'good' : complaintResolutionRate > 50 ? 'fair' : 'poor',
        trajectory: trend,
        landlord_compliance: problemBuildings.length < 5 ? 'good' : problemBuildings.length < 15 ? 'concerning' : 'poor',

        overall: (() => {
          if (violationOpenRate < 30 && complaintResolutionRate > 70 && trend === 'improving') {
            return 'HEALTHY - Housing stock is well-maintained and complaints are addressed';
          } else if (violationOpenRate > 50 || complaintResolutionRate < 50 || (trend === 'worsening' && trendMagnitude > 20)) {
            return 'STRESSED - Housing quality needs attention';
          } else {
            return 'MODERATE - Some concerns but manageable';
          }
        })()
      }
    };
  } catch (error) {
    throw new Error(`Failed to get housing health: ${error.message}`);
  }
}
