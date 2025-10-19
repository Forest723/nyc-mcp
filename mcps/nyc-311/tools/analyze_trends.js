import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

export default async function analyzeTrends(params) {
  const {
    complaint_type,
    borough,
    group_by = 'day',
    days = 90
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereConditions = [
    `created_date>='${startDate.toISOString()}'`
  ];

  if (complaint_type) {
    whereConditions.push(`complaint_type='${complaint_type}'`);
  }

  if (borough) {
    whereConditions.push(`borough='${borough.toUpperCase()}'`);
  }

  const query = {
    $select: 'created_date,complaint_type,borough',
    $where: whereConditions.join(' AND '),
    $limit: 50000
  };

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.NYC_APP_TOKEN
      }
    });

    // Group data by time period
    const grouped = {};
    response.data.forEach(complaint => {
      const date = new Date(complaint.created_date);
      let key;

      switch (group_by) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = date.toISOString().split('T')[0];
      }

      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          count: 0,
          types: {}
        };
      }

      grouped[key].count++;

      if (!grouped[key].types[complaint.complaint_type]) {
        grouped[key].types[complaint.complaint_type] = 0;
      }
      grouped[key].types[complaint.complaint_type]++;
    });

    // Convert to array and sort by date
    const timeline = Object.values(grouped)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(period => ({
        date: period.date,
        count: period.count,
        top_types: Object.entries(period.types)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([type, count]) => ({ type, count }))
      }));

    // Calculate trend direction
    const recentAvg = timeline.slice(-7).reduce((sum, p) => sum + p.count, 0) / 7;
    const previousAvg = timeline.slice(-14, -7).reduce((sum, p) => sum + p.count, 0) / 7;
    const trendDirection = recentAvg > previousAvg ? 'increasing' : 'decreasing';
    const trendPercentage = ((recentAvg - previousAvg) / previousAvg * 100).toFixed(2);

    return {
      success: true,
      total_complaints: response.data.length,
      trend: {
        direction: trendDirection,
        percentage_change: trendPercentage,
        recent_avg_per_period: recentAvg.toFixed(2),
        previous_avg_per_period: previousAvg.toFixed(2)
      },
      timeline
    };
  } catch (error) {
    throw new Error(`Failed to analyze trends: ${error.message}`);
  }
}
