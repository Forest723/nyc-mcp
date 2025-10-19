import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/mxwn-eh3b.json';

export default async function searchSpending(params) {
  const {
    agency,
    min_amount,
    max_amount,
    fiscal_year,
    limit = 100
  } = params;

  const whereConditions = [];

  if (agency) {
    whereConditions.push(`agency_name LIKE '%${agency}%'`);
  }

  if (min_amount) {
    whereConditions.push(`check_amount >= ${min_amount}`);
  }

  if (max_amount) {
    whereConditions.push(`check_amount <= ${max_amount}`);
  }

  if (fiscal_year) {
    whereConditions.push(`fiscal_year='${fiscal_year}'`);
  }

  const query = {
    $limit: limit,
    $order: 'check_amount DESC'
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

    const totalSpending = response.data.reduce((sum, item) =>
      sum + parseFloat(item.check_amount || 0), 0);

    return {
      success: true,
      count: response.data.length,
      total_spending: totalSpending,
      spending: response.data.map(s => ({
        agency_name: s.agency_name,
        vendor_name: s.vendor_name,
        check_amount: parseFloat(s.check_amount),
        check_eft_issued_date: s.check_eft_issued_date,
        expenditure_object_name: s.expenditure_object_name,
        fiscal_year: s.fiscal_year
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search spending: ${error.message}`);
  }
}
