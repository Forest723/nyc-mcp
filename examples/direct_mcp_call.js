/**
 * Direct MCP Call Example
 *
 * This example shows how to call a specific MCP tool directly,
 * bypassing the orchestrator's routing logic
 */

const ORCHESTRATOR_URL = 'http://localhost:4000';

async function directMCPCall() {
  console.log('Direct MCP Call: Get response times for noise complaints\n');

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/call/nyc-311/get_response_times`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complaint_type: 'Noise',
        borough: 'BROOKLYN',
        days: 30
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Response Time Analysis:');
      console.log('  Total complaints analyzed:', result.summary.total_complaints);
      console.log('  Average response time:', result.summary.average_hours.toFixed(1), 'hours');
      console.log('  Median response time:', result.summary.median_hours.toFixed(1), 'hours');
      console.log('  Fastest response:', result.summary.min_hours.toFixed(1), 'hours');
      console.log('  Slowest response:', result.summary.max_hours.toFixed(1), 'hours');

      console.log('\nTop 5 complaint types by volume:');
      result.by_complaint_type.slice(0, 5).forEach((type, i) => {
        console.log(`  ${i + 1}. ${type.complaint_type}`);
        console.log(`     Count: ${type.count}, Avg: ${type.avg_hours.toFixed(1)} hours`);
      });
    } else {
      console.log('Error:', result.error);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example: Get property sales data directly
async function getPropertySales() {
  console.log('\n' + '='.repeat(70));
  console.log('Direct MCP Call: Get recent property sales in Brooklyn\n');

  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/call/nyc-property/get_sales_history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        borough: 'BROOKLYN',
        days: 90,
        min_price: 500000,
        limit: 20
      })
    });

    const result = await response.json();

    if (result.success) {
      console.log('Sales Statistics:');
      console.log('  Total sales:', result.count);
      console.log('  Average price: $', result.statistics.average_price.toLocaleString());
      console.log('  Median price: $', result.statistics.median_price.toLocaleString());
      console.log('  Price range: $', result.statistics.min_price.toLocaleString(),
                  '- $', result.statistics.max_price.toLocaleString());

      console.log('\nRecent sales:');
      result.sales.slice(0, 5).forEach((sale, i) => {
        console.log(`  ${i + 1}. ${sale.address}, ${sale.neighborhood}`);
        console.log(`     Price: $${sale.sale_price.toLocaleString()}, Date: ${sale.sale_date}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run examples
directMCPCall()
  .then(() => getPropertySales())
  .catch(console.error);
