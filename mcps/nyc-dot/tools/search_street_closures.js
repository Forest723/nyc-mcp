import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/i6b5-j7bu.json';

export default async function searchStreetClosures(params) {
  const {
    borough,
    work_type,
    limit = 100
  } = params;

  const whereConditions = [];

  if (borough) {
    whereConditions.push(`boro='${borough.toUpperCase()}'`);
  }

  if (work_type) {
    whereConditions.push(`work_type='${work_type}'`);
  }

  const query = {
    $limit: limit
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

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
      closures: response.data.map(closure => ({
        purpose: closure.purpose,
        borough_code: closure.borough_code,
        on_street: closure.onstreetname,
        from_street: closure.fromstreetname,
        to_street: closure.tostreetname,
        work_start_date: closure.work_start_date,
        work_end_date: closure.work_end_date,
        segment_id: closure.segmentid
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search street closures: ${error.message}`);
  }
}
