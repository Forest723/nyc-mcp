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
      violations: response.data.map(v => ({
        summons_number: v.summons_number,
        plate: v.plate,
        state: v.state,
        license_type: v.license_type,
        issue_date: v.issue_date,
        violation: v.violation,
        violation_time: v.violation_time,
        fine_amount: v.fine_amount,
        penalty_amount: v.penalty_amount,
        amount_due: v.amount_due,
        precinct: v.precinct,
        county: v.county,
        issuing_agency: v.issuing_agency
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get parking violations: ${error.message}`);
  }
}
