/**
 * Diagnostic Agent Demo
 *
 * This demonstrates the difference between:
 * 1. Raw data queries (orchestrator)
 * 2. Diagnostic intelligence (diagnostic agent)
 */

const ORCHESTRATOR_URL = 'http://localhost:4000';
const DIAGNOSTIC_URL = 'http://localhost:5000';

console.log('═'.repeat(80));
console.log('DIAGNOSTIC INTELLIGENCE DEMO');
console.log('═'.repeat(80));
console.log();

// Example 1: Compare raw data vs diagnostic analysis
console.log('EXAMPLE 1: Neighborhood Assessment - Brooklyn');
console.log('─'.repeat(80));
console.log();

console.log('Step 1: RAW DATA from Orchestrator');
console.log('-'.repeat(40));

const rawQuery = await fetch(`${ORCHESTRATOR_URL}/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What is the state of housing and services in Brooklyn?'
  })
});

const rawData = await rawQuery.json();
console.log('Data sources used:', rawData.synthesis?.data_sources?.join(', '));
console.log('Summary:', rawData.synthesis?.summary);
console.log();

console.log('Step 2: DIAGNOSTIC ANALYSIS');
console.log('-'.repeat(40));

const diagnosisQuery = await fetch(`${DIAGNOSTIC_URL}/diagnose`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What is the state of housing and services in Brooklyn?',
    context: { borough: 'BROOKLYN' }
  })
});

const diagnosis = await diagnosisQuery.json();

console.log('\n📊 HEALTH INDICATORS:');
console.log('─'.repeat(40));
if (diagnosis.diagnosis.health_indicators.service_responsiveness) {
  const sr = diagnosis.diagnosis.health_indicators.service_responsiveness;
  console.log(`Service Responsiveness: ${sr.status}`);
  console.log(`  Resolution Rate: ${sr.resolution_rate}%`);
  console.log(`  Civic Engagement: ${sr.civic_engagement}`);
}

if (diagnosis.diagnosis.health_indicators.housing_quality) {
  const hq = diagnosis.diagnosis.health_indicators.housing_quality;
  console.log(`\nHousing Quality: ${hq.status}`);
  console.log(`  Violation Burden: ${hq.violation_burden}%`);
  console.log(`  Problem Buildings: ${hq.problem_buildings}`);
}

console.log('\n📖 NARRATIVE:');
console.log('─'.repeat(40));
console.log(diagnosis.diagnosis.narrative);

if (diagnosis.diagnosis.stress_signals.length > 0) {
  console.log('\n⚠️  STRESS SIGNALS:');
  console.log('─'.repeat(40));
  diagnosis.diagnosis.stress_signals.forEach(signal => {
    console.log(`[${signal.type.toUpperCase()}] ${signal.domain}`);
    console.log(`  Signal: ${signal.signal}`);
    console.log(`  Impact: ${signal.impact}`);
    console.log();
  });
}

if (diagnosis.diagnosis.assets_and_opportunities.length > 0) {
  console.log('✨ ASSETS & OPPORTUNITIES:');
  console.log('─'.repeat(40));
  diagnosis.diagnosis.assets_and_opportunities.forEach(asset => {
    console.log(`${asset.type}: ${asset.description}`);
    console.log(`  Opportunity: ${asset.opportunity}`);
    console.log();
  });
}

if (diagnosis.diagnosis.possibilities.length > 0) {
  console.log('💡 POSSIBILITIES:');
  console.log('─'.repeat(40));
  diagnosis.diagnosis.possibilities.forEach(possibility => {
    console.log(`[${possibility.category}] Impact: ${possibility.impact}, Feasibility: ${possibility.feasibility}`);
    console.log(`  ${possibility.idea}`);
    console.log();
  });
}

console.log('🎯 SUGGESTIONS:');
console.log('─'.repeat(40));

if (diagnosis.diagnosis.suggestions.for_city_government.length > 0) {
  console.log('\nFor City Government:');
  diagnosis.diagnosis.suggestions.for_city_government.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.action}`);
    if (s.target) console.log(`     Target: ${s.target}`);
    if (s.expected_impact) console.log(`     Impact: ${s.expected_impact}`);
  });
}

if (diagnosis.diagnosis.suggestions.for_community.length > 0) {
  console.log('\nFor Community:');
  diagnosis.diagnosis.suggestions.for_community.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.action}`);
    if (s.leverage) console.log(`     Leverage: ${s.leverage}`);
    if (s.expected_impact) console.log(`     Impact: ${s.expected_impact}`);
  });
}

if (diagnosis.diagnosis.suggestions.for_policy.length > 0) {
  console.log('\nFor Policy:');
  diagnosis.diagnosis.suggestions.for_policy.forEach((s, i) => {
    console.log(`  ${i + 1}. Issue: ${s.issue}`);
    console.log(`     Recommendation: ${s.recommendation}`);
  });
}

console.log('\n📋 OVERALL ASSESSMENT:');
console.log('─'.repeat(40));
console.log(`Status: ${diagnosis.diagnosis.overall_assessment.status}`);
console.log(`Summary: ${diagnosis.diagnosis.overall_assessment.summary}`);
console.log(`Priority: ${diagnosis.diagnosis.overall_assessment.priority}`);

console.log();
console.log('═'.repeat(80));
console.log('WHAT MAKES THIS DIFFERENT:');
console.log('═'.repeat(80));
console.log(`
RAW DATA (Orchestrator):
- Gives you facts and numbers
- "Here's what the data says"
- You have to interpret it yourself

DIAGNOSTIC INTELLIGENCE (Diagnostic Agent):
- Understands what health looks like
- Identifies stress signals automatically
- Spots opportunities and assets
- Imagines possibilities
- Suggests concrete actions
- Tells you what it MEANS, not just what it IS

This is the difference between:
  "347 housing violations"
vs
  "Housing quality is stressed due to 15 problem buildings with
   concentrated violations - targeted enforcement could help
   hundreds of residents. Community organizing capacity from
   active event planning could be leveraged for tenant advocacy."

ONE IS DATA. THE OTHER IS INTELLIGENCE.
`);

console.log('═'.repeat(80));
