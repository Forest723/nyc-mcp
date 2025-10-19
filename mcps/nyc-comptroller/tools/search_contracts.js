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
    whereConditions.push(`agency LIKE '%${agency}%'`);
  }

  if (vendor) {
    whereConditions.push(`vendor_name LIKE '%${vendor}%'`);
  }

  const query = {
    $limit: limit,
    $order: 'award_date DESC'
  };

  if (whereConditions.length > 0) {
    query.$where = whereConditions.join(' AND ');
  }

  try {
    const response = await axios.get(SOCRATA_ENDPOINT, {
      params: query,
      headers: {
        'X-App-Token': process.env.COMPTROLLER_CHECKBOOK_PRIMARY_API_KEY
      }
    });

    return {
      success: true,
      count: response.data.length,
      contracts: response.data.map(c => ({
        contract_number: c.contract_number,
        agency: c.agency,
        vendor_name: c.vendor_name,
        award_date: c.award_date,
        start_date: c.start_date,
        end_date: c.end_date,
        contract_amount: c.contract_amount ? parseFloat(c.contract_amount) : null,
        contract_description: c.contract_description
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search contracts: ${error.message}`);
  }
}
