import axios from 'axios';

const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/k397-673e.json';

export default async function getPayroll(params) {
  const {
    agency,
    fiscal_year,
    title,
    limit = 100
  } = params;

  const whereConditions = [];

  if (agency) {
    whereConditions.push(`agency_name LIKE '%${agency}%'`);
  }

  if (fiscal_year) {
    whereConditions.push(`fiscal_year='${fiscal_year}'`);
  }

  if (title) {
    whereConditions.push(`title_description LIKE '%${title}%'`);
  }

  const query = {
    $limit: limit,
    $order: 'base_salary DESC'
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

    const avgSalary = response.data.reduce((sum, item) =>
      sum + parseFloat(item.base_salary || 0), 0) / (response.data.length || 1);

    return {
      success: true,
      count: response.data.length,
      average_salary: avgSalary,
      payroll: response.data.map(p => ({
        fiscal_year: p.fiscal_year,
        agency_name: p.agency_name,
        last_name: p.last_name,
        first_name: p.first_name,
        mid_init: p.mid_init,
        title_description: p.title_description,
        base_salary: parseFloat(p.base_salary || 0),
        pay_basis: p.pay_basis,
        regular_hours: p.regular_hours,
        regular_gross_paid: parseFloat(p.regular_gross_paid || 0),
        total_gross_pay: parseFloat(p.total_gross_pay || 0)
      }))
    };
  } catch (error) {
    throw new Error(`Failed to get payroll: ${error.message}`);
  }
}
