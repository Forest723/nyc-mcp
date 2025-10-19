# NYC MCP Setup Guide

Complete setup guide for the NYC Data MCP ecosystem. This guide covers installation for both developers and end users.

## Table of Contents
- [Quick Start](#quick-start)
- [Detailed Setup](#detailed-setup)
- [Configuration Options](#configuration-options)
- [Troubleshooting](#troubleshooting)
- [For Contributors](#for-contributors)

## Quick Start

**For end users who just want to use it:**

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd nyc-data-mcp

# 2. Copy and configure environment
cp .env.example .env
# Edit .env and add your NYC Open Data API keys

# 3. Start services
docker compose up -d --build

# 4. Install MCP for Claude
./install-mcp.sh
```

That's it! You can now use NYC data queries in Claude Desktop or Claude Code.

## Detailed Setup

### Prerequisites

1. **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
2. **Node.js v20+** - [Download](https://nodejs.org/)
3. **NYC Open Data API Tokens** - [Get Free Tokens](https://data.cityofnewyork.us/profile/app_tokens)
4. **Claude Desktop or Claude Code** - [Download Claude](https://claude.ai/)

### Step 1: Get API Tokens

1. Go to [NYC Open Data](https://data.cityofnewyork.us/)
2. Create a free account
3. Navigate to your profile → App Tokens
4. Create a new app token
5. Copy the token for use in `.env`

### Step 2: Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` and add your API tokens:

```bash
# Required for all services
NYC_311_PRIMARY_API_KEY=your_token_here
HPD_DATAFEED_PRIMARY_API_KEY=your_token_here
EVENT_CALENDAR_PRIMARY_API_KEY=your_token_here
DOT_PRIMARY_API_KEY=your_token_here
COMPTROLLER_CHECKBOOK_PRIMARY_API_KEY=your_token_here

# Optional: Secondary keys for failover
NYC_311_SECONDARY_API_KEY=another_token
HPD_DATAFEED_SECONDARY_API_KEY=another_token
# ... etc
```

**Pro tip:** You can use the same API token for all services if you want to keep it simple.

### Step 3: Start Docker Services

```bash
# Start all services in background
docker compose up -d --build

# Verify all services are healthy
docker ps

# Check orchestrator health
curl http://localhost:4000/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "nyc-mcp-orchestrator",
  "registered_mcps": 5
}
```

### Step 4: Configure Claude

Run the interactive installer:

```bash
./install-mcp.sh
```

**Options:**
1. **Claude Desktop** - Configure the macOS/Windows app
2. **Claude Code** - Configure the CLI tool
3. **Both** - Configure both clients
4. **Skip** - Show config only (for manual setup)

### Step 5: Restart Claude

- **Claude Desktop**: Quit and reopen the app
- **Claude Code**: Just start a new session

### Step 6: Test It!

In Claude, try:
```
What are the most common 311 complaints in Manhattan?
```

## Configuration Options

### Architecture Overview

```
┌─────────────────────────────────────────┐
│  Claude Desktop / Claude Code           │
│  (Your conversational interface)        │
└───────────────┬─────────────────────────┘
                │
                │ stdio (MCP Protocol)
                ▼
┌─────────────────────────────────────────┐
│  MCP Wrapper (mcp-orchestrator-wrapper) │
│  Translates MCP ←→ HTTP                 │
└───────────────┬─────────────────────────┘
                │
                │ HTTP
                ▼
┌─────────────────────────────────────────┐
│  Orchestrator (Docker Container)        │
│  Routes queries, synthesizes results    │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┬───────┬────────┐
        ▼               ▼       ▼        ▼
    ┌──────┐      ┌──────┐  ┌──────┐  ┌──────┐
    │ 311  │      │ HPD  │  │Events│  │ DOT  │
    │ MCP  │      │ MCP  │  │ MCP  │  │ MCP  │
    └──┬───┘      └──┬───┘  └──┬───┘  └──┬───┘
       │             │         │         │
       ▼             ▼         ▼         ▼
    NYC Open Data API (Socrata)
```

### Manual Configuration

If you prefer not to use the install script:

**Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": ["/full/path/to/nyc-mcp/mcp-wrappers/mcp-orchestrator-wrapper.js"],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
```

**Claude Code** (`~/.config/claude/config.json`):
```json
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": ["/full/path/to/nyc-mcp/mcp-wrappers/mcp-orchestrator-wrapper.js"],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
```

### Port Configuration

Default ports (can be changed in `.env`):

| Service | Port | Environment Variable |
|---------|------|---------------------|
| Orchestrator | 4000 | `ORCHESTRATOR_PORT` |
| 311 MCP | 3001 | `MCP_311_PORT` |
| HPD MCP | 3002 | `MCP_HPD_PORT` |
| Events MCP | 3003 | `MCP_EVENTS_PORT` |
| DOT MCP | 3004 | `MCP_DOT_PORT` |
| Comptroller | 3005 | `MCP_COMPTROLLER_PORT` |

## Troubleshooting

### MCP Server Not Showing Up in Claude

**Check 1: Verify Docker containers are running**
```bash
docker ps
```
All containers should show `(healthy)` status.

**Check 2: Test orchestrator directly**
```bash
curl http://localhost:4000/health
```

**Check 3: Verify MCP wrapper**
```bash
cd mcp-wrappers
npm install
node mcp-orchestrator-wrapper.js
# Should wait for stdin, press Ctrl+C to exit
```

**Check 4: Check Claude config**
```bash
# For Claude Code
cat ~/.config/claude/config.json

# For Claude Desktop
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Check 5: Restart Claude**
- Claude Desktop: Quit and reopen
- Claude Code: Start new session

### Docker Containers Not Starting

**Missing package-lock.json errors:**
```bash
# This happens on first build
# Run npm install in each service first
cd mcps/nyc-311 && npm install
cd ../nyc-hpd && npm install
# ... etc
```

Or just run:
```bash
find mcps orchestrator diagnostic-agent -name package.json -execdir npm install \;
```

**Port conflicts:**
```bash
# Check if ports are already in use
lsof -i :4000
lsof -i :3001-3005

# Kill conflicting processes or change ports in .env
```

### API Rate Limiting

If you're hitting rate limits:

1. **Get an app token** - Much higher rate limits than anonymous
2. **Add secondary tokens** - Automatic failover
3. **Reduce query frequency** - Add caching if needed

### Connection Refused Errors

**From MCP wrapper to orchestrator:**
```bash
# Make sure Docker is running
docker ps

# Check orchestrator logs
docker logs nyc-mcp-orchestrator

# Verify network connectivity
curl http://localhost:4000/health
```

**From orchestrator to MCP services:**
```bash
# Check individual service logs
docker logs nyc-mcp-311
docker logs nyc-mcp-hpd
# etc.

# Verify Docker network
docker network inspect nyc-mcp-network
```

## For Contributors

### Development Setup

```bash
# Clone with development branches
git clone <repo-url>
cd nyc-data-mcp
git checkout develop

# Install all dependencies
npm install
cd mcps/nyc-311 && npm install && cd ../..
cd mcps/nyc-hpd && npm install && cd ../..
cd orchestrator && npm install && cd ..
cd mcp-wrappers && npm install && cd ..

# Start in development mode (without Docker)
# Terminal 1: Start orchestrator
cd orchestrator && npm start

# Terminal 2-6: Start individual MCPs
cd mcps/nyc-311 && npm start
# etc.

# Terminal 7: Start MCP wrapper
cd mcp-wrappers && npm run orchestrator
```

### Testing

```bash
# Test orchestrator health
curl http://localhost:4000/health

# Test query routing
curl -X POST http://localhost:4000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What are noise complaints in Brooklyn?"}'

# Test individual MCP
curl -X POST http://localhost:3001/tools/search_complaints \
  -H "Content-Type: application/json" \
  -d '{"borough": "BROOKLYN", "limit": 10}'

# Test MCP wrapper
cd mcp-wrappers
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node mcp-orchestrator-wrapper.js
```

### Adding New Data Sources

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Creating new MCP servers
- Adding to the registry
- Updating routing logic
- Writing tests

## Support

- **Issues**: [GitHub Issues](your-repo/issues)
- **Discussions**: [GitHub Discussions](your-repo/discussions)
- **NYC Open Data Help**: [NYC OpenData Support](https://opendata.cityofnewyork.us/)

## License

MIT License - see [LICENSE](LICENSE) for details
