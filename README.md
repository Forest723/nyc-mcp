# NYC Open Data MCP Server

**Give Claude AI direct access to real-time NYC Open Data.**

A comprehensive Model Context Protocol (MCP) server that connects Claude to NYC's open data ecosystem, enabling AI-powered analysis of city services, housing quality, transportation, events, government spending, and civic trends across all five boroughs.

## What It Does

Gives Claude access to live NYC data across **5 major city systems** with **17 powerful tools**:

- ✅ **311 Service Requests** (4 tools) - Search complaints, analyze response times, identify trends, measure neighborhood health and civic engagement
- ✅ **HPD Housing** (4 tools) - Housing violations, tenant complaints, building registrations, comprehensive housing health scoring
- ✅ **Comptroller Financial Data** (3 tools) - Search city spending, contracts, and payroll from NYC's $100B+ annual budget
- ✅ **DOT Traffic & Transportation** (3 tools) - Street closures, parking violations, traffic volume with hourly breakdowns
- ✅ **NYC Events Calendar** (3 tools) - Search city-sponsored events, get upcoming events, analyze event patterns and density

**All data sources are live** - queries pull directly from NYC Open Data's Socrata API with no caching or stale data.

## Quick Start

### 1. Install

```bash
git clone <your-repo>
cd nyc-mcp
npm install
```

### 2. Configure Claude

Add to your Claude config:

**Claude Code:** `~/.config/claude/config.json`
**Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nyc-open-data": {
      "command": "node",
      "args": ["/FULL/PATH/TO/nyc-mcp/index.js"]
    }
  }
}
```

Replace `/FULL/PATH/TO/nyc-mcp` with your actual path.

### 3. Restart Claude

- **Claude Code:** Completely quit VS Code (⌘+Q) and reopen
- **Claude Desktop:** Quit and reopen the app

### 4. Try It Out

Ask Claude anything about NYC! Here are some examples:

**🏙️ Neighborhood Quality Analysis:**
- "Create a comprehensive neighborhood quality report for Brooklyn"
- "What are the biggest quality-of-life issues in Queens right now?"
- "Compare housing conditions across all five boroughs"
- "Show me which neighborhoods have the fastest 311 response times"

**🏢 Housing & Safety:**
- "Find buildings with serious safety violations in my area"
- "What are the most common housing code violations in NYC?"
- "Show me all lead paint violations in Brooklyn"
- "Which buildings have the most tenant complaints?"
- "Analyze housing health trends over the past 90 days"

**💰 Government Spending & Transparency:**
- "How much does NYC spend on education vs public safety?"
- "Show me the city's largest contracts this year"
- "What's the average salary for different city job titles?"
- "Find all Department of Sanitation spending over $100K"
- "Which vendors have the most contracts with the city?"

**🚦 Transportation & Infrastructure:**
- "What streets are closed for construction in Manhattan?"
- "Show me traffic volume patterns on major highways"
- "Where are the most parking violations issued?"
- "Analyze rush hour traffic patterns across NYC"
- "When will road work on my street be completed?"

**🎉 Events & Community:**
- "What events are happening this weekend across NYC?"
- "Show me all upcoming sports events in Queens"
- "Analyze which boroughs have the most community events"
- "Find free concerts in Central Park this month"
- "What types of events are most popular in each borough?"

**📊 Deep Analysis:**
- "What are NYC's biggest problems right now based on data?"
- "Create a data-driven plan to improve quality of life"
- "Identify systemic issues in city services"
- "Compare civic engagement across neighborhoods"
- "What trends should the next mayor focus on?"

## Architecture

```
┌──────────────────┐
│  Claude          │
└────────┬─────────┘
         │ stdio (MCP)
         ▼
┌──────────────────┐
│  index.js        │  ← One Node.js script
└────────┬─────────┘
         │ HTTP
         ▼
┌──────────────────┐
│  NYC Open Data   │
│  (Socrata API)   │
└──────────────────┘
```

No Docker. No orchestrator. Just one Node.js script.

## Available Tools

### 311 Service Requests

**`search_311_complaints`**
- Search by complaint type, borough, date range
- Returns complaint details from NYC Open Data

**`get_311_response_times`**
- Analyze average response times
- Filter by complaint type and borough

**`analyze_311_trends`**
- Identify trends over time
- Group by day, week, or month

**`get_neighborhood_health`**
- Comprehensive health metrics
- Resolution rates, complaint density, civic engagement

### Comptroller Financial Data

**`search_comptroller_spending`**
- Search NYC expense budget data by agency, amount, fiscal year
- View budgeted amounts across the city's $70B+ budget
- Note: Shows budget allocations, not actual transaction-level spending

**`search_comptroller_contracts`**
- Search government contracts by agency and vendor
- View contract amounts, dates, and descriptions
- Track procurement across city agencies

**`get_comptroller_payroll`**
- Search NYC government payroll data
- Filter by agency, fiscal year, and job title
- Analyze city employee compensation and averages

### DOT Traffic & Transportation

**`search_dot_street_closures`**
- Search active street closures and construction worksites
- Filter by borough and work type
- View start/end dates and affected streets

**`get_dot_parking_violations`**
- Search parking violation tickets
- Filter by county and violation code
- View fines, penalties, and summons details

**`get_dot_traffic_volume`**
- Get traffic volume data with hourly breakdowns
- Analyze traffic patterns by roadway and direction
- Historical data showing peak traffic times

### NYC Events Calendar

**`search_events`**
- Search city-sponsored events by type, borough, and date
- Same data as nyc.gov "Find Local Events"
- View event details, locations, and schedules

**`get_upcoming_events`**
- Get upcoming events in the next N days
- Filter by borough to see what's happening in your area
- Sorted chronologically for easy planning

**`analyze_event_impact`**
- Analyze event patterns and density across NYC
- Breakdowns by type, borough, and timeline
- Understand event impact on neighborhoods

### HPD Housing

**`search_hpd_violations`**
- Search housing code violations by borough, building, or status
- View safety issues and compliance problems
- Track violation inspection dates and resolutions

**`search_hpd_complaints`**
- Search tenant complaints about housing conditions
- Filter by borough, status, and time period
- Issues include heating, hot water, pests, leaks

**`get_hpd_registrations`**
- Get building registration data by borough or zip
- View registered rental buildings and owners
- Check registration status and expiration dates

**`get_housing_health`**
- Comprehensive housing health analysis
- Combines violations and complaints for quality assessment
- Identifies problem buildings and enforcement targets
- Tracks trends and provides health scores

## Data Sources

**311 Service Requests** - NYC's Socrata Open Data API:
- **No authentication required** (1000 requests/day limit)
- **Optional:** Get a free app token for 50k/day at [NYC Open Data](https://data.cityofnewyork.us/profile/app_tokens)
- Dataset: [311 Service Requests](https://data.cityofnewyork.us/resource/erm2-nwe9.json)

**Comptroller Checkbook NYC** - NYC's Socrata Open Data API:
- Same API infrastructure as 311 data
- Datasets: [Spending](https://data.cityofnewyork.us/resource/mxwn-eh3b.json), [Contracts](https://data.cityofnewyork.us/resource/qyyg-4tf5.json), [Payroll](https://data.cityofnewyork.us/resource/k397-673e.json)
- Provides unprecedented access to NYC's ~$70 billion annual budget

**DOT Traffic & Transportation** - NYC's Socrata Open Data API:
- Same API infrastructure as 311 data
- Datasets: [Street Closures](https://data.cityofnewyork.us/resource/i6b5-j7bu.json), [Parking Violations](https://data.cityofnewyork.us/resource/nc67-uf89.json), [Traffic Volume](https://data.cityofnewyork.us/resource/btm5-ppia.json)
- Real-time construction updates and historical traffic patterns

**NYC Events Calendar** - NYC's Socrata Open Data API:
- Same API infrastructure as 311 data
- Dataset: [NYC Parks Events](https://data.cityofnewyork.us/resource/tvpp-9vvx.json)
- City-sponsored events including parks, sports, film/TV production, and special events

**HPD Housing** - NYC's Socrata Open Data API:
- Same API infrastructure as 311 data
- Datasets: [Violations](https://data.cityofnewyork.us/resource/wvxf-dwi5.json), [Complaints](https://data.cityofnewyork.us/resource/uwyv-629c.json), [Registrations](https://data.cityofnewyork.us/resource/tesw-yqqr.json)
- Comprehensive housing quality data and building compliance tracking

## Project Structure

```
nyc-mcp/
├── index.js                              # Main MCP server (single entry point)
├── package.json                          # Dependencies and metadata
├── .mcp.json                             # MCP server configuration
├── mcps/                                 # Tool implementations by data source
│   ├── nyc-311/tools/                   # 311 Service Request tools
│   │   ├── search_complaints.js
│   │   ├── get_response_times.js
│   │   ├── analyze_trends.js
│   │   └── get_neighborhood_health.js
│   ├── nyc-hpd/tools/                   # Housing Preservation tools
│   │   ├── search_violations.js
│   │   ├── search_complaints.js
│   │   ├── get_registrations.js
│   │   └── get_housing_health.js
│   ├── nyc-comptroller/tools/           # Financial data tools
│   │   ├── search_spending.js
│   │   ├── search_contracts.js
│   │   └── get_payroll.js
│   ├── nyc-dot/tools/                   # Transportation tools
│   │   ├── search_street_closures.js
│   │   ├── get_parking_violations.js
│   │   └── get_traffic_volume.js
│   └── nyc-events/tools/                # Events calendar tools
│       ├── search_events.js
│       ├── get_upcoming_events.js
│       └── analyze_event_impact.js
└── docs/
    ├── notes.txt                         # Development notes
    └── README.md                         # This file
```

## Adding More Data Sources

Want to extend this with more NYC datasets? The architecture makes it easy:

1. **Create a new tools directory**: `mcps/nyc-[source]/tools/`
2. **Implement tool functions**: Each tool exports a default async function that takes parameters and returns data
3. **Add to index.js**:
   - Import the tool function
   - Add tool definition to `TOOLS` array with name, description, and input schema
   - Add a case to the switch statement in the tool call handler

**Example template for a new tool:**

```javascript
// mcps/nyc-parks/tools/search_playgrounds.js
export default async function searchPlaygrounds({ borough, accessible }) {
  const params = new URLSearchParams({ $$app_token: '...' });
  if (borough) params.append('borough', borough);
  if (accessible) params.append('accessible', 'Yes');

  const response = await fetch(
    `https://data.cityofnewyork.us/resource/[dataset-id].json?${params}`
  );
  const data = await response.json();

  return {
    success: true,
    count: data.length,
    playgrounds: data
  };
}
```

See existing tools in `mcps/` for complete examples. All NYC Open Data datasets use the same Socrata API structure.

## Key Features

✨ **Comprehensive Coverage**
- 17 tools across 5 major NYC data systems
- Direct access to live data (no caching or delays)
- Coverage includes all 5 boroughs

🚀 **Performance & Simplicity**
- Single Node.js script architecture (no Docker, no orchestration)
- Fast responses from Socrata's CDN-backed API
- No authentication required to get started (1000 req/day free tier)

🧠 **AI-Powered Analysis**
- Trend detection and pattern recognition
- Neighborhood health scoring
- Civic engagement metrics
- Comparative analysis across boroughs

🔧 **Developer Friendly**
- Clean, modular tool structure
- Easy to extend with new data sources
- Comprehensive error handling
- Well-documented code

📊 **Data Quality**
- Official NYC Open Data sources
- Real-time updates as city agencies publish
- Same data used by NYC.gov and city dashboards
- Socrata API reliability (99.9% uptime)

## Troubleshooting

**"No MCP servers showing up in Claude"**
- Verify config path is correct (use **full absolute path**, not ~/)
- Make sure you **completely quit** Claude/VS Code (⌘+Q on Mac, not just reload)
- Check for syntax errors in config JSON
- Try running `node index.js` directly to verify it works

**"Module not found" errors**
- Run `npm install` in the project root
- Make sure you're using Node.js v20 or higher (`node --version`)

**Rate limiting**
- Public Socrata API allows 1000 requests/day
- Get free app token for 50k/day limit at [NYC Open Data](https://data.cityofnewyork.us/profile/app_tokens)
- Add `X-App-Token` header to requests if needed

## Use Cases

**For Residents:**
- Track neighborhood quality and safety issues
- Monitor city service response times
- Find community events and activities
- Research housing conditions before moving
- Hold government accountable with spending data

**For Journalists:**
- Investigate government spending patterns
- Identify systemic issues in city services
- Track housing code enforcement
- Analyze neighborhood disparities
- Data-driven investigative reporting

**For Researchers:**
- Urban planning and policy analysis
- Quality of life metrics across neighborhoods
- Government efficiency studies
- Housing market trends
- Civic engagement research

**For Developers:**
- Build civic tech applications
- Create neighborhood dashboards
- Develop housing search tools
- Make data visualizations
- Prototype city improvement ideas

**For Policy Makers:**
- Evidence-based decision making
- Identify service gaps
- Measure program effectiveness
- Budget allocation analysis
- Constituent issue tracking

## Performance Notes

**API Rate Limits:**
- Public API: 1,000 requests/day (no token required)
- With free app token: 50,000 requests/day
- App token: Get one free at [NYC Open Data](https://data.cityofnewyork.us/profile/app_tokens)

**Response Times:**
- Typical query: 200-500ms
- Complex aggregations: 1-3 seconds
- Socrata API has built-in caching for common queries
- Results are streamed for better perceived performance

**Best Practices:**
- Use specific date ranges to reduce result size
- Filter by borough when possible
- Set reasonable limits (default: 100 records)
- Use trend analysis tools instead of fetching all raw data

## Real-World Examples

**Example 1: Neighborhood Quality Report**
```
You: "Create a comprehensive neighborhood quality report for Brooklyn"

Claude uses:
- search_311_complaints (get recent service requests)
- search_hpd_violations (check housing code violations)
- get_upcoming_events (find community activities)
- analyze_311_trends (identify patterns)

Result: Multi-page report with quality metrics, safety analysis,
housing conditions, and civic engagement levels
```

**Example 2: Housing Search Due Diligence**
```
You: "I'm looking at an apartment at 123 Main St, Brooklyn.
      What are the building's violations?"

Claude uses:
- search_hpd_violations (building-specific query)
- search_hpd_complaints (tenant complaint history)
- search_311_complaints (service requests at that address)

Result: Complete violation history, safety issues, and complaint patterns
to inform your rental decision
```

**Example 3: Government Accountability**
```
You: "How much did NYC spend on homelessness services this year
      compared to last year?"

Claude uses:
- search_comptroller_spending (filter by agency/category)
- Multiple queries for year-over-year comparison

Result: Detailed spending breakdown, contract analysis, and budget trends
```

**Example 4: Urban Planning Research**
```
You: "What are the biggest infrastructure bottlenecks in Manhattan?"

Claude uses:
- search_dot_street_closures (construction patterns)
- get_traffic_volume (congestion data)
- search_311_complaints (resident complaints about streets/traffic)

Result: Data-driven analysis of construction impact, traffic patterns,
and resident quality-of-life issues
```

## What About the Docker Stuff?

The `docker-compose.yml` was an earlier, more complex architecture. It still works if you want an HTTP API for custom applications, but **Claude doesn't need it**. The simple `index.js` approach is cleaner, faster, and matches how professional MCP projects are structured.

For MCP usage, stick with the single-file approach. For building custom web apps, you could expose the tools via HTTP - but that's beyond the scope of this MCP server.

## Built With

- [Model Context Protocol](https://modelcontextprotocol.io/) - AI-to-data connection standard by Anthropic
- [NYC Open Data](https://opendata.cityofnewyork.us/) - Official NYC open data platform (2,000+ datasets)
- [Socrata API](https://dev.socrata.com/) - Open data API infrastructure
- Node.js ES Modules - Modern JavaScript for clean, maintainable code

## Contributing

This project is feature-complete with all 5 major NYC data sources integrated! 🎉

**Want to contribute?**
- **Add new tools**: More analysis capabilities for existing data sources
- **Improve documentation**: Better examples, use cases, or setup guides
- **Report bugs**: Open an issue if something isn't working
- **Share use cases**: Tell us what you've built with this!

**Potential expansions:**
- NYC Parks and Recreation data
- FDNY fire incident data
- NYPD crime statistics
- Department of Education school performance
- Environmental Protection air quality data
- More analytical tools for existing sources

See the "Adding More Data Sources" section for implementation details.

## License

MIT - Feel free to use this for any purpose, commercial or non-commercial.

## Acknowledgments

- **NYC Open Data Team** - For maintaining an incredible public data platform
- **Anthropic** - For creating the Model Context Protocol and Claude
- **Socrata** - For building reliable, scalable open data infrastructure
- **NYC Residents** - Whose 311 reports and civic engagement make this data possible

## Resources & Links

**MCP & Claude:**
- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [MCP GitHub Repository](https://github.com/anthropics/model-context-protocol)

**NYC Open Data:**
- [NYC Open Data Portal](https://opendata.cityofnewyork.us/)
- [Socrata API Documentation](https://dev.socrata.com/)
- [311 Service Requests Dataset](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9)
- [HPD Violations Dataset](https://data.cityofnewyork.us/Housing-Development/Housing-Maintenance-Code-Violations/wvxf-dwi5)
- [Checkbook NYC (Spending Data)](https://www.checkbooknyc.com/)

**Civic Tech:**
- [NYC Planning Labs](https://labs.planning.nyc.gov/)
- [BetaNYC](https://beta.nyc/) - Civic technology and open government community

---

**Built with ❤️ for NYC residents, researchers, and civic technologists**

*"In God we trust. All others must bring data."* - W. Edwards Deming
