import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/tvpp-9vvx.json';

export default async function getUpcomingEvents(params) {
  const {
    days = 30,
    borough,
    limit = 100
  } = params;

  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  // Format dates as YYYY-MM-DDTHH:MM:SS for Socrata
  const formatDate = (date) => date.toISOString().split('.')[0];

  const whereConditions = [
    `start_date_time>='${formatDate(now)}'`,
    `start_date_time<='${formatDate(futureDate)}'`
  ];

  if (borough) {
    whereConditions.push(`event_borough='${borough.toUpperCase()}'`);
  }

  const query = {
    $where: whereConditions.join(' AND '),
    $limit: limit,
    $order: 'start_date_time ASC'
  };

  try {
    const headers = {};
    if (process.env.NYC_OPEN_DATA_APP_TOKEN) {
      headers['X-App-Token'] = process.env.NYC_OPEN_DATA_APP_TOKEN;
    }

    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers
    });

    return {
      success: true,
      count: response.data.length,
      events: response.data.map(event => ({
        event_id: event.event_id,
        event_name: event.event_name,
        event_type: event.event_type,
        event_borough: event.event_borough,
        event_location: event.event_location,
        start_date_time: event.start_date_time,
        end_date_time: event.end_date_time,
        community_board: event.community_board
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get upcoming events: ${error.message}`);
  }
}
