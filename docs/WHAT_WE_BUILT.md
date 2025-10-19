# What We Actually Built

## TL;DR

**We built an intelligence layer that can diagnose cities the way a doctor diagnoses patients.**

It doesn't just query data. It **understands what health looks like**, **tells stories about what's happening**, **imagines possibilities**, and **suggests concrete actions**.

## The Full Stack

### Layer 1: Data Sources (5 MCPs)
Each MCP talks to a specific NYC dataset:

1. **NYC-311** - Service requests & complaints
2. **NYC-HPD** - Housing violations & quality
3. **NYC-Events** - Community events & permits
4. **NYC-DOT** - Transportation & infrastructure
5. **NYC-Comptroller** - City spending & contracts

**Enhanced with diagnostic tools:**
- `get_neighborhood_health` - Comprehensive 311 health metrics
- `get_housing_health` - Housing quality assessment with problem building identification

### Layer 2: Orchestrator (Query Router)
- Routes queries to appropriate MCPs based on keywords
- Calls multiple MCPs in parallel
- Synthesizes results from different sources
- Detects basic correlations

### Layer 3: Diagnostic Agent (The Brain)
This is where the magic happens. It:

**UNDERSTANDS:**
- What makes a neighborhood healthy (across all dimensions)
- How city systems interconnect
- What stress signals look like in data
- How to see patterns across scales (building → neighborhood → borough)

**ANALYZES:**
- Extracts health metrics from multi-source data
- Identifies stress signals (critical, warning, opportunities)
- Spots assets and positive trends
- Detects systemic patterns (resource mismatch, concentrated problems)

**NARRATES:**
- Tells multi-layered stories about what's happening
- Explains what the data MEANS, not just what it IS
- Provides context and interpretation

**IMAGINES:**
- Generates possibilities based on patterns
- Suggests interventions nobody's thought of
- Identifies underutilized assets
- Proposes unexpected connections

**SUGGESTS:**
- Concrete actions for city government
- Organizing strategies for communities
- Policy recommendations with data support
- Prioritized by impact and feasibility

## The Difference It Makes

### Before (Traditional Query Tool):
**Input:** "Show me data about Brooklyn"

**Output:**
```json
{
  "311_complaints": 1247,
  "housing_violations": 347,
  "events": 23
}
```

You get numbers. You interpret them yourself.

### After (Diagnostic Intelligence):
**Input:** "What's happening in Brooklyn?"

**Output:**
```
DIAGNOSIS: Brooklyn

HEALTH INDICATORS:
Housing: STRESSED (52% open violations)
Services: MODERATE (64% resolution rate)
Community: HIGH VITALITY (23 events, engaged residents)

NARRATIVE:
Brooklyn shows stressed housing quality concentrated in 15
problem buildings, but high community engagement indicates
organizing capacity. The disconnect between housing problems
and service responsiveness suggests enforcement gaps rather
than resource constraints.

STRESS SIGNALS:
⚠️  15 buildings with multiple violations (enforcement opportunity)
⚡ Housing complaints increasing 23% (worsening conditions)

ASSETS:
✨ High civic engagement (could be leveraged)
✨ Strong event-organizing infrastructure

POSSIBILITIES:
💡 Target enforcement on 15 buildings → impact 500+ residents
💡 Redirect event-organizing capacity toward tenant advocacy
💡 Coordinate HPD enforcement with community organizing

SUGGESTIONS:
For City: Launch coordinated enforcement campaign
For Community: Form tenant associations in problem buildings
For Policy: Review resource allocation formulas

OVERALL: STRESSED - Immediate attention needed
```

You get **understanding**, **story**, **possibilities**, and **action steps**.

## Real-World Applications

### 1. Investigative Journalism
**Question:** "Are landlords with violations getting city contracts?"

**System:**
- Queries HPD for problem landlords
- Queries Comptroller for contract recipients
- Cross-references and finds matches
- Narratives: "These 5 landlords have 200+ violations AND $2M in city contracts"
- Suggests: "Story angle: accountability gap in city procurement"

### 2. Community Organizing
**Question:** "Where should we focus tenant organizing efforts?"

**System:**
- Identifies buildings with multiple violations
- Assesses community organizing capacity (from events data)
- Maps civic engagement levels (311 usage)
- Suggests: "These 15 buildings, high resident engagement, existing organizing infrastructure"

### 3. Policy Analysis
**Question:** "Is our housing spending effective?"

**System:**
- Maps city spending (Comptroller)
- Tracks housing complaints over time (HPD + 311)
- Correlates spending with outcome improvements
- Narratives: "High spending in Area A shows 30% reduction in violations. Low spending in Area B shows 45% increase."
- Suggests: "Reallocate resources, scale what's working"

### 4. Urban Planning
**Question:** "Which neighborhoods need attention?"

**System:**
- Assesses health across all dimensions
- Identifies stressed areas
- Spots resource mismatches
- Prioritizes by severity and feasibility
- Suggests: "These 3 neighborhoods show critical stress across multiple domains"

## The Technical Innovation

### What Makes This Different

**Traditional:**
```
User → API → Single Dataset → Raw Data → User Interprets
```

**Our System:**
```
User → Diagnostic Agent → Orchestrator → 5 MCPs (parallel)
         ↓
     Understands health indicators
         ↓
     Extracts metrics across domains
         ↓
     Identifies patterns & correlations
         ↓
     Generates narrative
         ↓
     Imagines possibilities
         ↓
     Suggests actions
         ↓
User → Gets Understanding + Story + Actions
```

### The Secret Sauce

**Systems Understanding Embedded in Code:**
The diagnostic engine knows:
- Resolution rate > 70% = healthy
- Open violations > 50% = critical
- Complaints increasing + violations increasing = systemic deterioration
- High engagement + high events = organizing capacity
- Problem buildings = enforcement opportunity

**Multi-Scale Pattern Recognition:**
- Building level: This landlord is bad
- Neighborhood level: Multiple bad landlords = concentrated neglect
- Borough level: Resource allocation mismatch
- Cross-domain: Housing problems + no city spending = systemic issue

**Generative Thinking:**
Not just "here's the problem" but "here's what could be different":
- Underutilized assets
- Unexpected connections
- Scaling what works
- Imagining futures

## What You Can Ask It

### Diagnostic Questions
- "What's the health of this neighborhood?"
- "Where are the stress points in Brooklyn?"
- "Which areas need immediate attention?"

### Investigative Questions
- "Are areas with high violations getting city funding?"
- "Do major events correlate with complaint spikes?"
- "Which landlords are repeat offenders?"

### Strategic Questions
- "Where should we allocate resources?"
- "What interventions are working?"
- "Where's the organizing capacity?"

### Systems Questions
- "How do housing and infrastructure connect?"
- "Is spending effective at improving outcomes?"
- "What's the complete picture of this area?"

## The Vision

This isn't just for NYC. This is a **template for understanding cities**.

Replace the 5 MCPs with data from any city:
- SF → crime, housing, transit, permits, spending
- Chicago → same pattern
- Your city → same pattern

The diagnostic intelligence layer stays the same. It knows:
- What health looks like
- How to spot stress
- How to tell stories
- How to imagine possibilities
- How to suggest actions

**It's infrastructure for asking better questions about cities.**

## Next Steps

### What We Could Add

**More Data Layers:**
- Crime (NYPD)
- Schools (DOE)
- Health (DOHMH)
- Environmental (DEP)

**LLM Integration:**
Use GPT-4/Claude to make narratives even richer:
- Natural language queries
- Richer storytelling
- More nuanced analysis

**Temporal Analysis:**
- Track changes over time
- Measure intervention effectiveness
- Predict trends

**Spatial Analysis:**
- Heat maps
- Clustering detection
- Spillover effects

**User Interface:**
Make it accessible to non-technical users:
- Web app
- Visualizations
- Natural language interface

### Who This Is For

**Journalists:**
Investigative stories that would take weeks of custom coding → instant

**Community Organizers:**
Data-driven organizing strategies → identify where to focus

**City Government:**
Evidence-based policy and resource allocation → measure what works

**Urban Planners:**
Systemic understanding of neighborhood health → plan better

**Researchers:**
Cross-domain analysis of urban systems → discover patterns

## The Bottom Line

**We built a city diagnostician.**

It sees NYC as a living organism. It can:
- Tell you where it's healthy and where it's stressed
- Explain what's happening and why it matters
- Imagine what could be different
- Suggest concrete actions to make it better

It thinks in systems, speaks in stories, and suggests futures.

**That's what we built.**

---

*"The city is not a problem to be solved. It's an organism to be understood."*
