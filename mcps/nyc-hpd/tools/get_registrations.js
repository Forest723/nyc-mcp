import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/tesw-yqqr.json';

export default async function getRegistrations(params) {
  const {
    borough,
    zip,
    limit = 100
  } = params;

  const whereConditions = [];

  if (borough) {
    whereConditions.push(`boroid='${borough.toUpperCase()}'`);
  }

  if (zip) {
    whereConditions.push(`zip='${zip}'`);
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
        'X-App-Token': process.env.HPD_DATAFEED_PRIMARY_API_KEY
      }
    });

    return {
      success: true,
      count: response.data.length,
      registrations: response.data.map(r => ({
        registration_id: r.registrationid,
        building_id: r.buildingid,
        borough: r.boroid,
        house_number: r.housenumber,
        street_name: r.streetname,
        zip: r.zip,
        block: r.block,
        lot: r.lot,
        bin: r.bin,
        last_registration_date: r.lastregistrationdate,
        registration_end_date: r.registrationenddate
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get registrations: ${error.message}`);
  }
}
