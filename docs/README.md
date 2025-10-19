# NYC Data MCP Ecosystem

A production-ready, multi-MCP (Model Context Protocol) system for intelligent access to NYC Open Data. This project demonstrates how to build composable AI agents that can route queries, synthesize results, and discover correlations across multiple data sources.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR (MCL)                       │
│  ┌──────────────┐         ┌─────────────────┐              │
│  │ Query Router │────────▶│  Synthesizer    │              │
│  └──────────────┘         └─────────────────┘              │
│         │                          ▲                        │
│         │                          │                        │
│         ▼                          │                        │
│  ┌────────────────────────────────────┐                    │
│  │      registry.json                 │                    │
│  │  (MCP capability metadata)         │                    │
│  └────────────────────────────────────┘                    │
└────────────┬──────────────┬──────────────┬─────────────────┘
             │              │              │
       ┌─────▼─────┐  ┌────▼─────┐  ┌────▼──────┐
       │  NYC-311  │  │ NYC-DOB  │  │NYC-Property│
       │    MCP    │  │   MCP    │  │    MCP     │
       └───────────┘  └──────────┘  └────────────┘
             │              │              │
       ┌─────▼─────┐  ┌────▼─────┐  ┌────▼──────┐
       │  Socrata  │  │ Socrata  │  │  Socrata   │
       │    API    │  │   API    │  │    API     │
       └───────────┘  └──────────┘  └────────────┘
```

## Features

### Intelligent Query Routing
- Analyzes natural language queries
- Routes to appropriate MCP(s) based on keywords and capabilities
- Supports multi-source queries automatically

### Multi-Source Synthesis
- Combines results from multiple data sources
- Identifies correlations between datasets
- Provides insights and trends

### Standalone MCPs
Each MCP can run independently or as part of the ecosystem:
- **NYC-311**: Service requests, response times, complaint trends
- **NYC-DOB**: Building permits, violations, construction activity
- **NYC-Property**: Property data, sales history, assessments

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js (v20 or higher)
- NYC Open Data App Token ([Get one here](https://data.cityofnewyork.us/profile/app_tokens))
- Claude Desktop or Claude Code

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nyc-data-mcp.git
cd nyc-data-mcp
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env and add your NYC_APP_TOKEN
```

3. Start the ecosystem:
```bash
docker compose up -d --build
```

4. Configure Claude MCP (for Claude Desktop or Claude Code):
```bash
./install-mcp.sh
```

The install script will:
- Install MCP wrapper dependencies
- Configure Claude Desktop and/or Claude Code
- Provide instructions for next steps

**Manual Configuration (Alternative):**

If you prefer to configure manually, add this to your Claude config:
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Code**: `~/.config/claude/config.json`

```json
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": ["<full-path-to-repo>/mcp-wrappers/mcp-orchestrator-wrapper.js"],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
```

The services will be available at:
- Orchestrator: `http://localhost:4000`
- NYC-311 MCP: `http://localhost:3001`
- NYC-HPD MCP: `http://localhost:3002`
- NYC-Events MCP: `http://localhost:3003`
- NYC-DOT MCP: `http://localhost:3004`
- NYC-Comptroller MCP: `http://localhost:3005`

## Usage

### Using with Claude (Recommended)

Once configured, you can ask Claude questions directly:

**In Claude Desktop or Claude Code:**
```
What are the most common 311 complaints in Brooklyn?

Show me noise complaints and construction activity in Manhattan from the last 30 days

What NYC events are happening this weekend?

Analyze housing violations in Queens
```

Claude will automatically use the NYC MCP orchestrator to:
1. Route your query to the appropriate data sources
2. Fetch and combine data from multiple sources
3. Synthesize insights and correlations

### Direct API Usage

You can also query the orchestrator directly via HTTP:

```bash
curl -X POST http://localhost:4000/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me noise complaints in Brooklyn from the last month"
  }'
```

### Using the Examples

```bash
cd examples
npm install

# Run simple query example
npm run simple

# Run complex investigation
npm run complex

# Run direct MCP calls
npm run direct
```

### Query Examples

**Single-source queries:**
- "What are the noise complaints in Manhattan?"
- "Show me recent construction permits in Brooklyn"
- "What properties sold in Queens last month?"

**Multi-source queries:**
- "Are there neighborhoods with both high construction violations and noise complaints?"
- "Show construction activity and property sales trends in Manhattan"
- "Find areas with building violations and 311 complaints"

### API Endpoints

#### Orchestrator

**POST /query**
Send a natural language query to the orchestrator.

```json
{
  "query": "your question here",
  "context": {
    "borough": "MANHATTAN",
    "days": 30,
    "limit": 100
  }
}
```

**POST /call/:mcpName/:toolName**
Call a specific MCP tool directly.

```bash
curl -X POST http://localhost:4000/call/nyc-311/search_complaints \
  -H "Content-Type: application/json" \
  -d '{
    "borough": "BROOKLYN",
    "complaint_type": "Noise",
    "limit": 50
  }'
```

**GET /mcps**
List all registered MCPs and their capabilities.

#### Individual MCPs

Each MCP exposes:
- `GET /health` - Health check
- `GET /mcp/info` - MCP metadata and available tools
- `POST /tools/{toolName}` - Execute a specific tool

## Development

### Running Locally (without Docker)

Each MCP can run standalone:

```bash
# NYC-311 MCP
cd mcps/nyc-311
npm install
NYC_APP_TOKEN=your_token npm start

# NYC-DOB MCP
cd mcps/nyc-dob
npm install
NYC_APP_TOKEN=your_token npm start

# NYC-Property MCP
cd mcps/nyc-property
npm install
NYC_APP_TOKEN=your_token npm start

# Orchestrator
cd orchestrator
npm install
MCP_311_URL=http://localhost:3001 \
MCP_DOB_URL=http://localhost:3002 \
MCP_PROPERTY_URL=http://localhost:3003 \
npm start
```

### Adding a New MCP

1. Create a new directory under `mcps/`
2. Implement the MCP server with standard endpoints
3. Add the MCP to `orchestrator/registry.json`
4. Update `docker-compose.yml`

Example registry entry:

```json
{
  "name": "your-mcp",
  "url": "http://your-mcp:3000",
  "description": "Description of your MCP",
  "capabilities": ["capability1", "capability2"],
  "keywords": ["keyword1", "keyword2"]
}
```

### Project Structure

```
nyc-data-mcp/
├── docker-compose.yml          # Container orchestration
├── .env.example                # Environment template
├── package.json                # Root package config
│
├── mcps/                       # Individual MCP servers
│   ├── nyc-311/
│   │   ├── server.js          # Express server
│   │   ├── package.json
│   │   ├── Dockerfile
│   │   └── tools/             # Tool implementations
│   │       ├── search_complaints.js
│   │       ├── get_response_times.js
│   │       └── analyze_trends.js
│   │
│   ├── nyc-dob/               # Department of Buildings MCP
│   └── nyc-property/          # Property data MCP
│
├── orchestrator/              # MCP Control Layer
│   ├── server.js             # Main orchestrator server
│   ├── registry.json         # MCP capability registry
│   ├── package.json
│   ├── Dockerfile
│   └── routers/
│       ├── query_router.js   # Intelligent query routing
│       └── synthesizer.js    # Multi-source synthesis
│
└── examples/                 # Usage examples
    ├── simple_query.js
    ├── complex_investigation.js
    └── direct_mcp_call.js
```

## How It Works

### 1. Query Routing

The orchestrator analyzes queries using keyword matching and capability scoring:

```javascript
// User query: "Show me construction permits in Brooklyn"

// Router identifies:
// - Keywords: "construction", "permits", "brooklyn"
// - Relevant MCP: nyc-dob
// - Tool: search_permits
// - Parameters: { borough: "BROOKLYN" }
```

### 2. Multi-Source Synthesis

For complex queries, the orchestrator combines data from multiple sources:

```javascript
// User query: "Areas with construction and noise complaints"

// Router selects:
// - nyc-dob: search_violations
// - nyc-311: search_complaints

// Synthesizer finds correlations:
// - Geographic overlap
// - Temporal patterns
// - Causal relationships
```

### 3. Extensibility

The registry-based architecture makes it easy to:
- Add new data sources
- Update routing logic
- Enhance synthesis algorithms
- Build specialized agents

## Data Sources

This project uses NYC Open Data via the Socrata API:

- **311 Service Requests**: [erm2-nwe9](https://data.cityofnewyork.us/resource/erm2-nwe9.json)
- **DOB Violations**: [3h2n-5cm9](https://data.cityofnewyork.us/resource/3h2n-5cm9.json)
- **DOB Job Applications**: [ipu4-2q9a](https://data.cityofnewyork.us/resource/ipu4-2q9a.json)
- **Property Assessments**: [yjxr-fw9i](https://data.cityofnewyork.us/resource/yjxr-fw9i.json)
- **Property Sales**: [usep-8vv5](https://data.cityofnewyork.us/resource/usep-8vv5.json)

## Performance Considerations

- Each MCP caches responses locally (implement Redis for production)
- Orchestrator calls MCPs in parallel for multi-source queries
- Rate limiting on Socrata API (App Token provides higher limits)
- Docker networking minimizes latency between services

## Contributing

Contributions are welcome! Areas for improvement:

- Additional NYC datasets (transit, crime, health, etc.)
- Advanced correlation algorithms
- Caching and performance optimization
- LLM integration for natural language synthesis
- Vector search for semantic routing
- Time-series analysis tools

## License

MIT

## Acknowledgments

- NYC Open Data Portal
- Anthropic's Model Context Protocol
- Socrata Open Data API

---

Built with the Model Context Protocol (MCP) architecture. Each component is independently useful, but together they create an intelligent data ecosystem.