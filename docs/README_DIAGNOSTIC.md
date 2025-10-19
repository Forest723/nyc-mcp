# NYC Urban Intelligence System

## What This Actually Is

This isn't a data API. **This is an intelligence layer that understands cities as living organisms.**

It can:
- **DIAGNOSE** - Assess neighborhood health across multiple dimensions
- **NARRATE** - Tell multi-layered stories about what's happening
- **IMAGINE** - Generate possibilities nobody's thought of yet
- **SUGGEST** - Propose concrete actions grounded in data

## The Architecture

```
┌────────────────────────────────────────────────────────────┐
│             DIAGNOSTIC AGENT (Port 5000)                   │
│                                                            │
│  "The Brain" - Understands what health looks like         │
│  - Systems thinking                                       │
│  - Pattern recognition                                    │
│  - Narrative generation                                   │
│  - Possibility imagination                                │
│  - Suggestion engine                                      │
└────────────────┬───────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────────┐
│            ORCHESTRATOR (Port 4000)                        │
│                                                            │
│  "The Coordinator" - Routes queries, synthesizes data     │
│  - Multi-source query routing                             │
│  - Parallel data fetching                                 │
│  - Basic correlation detection                            │
└────────────────┬───────────────────────────────────────────┘
                 │
      ┌──────────┼──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼
  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌─────────┐
  │ NYC    │ │ HPD    │ │Events  │ │  DOT   │ │Comptrol.│
  │  311   │ │Housing │ │Calendar│ │Transit │ │ Finance │
  └────────┘ └────────┘ └────────┘ └────────┘ └─────────┘
      │          │          │          │          │
      ▼          ▼          ▼          ▼          ▼
  [NYC Open Data - Socrata API]
```

## The Five Data Layers

### 1. NYC 311 (Service Requests)
**What it tells us:** How residents interact with city services
- Noise complaints, heat/water issues, street conditions
- **Health indicator:** Response rate, civic engagement, trends

### 2. HPD (Housing)
**What it tells us:** Housing quality and landlord compliance
- Housing code violations, tenant complaints
- **Health indicator:** Violation rates, problem buildings, enforcement effectiveness

### 3. Events Calendar
**What it tells us:** Community vitality and street usage
- Permitted events, festivals, street fairs
- **Health indicator:** Social capital, organizing capacity

### 4. DOT (Transportation)
**What it tells us:** Infrastructure and mobility
- Street closures, traffic, parking violations
- **Health indicator:** Infrastructure quality, congestion

### 5. Comptroller (Finance)
**What it tells us:** Resource allocation
- City spending, contracts, payroll
- **Health indicator:** Resource adequacy, spending effectiveness

## How to Use It

### Traditional Query (Orchestrator)

```bash
curl -X POST http://localhost:4000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me housing complaints in Brooklyn"
  }'
```

**Returns:** Raw data from multiple sources

### Diagnostic Query (Intelligence Layer)

```bash
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the state of Brooklyn?",
    "context": {"borough": "BROOKLYN"}
  }'
```

**Returns:**
- Health assessment across domains
- Narrative explaining what's happening
- Stress signals requiring attention
- Assets and opportunities
- Imagined possibilities
- Concrete suggestions for action

## Example Output

### Input:
"What's happening with housing in Bushwick?"

### Traditional Response:
- 347 housing violations
- 89 open complaints
- 15 buildings with multiple issues

### Diagnostic Response:

```
HEALTH INDICATORS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Housing Quality: STRESSED
  Violation Burden: 52% open
  Problem Buildings: 15
  Trend: Worsening

Service Responsiveness: MODERATE
  Resolution Rate: 64%
  Civic Engagement: High

NARRATIVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Bushwick shows stressed housing quality with 52% open violations
concentrated in 15 buildings (potential slumlords). However, high
civic engagement (311 usage) indicates residents are reporting
issues. The worsening trend coincides with recent property sales
data, suggesting landlord neglect during neighborhood transition.

STRESS SIGNALS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  [CRITICAL] Housing Quality
  52% open violation rate - significant quality issues
  Impact: Residents living in substandard conditions

⚡ [ENFORCEMENT OPPORTUNITY]
  15 buildings with multiple violations
  Impact: Targeted enforcement could help hundreds of residents

ASSETS & OPPORTUNITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Community Engagement
  High 311 usage indicates engaged residents
  Opportunity: Leverage for collective action

✨ Event Organizing Capacity
  23 community events last quarter
  Opportunity: Existing organizing infrastructure could be
  directed toward tenant advocacy

POSSIBILITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 Targeted Enforcement
  Focus HPD on 15 problem buildings → impact hundreds
  Impact: HIGH | Feasibility: HIGH

💡 Community Organizing
  The capacity that produces events could organize tenant
  associations in problem buildings
  Impact: HIGH | Feasibility: MODERATE

SUGGESTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
For City Government:
  1. Launch coordinated HPD enforcement on 15 buildings
     Impact: Improve conditions for ~500 residents

For Community:
  1. Form tenant associations in problem buildings
     Leverage: Existing event-organizing capacity

OVERALL: STRESSED - Immediate attention needed
```

## What Makes This Powerful

### 1. Systems Thinking
It understands how different urban systems interconnect:
- Housing violations → 311 complaints
- City spending → outcome improvements
- Events → traffic/parking issues
- Landlord behavior → multiple data signals

### 2. Multi-Scale Analysis
- **Micro:** Individual buildings with issues
- **Meso:** Neighborhood patterns
- **Macro:** Borough/citywide trends

### 3. Health Assessment
It knows what "healthy" looks like:
- Service responsiveness > 70%
- Low/decreasing violation rates
- Resources matching needs
- Improving trajectories

### 4. Stress Detection
Automatically identifies:
- Critical issues (immediate action needed)
- Warning signals (attention required)
- Enforcement opportunities (high impact targets)
- Systemic neglect (resource misallocation)

### 5. Asset Recognition
Spots positive factors to leverage:
- Community organizing capacity
- Improving trends
- Effective interventions
- High civic engagement

### 6. Generative Thinking
Imagines possibilities like:
- "Event organizing capacity could be directed at tenant advocacy"
- "These 15 buildings represent 60% of the problem - target them"
- "This intervention is working - scale it elsewhere"

## Running the System

```bash
# 1. Set up environment
cp .env.example .env
# Add your NYC Open Data API keys

# 2. Start everything
docker-compose up --build

# 3. Services will be available at:
#    - Diagnostic Agent: http://localhost:5000
#    - Orchestrator: http://localhost:4000
#    - Individual MCPs: http://localhost:3001-3005
```

## Example Queries

### Neighborhood Diagnosis
```bash
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Diagnose Manhattan",
    "context": {"borough": "MANHATTAN"}
  }'
```

### Cross-System Investigation
```bash
curl -X POST http://localhost:5000/diagnose \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Are areas with high housing violations getting city funding?"
  }'
```

### Neighborhood Health Report
```bash
curl -X POST http://localhost:5000/neighborhood-health \
  -H "Content-Type: application/json" \
  -d '{
    "borough": "BROOKLYN",
    "days": 90
  }'
```

## Use Cases

### 1. Investigative Journalism
"Show me landlords with violations who are also getting city contracts"

### 2. Policy Analysis
"Is our housing spending effective? Are outcomes improving?"

### 3. Community Organizing
"Which buildings should we focus on for tenant organizing?"

### 4. Urban Planning
"What neighborhoods need more resources based on multi-domain stress signals?"

### 5. Accountability
"Where is money being spent and are problems being solved?"

## What's Different From Traditional Tools

**Traditional Dashboard:**
- Shows you data
- "Here are the numbers"
- You interpret

**This System:**
- Understands context
- "Here's what it means"
- "Here's what could change"
- Suggests actions

**Traditional Query:**
"347 housing violations"

**Diagnostic Intelligence:**
"Housing is stressed due to 15 concentrated bad actors. Targeted enforcement could help 500 residents. The community has organizing capacity from running events that could be directed toward tenant advocacy."

## The Vision

This is a **digital twin of NYC's civic nervous system**.

It can answer questions like:
- "Which neighborhoods are healthy? Which are stressed? Why?"
- "Is city spending effective? Where should resources go?"
- "What interventions are working? Where should we scale them?"
- "What's the story of this neighborhood across all systems?"

**It sees the city as an organism, not a spreadsheet.**

---

Built with love for cities and the people who live in them.
