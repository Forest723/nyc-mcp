import axios from 'axios';

// Using Expense Budget dataset as Checkbook NYC 2.0 (mxwn-eh3b) is federated/non-tabular
// For actual transaction-level spending, the Comptroller's XML API may be needed
const SOCRATA_ENDPOINT = 'https://data.cityofnewyork.us/resource/mwzb-yiwb.json';

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
    whereConditions.push(`current_modified_budget_amount >= ${min_amount}`);
  }

  if (max_amount) {
    whereConditions.push(`current_modified_budget_amount <= ${max_amount}`);
  }

  if (fiscal_year) {
    whereConditions.push(`fiscal_year='${fiscal_year}'`);
  }

  const query = {
    $limit: limit,
    $order: 'current_modified_budget_amount DESC'
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

    const totalBudget = response.data.reduce((sum, item) =>
      sum + parseFloat(item.current_modified_budget_amount || 0), 0);

    return {
      success: true,
      count: response.data.length,
      total_budget: totalBudget,
      note: 'This data shows budgeted amounts. For actual spending transactions, the Comptroller XML API may be needed.',
      budget_items: response.data.map(s => ({
        fiscal_year: s.fiscal_year,
        agency_name: s.agency_name,
        unit_appropriation_name: s.unit_appropriation_name,
        budget_code_name: s.budget_code_name,
        object_code_name: s.object_code_name,
        object_class_name: s.object_class_name,
        adopted_budget_amount: parseFloat(s.adopted_budget_amount || 0),
        current_modified_budget_amount: parseFloat(s.current_modified_budget_amount || 0),
        financial_plan_amount: parseFloat(s.financial_plan_amount || 0)
      }))
    };
  } catch (error) {
    throw new Error(`Failed to search spending: ${error.message}`);
  }
}
