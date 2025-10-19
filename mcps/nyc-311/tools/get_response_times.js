import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

export default async function getResponseTimes(params) {
  const {
    complaint_type,
    borough,
    days = 30
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereConditions = [
    `created_date>='${startDate.toISOString()}'`,
    `closed_date IS NOT NULL`
  ];

  if (complaint_type) {
    whereConditions.push(`complaint_type='${complaint_type}'`);
  }

  if (borough) {
    whereConditions.push(`borough='${borough.toUpperCase()}'`);
  }

  const query = {
    $select: 'complaint_type,created_date,closed_date,borough',
    $where: whereConditions.join(' AND '),
    $limit: 10000
  };

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.NYC_APP_TOKEN
      }
    });

    // Calculate response times
    const responseTimes = response.data.map(complaint => {
      const created = new Date(complaint.created_date);
      const closed = new Date(complaint.closed_date);
      const hoursToResolve = (closed - created) / (1000 * 60 * 60);

      return {
        complaint_type: complaint.complaint_type,
        borough: complaint.borough,
        hours_to_resolve: hoursToResolve
      };
    });

    // Calculate statistics
    const times = responseTimes.map(rt => rt.hours_to_resolve);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    // Group by complaint type
    const byType = {};
    responseTimes.forEach(rt => {
      if (!byType[rt.complaint_type]) {
        byType[rt.complaint_type] = [];
      }
      byType[rt.complaint_type].push(rt.hours_to_resolve);
    });

    const typeStats = Object.entries(byType).map(([type, times]) => ({
      complaint_type: type,
      count: times.length,
      avg_hours: times.reduce((a, b) => a + b, 0) / times.length,
      min_hours: Math.min(...times),
      max_hours: Math.max(...times)
    })).sort((a, b) => b.count - a.count);

    return {
      success: true,
      summary: {
        total_complaints: responseTimes.length,
        average_hours: avg,
        median_hours: median,
        min_hours: Math.min(...times),
        max_hours: Math.max(...times)
      },
      by_complaint_type: typeStats.slice(0, 10)
    };
  } catch (error) {
    throw new Error(`Failed to get response times: ${error.message}`);
  }
}
