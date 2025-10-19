import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/tvpp-9vvx.json';

export default async function analyzeEventImpact(params) {
  const {
    borough,
    days = 30
  } = params;

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const whereConditions = [
    `start_date_time>='${now.toISOString()}'`,
    `start_date_time<='${futureDate.toISOString()}'`
  ];

  if (borough) {
    whereConditions.push(`event_borough='${borough.toUpperCase()}'`);
  }

  const query = {
    $where: whereConditions.join(' AND '),
    $limit: 10000
  };

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.EVENT_CALENDAR_PRIMARY_API_KEY
      }
    });

    // Group by type
    const byType = {};
    response.data.forEach(event => {
      const type = event.event_type || 'Unknown';
      if (!byType[type]) {
        byType[type] = 0;
      }
      byType[type]++;
    });

    // Group by borough
    const byBorough = {};
    response.data.forEach(event => {
      const boro = event.event_borough || 'Unknown';
      if (!byBorough[boro]) {
        byBorough[boro] = 0;
      }
      byBorough[boro]++;
    });

    // Timeline
    const byDay = {};
    response.data.forEach(event => {
      const date = new Date(event.start_date_time);
      const dayKey = date.toISOString().split('T')[0];
      if (!byDay[dayKey]) {
        byDay[dayKey] = 0;
      }
      byDay[dayKey]++;
    });

    const timeline = Object.entries(byDay)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    return {
      success: true,
      total_events: response.data.length,
      by_type: Object.entries(byType)
        .map(([type, count]) => ({ event_type: type, count }))
        .sort((a, b) => b.count - a.count),
      by_borough: Object.entries(byBorough)
        .map(([borough, count]) => ({ borough, count }))
        .sort((a, b) => b.count - a.count),
      timeline
    };
  } catch (error) {
    throw new Error(`Failed to analyze event impact: ${error.message}`);
  }
}
