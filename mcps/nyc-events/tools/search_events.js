import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/tvpp-9vvx.json';

export default async function searchEvents(params) {
  const {
    event_type,
    borough,
    start_date,
    end_date,
    limit = 100
  } = params;

  const whereConditions = [];

  if (event_type) {
    whereConditions.push(`event_type='${event_type}'`);
  }

  if (borough) {
    whereConditions.push(`event_borough='${borough.toUpperCase()}'`);
  }

  if (start_date) {
    whereConditions.push(`start_date_time>='${start_date}T00:00:00.000'`);
  }

  if (end_date) {
    whereConditions.push(`end_date_time<='${end_date}T23:59:59.999'`);
  }

  const query = {
    $limit: limit,
    $order: 'start_date_time DESC'
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

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
        community_board: event.community_board,
        police_precinct: event.police_precinct
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search events: ${error.message}`);
  }
}
