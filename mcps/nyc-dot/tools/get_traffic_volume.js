import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/btm5-ppia.json';

export default async function getTrafficVolume(params) {
  const {
    boro,
    limit = 100
  } = params;

  const whereConditions = [];

  if (boro) {
    whereConditions.push(`boro='${boro.toUpperCase()}'`);
  }

  const query = {
    $limit: limit
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.DOT_PRIMARY_API_KEY
      }
    });

    return {
      success: true,
      count: response.data.length,
      traffic_data: response.data.map(t => ({
        request_id: t.requestid,
        boro: t.boro,
        street: t.street,
        from_street: t.fromst,
        to_street: t.tost,
        direction: t.direction,
        date: t.date,
        volume: t.vol
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get traffic volume: ${error.message}`);
  }
}
