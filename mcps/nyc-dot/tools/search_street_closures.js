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
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.DOT_PRIMARY_API_KEY
      }
    });

    return {
      success: true,
      count: response.data.length,
      closures: response.data.map(closure => ({
        work_type: closure.work_type,
        boro: closure.boro,
        on_street: closure.onstreetname,
        from_street: closure.fromstreetname,
        to_street: closure.tostreetname,
        work_start_date: closure.workstartdate,
        work_end_date: closure.workenddate
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search street closures: ${error.message}`);
  }
}
