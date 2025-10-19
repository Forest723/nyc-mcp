/**
 * Investigative Queries - Advanced Cross-Dataset Analysis
 *
 * This demonstrates the power of the orchestrator to answer questions
 * that span multiple city datasets, revealing insights that don't exist
 * in any single data source.
 */

const ORCHESTRATOR_URL = 'http://localhost:4000';

// Helper function
async function query(q) {
  const response = await fetch(`${ORCHESTRATOR_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q })
  });
  return await response.json();
}

console.log('═'.repeat(80));
console.log('INVESTIGATIVE QUERIES: Multi-Dataset Intelligence Layer');
console.log('═'.repeat(80));
console.log();

// Query 1: Events + DOT + 311
console.log('INVESTIGATION 1: Event Impact Analysis');
console.log('-'.repeat(80));
console.log('Question: Do major events correlate with traffic complaints and street closures?');
console.log();

const q1 = await query(
  'Show upcoming events, street closures, and noise complaints in Manhattan'
);

console.log(`Data sources used: ${q1.synthesis.data_sources.join(', ')}`);
console.log(`Summary: ${q1.synthesis.summary}`);
if (q1.synthesis.correlations) {
  console.log('\nCorrelations found:');
  q1.synthesis.correlations.forEach(c => {
    console.log(`  - ${c.message}`);
  });
}
console.log();

// Query 2: HPD + 311 + Comptroller
console.log('\nINVESTIGATION 2: Housing Quality vs City Investment');
console.log('-'.repeat(80));
console.log('Question: Are areas with high housing violations getting city funding?');
console.log();

const q2 = await query(
  'Find housing violations and city spending on housing in Brooklyn'
);

console.log(`Data sources used: ${q2.synthesis.data_sources.join(', ')}`);
console.log(`Summary: ${q2.synthesis.summary}`);
console.log();

// Query 3: DOT + Comptroller
console.log('\nINVESTIGATION 3: Infrastructure Spending vs Street Quality');
console.log('-'.repeat(80));
console.log('Question: Where is DOT spending money and are there still street complaints?');
console.log();

const q3 = await query(
  'Show DOT spending and street closures for construction'
);

console.log(`Data sources used: ${q3.synthesis.data_sources.join(', ')}`);
console.log(`Summary: ${q3.synthesis.summary}`);
console.log();

// Query 4: All 5 datasets
console.log('\nINVESTIGATION 4: Comprehensive Neighborhood Analysis');
console.log('-'.repeat(80));
console.log('Question: What\'s happening in a neighborhood across all city systems?');
console.log();

const q4 = await query(
  'Give me a complete picture of Manhattan: events, housing complaints, street closures, parking violations, and city spending'
);

console.log(`Data sources used: ${q4.synthesis.data_sources.join(', ')}`);
console.log(`Summary: ${q4.synthesis.summary}`);

if (q4.synthesis.insights) {
  console.log('\nKey insights:');
  q4.synthesis.insights.forEach(i => {
    console.log(`  - ${i.message}`);
  });
}

console.log();
console.log('═'.repeat(80));
console.log('WHAT MAKES THIS POWERFUL:');
console.log('═'.repeat(80));
console.log(`
1. CROSS-DOMAIN INTELLIGENCE
   - Each dataset alone is just data
   - Combined, they tell stories about the city

2. INVESTIGATIVE JOURNALISM AS A SERVICE
   - "Are landlords neglecting buildings in neighborhoods with less city investment?"
   - "Do major events cause parking complaint spikes?"
   - "Is construction spending correlated with reduced street complaints?"

3. POLICY ANALYSIS
   - Where should the city allocate resources?
   - Are current investments effective?
   - Which neighborhoods need attention?

4. REAL-TIME URBAN INTELLIGENCE
   - Not historical reports - live queries
   - Ask questions that don't have pre-built dashboards
   - Discover correlations nobody thought to look for

THIS IS AN INTELLIGENCE LAYER OVER NYC ITSELF.
`);

console.log('═'.repeat(80));
