import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/erm2-nwe9.json';

export default async function searchComplaints(params) {
  const {
    complaint_type,
    borough,
    start_date,
    end_date,
    limit = 100
  } = params;

  // Build SoQL query
  const whereConditions = [];

  if (complaint_type) {
    whereConditions.push(`complaint_type='${complaint_type}'`);
  }

  if (borough) {
    whereConditions.push(`borough='${borough.toUpperCase()}'`);
  }

  if (start_date) {
    whereConditions.push(`created_date>='${start_date}T00:00:00.000'`);
  }

  if (end_date) {
    whereConditions.push(`created_date<='${end_date}T23:59:59.999'`);
  }

  const query = {
    $limit: limit,
    $order: 'created_date DESC'
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.NYC_311_PRIMARY_API_KEY
      }
    });

    return {
      success: true,
      count: response.data.length,
      complaints: response.data.map(complaint => ({
        unique_key: complaint.unique_key,
        created_date: complaint.created_date,
        complaint_type: complaint.complaint_type,
        descriptor: complaint.descriptor,
        borough: complaint.borough,
        location: {
          address: complaint.incident_address,
          latitude: complaint.latitude,
          longitude: complaint.longitude
        },
        status: complaint.status,
        agency: complaint.agency,
        resolution_description: complaint.resolution_description
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search complaints: ${error.message}`);
  }
}
