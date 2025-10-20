# NYC Open Data MCP Server

**Give Claude AI direct access to real-time NYC Open Data.**

A Model Context Protocol (MCP) server that connects Claude to NYC's 311 service request data, enabling AI-powered analysis of city complaints, response times, neighborhood health, and civic trends.

## What It Does

Gives Claude access to live NYC data:
- ✅ **311 Service Requests** - Search complaints, analyze response times, identify trends, measure neighborhood health
- 🏗️ **Housing Violations (HPD)** - Tools ready, wiring in progress
- 🏗️ **NYC Events Calendar** - Tools ready, wiring in progress
- 🏗️ **DOT Traffic Data** - Tools ready, wiring in progress
- 🏗️ **Comptroller Financial Data** - Tools ready, wiring in progress

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

### 4. Try It

Ask Claude things like:
- "Show me the most recent noise complaints in Brooklyn"
- "What are the top 10 complaint types in Manhattan this month?"
- "How long does it take to resolve illegal parking complaints in Queens?"
- "What are the trending complaint types across NYC in the last 90 days?"
- "Analyze civic engagement levels across all NYC boroughs"
- "Compare response times for different complaint types in Staten Island"

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

## Data Source

Uses NYC's Socrata Open Data API:
- **No authentication required** (1000 requests/day limit)
- **Optional:** Get a free app token for 50k/day at [NYC Open Data](https://data.cityofnewyork.us/profile/app_tokens)
- Dataset: [311 Service Requests](https://data.cityofnewyork.us/resource/erm2-nwe9.json)

## Project Structure

```
nyc-mcp/
├── index.js                    # Main MCP server (this is what Claude runs)
├── package.json
├── mcps/
│   └── nyc-311/
│       └── tools/              # Tool implementations
│           ├── search_complaints.js
│           ├── get_response_times.js
│           ├── analyze_trends.js
│           └── get_neighborhood_health.js
└── docs/
    └── SETUP.md                # Detailed setup guide
```

## Adding More Data Sources

To add HPD, Events, DOT, or Comptroller:

1. Create tool implementation in `mcps/[source]/tools/`
2. Import and add to `TOOLS` array in `index.js`
3. Add case to switch statement in `CallToolRequestSchema` handler

See existing 311 tools for examples.

## Features

- **Real-time Data**: Direct access to NYC Open Data via Socrata API
- **No Authentication Required**: Works out of the box (1000 req/day)
- **Smart Analysis**: AI-powered trend detection and neighborhood health scoring
- **Simple Architecture**: Single Node.js script, no Docker/orchestration needed
- **Extensible**: Easy to add more NYC data sources

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

## What About the Docker Stuff?

The `docker-compose.yml` and orchestrator were an earlier, more complex architecture. They still work if you want an HTTP API for custom applications, but **Claude doesn't need them**. The simple `index.js` approach is cleaner and matches how professional MCP projects are structured.

## Contributing

Want to add more data sources? The infrastructure is ready:
- HPD Housing tools are built and ready to wire up
- DOT Traffic tools are built and ready to wire up
- Events Calendar tools are built and ready to wire up
- Comptroller Financial tools are built and ready to wire up

See the `mcps/` directory for existing tool implementations.

## Built With

- [Model Context Protocol](https://modelcontextprotocol.io/) - AI-to-data connection protocol
- [NYC Open Data](https://opendata.cityofnewyork.us/) - NYC's open data platform
- [Socrata API](https://dev.socrata.com/) - Open data API

## License

MIT

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [NYC Open Data Portal](https://opendata.cityofnewyork.us/)
- [311 Service Requests Dataset](https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9)
- [Claude Code](https://docs.claude.com/claude-code)
