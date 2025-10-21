import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/wvxf-dwi5.json';

export default async function searchViolations(params) {
  const {
    borough,
    bin,
    status,
    limit = 100
  } = params;

  const whereConditions = [];

  if (borough) {
    whereConditions.push(`boroid='${borough.toUpperCase()}'`);
  }

  if (bin) {
    whereConditions.push(`bin='${bin}'`);
  }

  if (status) {
    whereConditions.push(`violationstatus='${status}'`);
  }

  const query = {
    $limit: limit,
    $order: 'inspectiondate DESC'
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
        violation_id: v.violationid,
        building_id: v.buildingid,
        bin: v.bin,
        borough: v.boroid,
        house_number: v.housenumber,
        street_name: v.streetname,
        apartment: v.apartment,
        inspection_date: v.inspectiondate,
        violation_status: v.violationstatus,
        nov_description: v.novdescription,
        nov_issued_date: v.novissueddate,
        current_status_date: v.currentstatusdate
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search violations: ${error.message}`);
  }
}
