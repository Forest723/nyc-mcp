import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/qyyg-4tf5.json';

export default async function searchContracts(params) {
  const {
    agency,
    vendor,
    limit = 100
  } = params;

  const whereConditions = [];

  if (agency) {
    whereConditions.push(`agency_name LIKE '%${agency}%'`);
  }

  if (vendor) {
    whereConditions.push(`vendor_name LIKE '%${vendor}%'`);
  }

  const query = {
    $limit: limit,
    $order: 'start_date DESC'
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
      contracts: response.data.map(c => ({
        pin: c.pin,
        agency_name: c.agency_name,
        vendor_name: c.vendor_name,
        vendor_address: c.vendor_address,
        start_date: c.start_date,
        end_date: c.end_date,
        contract_amount: c.contract_amount ? parseFloat(c.contract_amount) : null,
        short_title: c.short_title,
        category_description: c.category_description,
        type_of_notice_description: c.type_of_notice_description,
        selection_method_description: c.selection_method_description,
        contact_name: c.contact_name,
        email: c.email
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search contracts: ${error.message}`);
  }
}
