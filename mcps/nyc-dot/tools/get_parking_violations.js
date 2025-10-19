import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/nc67-uf89.json';

export default async function getParkingViolations(params) {
  const {
    county,
    violation_code,
    limit = 100
  } = params;

  const whereConditions = [];

  if (county) {
    whereConditions.push(`county='${county.toUpperCase()}'`);
  }

  if (violation_code) {
    whereConditions.push(`violation_code='${violation_code}'`);
  }

  const query = {
    $limit: limit,
    $order: 'issue_date DESC'
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
      violations: response.data.map(v => ({
        summons_number: v.summons_number,
        plate: v.plate_id,
        state: v.registration_state,
        plate_type: v.plate_type,
        issue_date: v.issue_date,
        violation_code: v.violation_code,
        vehicle_body_type: v.vehicle_body_type,
        vehicle_make: v.vehicle_make,
        violation_county: v.violation_county,
        violation_precinct: v.violation_precinct,
        violation_time: v.violation_time,
        house_number: v.house_number,
        street_name: v.street_name
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get parking violations: ${error.message}`);
  }
}
