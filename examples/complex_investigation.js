/**
 * Complex Investigation Example
 *
 * This example shows how to use the orchestrator for multi-source investigations
 */

const ORCHESTRATOR_URL = 'http://localhost:4000';

async function complexInvestigation() {
  console.log('='.repeat(70));
  console.log('COMPLEX INVESTIGATION: Construction Impact Analysis');
  console.log('='.repeat(70));
  console.log();

  // Query 1: Construction activity
  console.log('QUERY 1: What neighborhoods have high construction activity?\n');

  const query1 = await fetch(`${ORCHESTRATOR_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Show me construction permits in Manhattan from the last 90 days'
    })
  });

  const result1 = await query1.json();
  console.log('Summary:', result1.synthesis.summary);
  console.log('Data sources:', result1.synthesis.data_sources.join(', '));
  console.log();

  // Query 2: Correlate with complaints
  console.log('QUERY 2: Are there construction-related complaints in these areas?\n');

  const query2 = await fetch(`${ORCHESTRATOR_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Find noise and construction complaints in Manhattan from the last 90 days'
    })
  });

  const result2 = await query2.json();
  console.log('Summary:', result2.synthesis.summary);
  console.log();

  // Query 3: Multi-source correlation
  console.log('QUERY 3: Cross-reference construction with complaints and violations\n');

  const query3 = await fetch(`${ORCHESTRATOR_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Show areas in Manhattan with construction permits, noise complaints, and building violations'
    })
  });

  const result3 = await query3.json();
  console.log('Summary:', result3.synthesis.summary);
  console.log('\nData sources used:', result3.synthesis.data_sources.join(', '));

  if (result3.synthesis.correlations?.length > 0) {
    console.log('\nCorrelations found:');
    result3.synthesis.correlations.forEach(corr => {
      console.log(`  - [${corr.strength}] ${corr.message}`);
    });
  }

  console.log('\n' + '='.repeat(70));
  console.log('Investigation complete!');
  console.log('='.repeat(70));
}

// Run the investigation
complexInvestigation().catch(console.error);
