/**
 * Simple Query Example
 *
 * This example shows how to make a basic query to the orchestrator
 */

const ORCHESTRATOR_URL = 'http://localhost:4000';

async function simpleQuery() {
  try {
    console.log('Simple Query: Finding noise complaints in Brooklyn\n');

    const response = await fetch(`${ORCHESTRATOR_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'Show me noise complaints in Brooklyn from the last month'
      })
    });

    const result = await response.json();

    console.log('Query:', result.query);
    console.log('\nRouting Decision:');
    console.log('  Selected MCPs:', result.routing.selectedMCPs.join(', '));
    console.log('  Reasoning:', result.routing.reasoning.join('\n              '));

    console.log('\nSynthesis:');
    console.log('  Summary:', result.synthesis.summary);

    if (result.synthesis.insights?.length > 0) {
      console.log('\n  Insights:');
      result.synthesis.insights.forEach(insight => {
        console.log(`    - ${insight.message}`);
      });
    }

    console.log('\nRaw Results:');
    result.results.forEach(r => {
      console.log(`  ${r.mcp}/${r.tool}: ${JSON.stringify(r.data).substring(0, 100)}...`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example
simpleQuery();
