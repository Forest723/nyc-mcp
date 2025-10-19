import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/uwyv-629c.json';

export default async function searchComplaints(params) {
  const {
    borough,
    status,
    days = 30,
    limit = 100
  } = params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const whereConditions = [
    `receiveddate>='${startDate.toISOString().split('T')[0]}'`
  ];

  if (borough) {
    whereConditions.push(`boroughid='${borough.toUpperCase()}'`);
  }

  if (status) {
    whereConditions.push(`status='${status}'`);
  }

  const query = {
    $where: whereConditions.join(' AND '),
    $limit: limit,
    $order: 'receiveddate DESC'
  };

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
      complaints: response.data.map(c => ({
        complaint_id: c.complaintid,
        building_id: c.buildingid,
        borough: c.boroughid,
        house_number: c.housenumber,
        street_name: c.streetname,
        apartment: c.apartment,
        zip: c.zip,
        received_date: c.receiveddate,
        status: c.status,
        status_date: c.statusdate
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search complaints: ${error.message}`);
  }
}
