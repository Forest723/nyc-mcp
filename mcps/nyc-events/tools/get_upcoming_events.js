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

  const whereConditions = [
    `start_date_time>='${now.toISOString()}'`,
    `start_date_time<='${futureDate.toISOString()}'`
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
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.EVENT_CALENDAR_PRIMARY_API_KEY
      }
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
