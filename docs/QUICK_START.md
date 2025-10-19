# NYC MCP - Quick Start (2 Minutes)

Get NYC data in Claude with 4 commands.

## Installation

```bash
# 1. Clone
git clone <your-repo-url>
cd nyc-mcp

# 2. Configure (add your API key from data.cityofnewyork.us)
cp .env.example .env
nano .env  # or your preferred editor

# 3. Start services
docker compose up -d --build

# 4. Install for Claude
./install-mcp.sh
```

Select option 2 for Claude Code, or option 1 for Claude Desktop.

Restart Claude, then ask:
```
What are the most common 311 complaints in Manhattan?
```

## What You Just Installed

- **5 Data Sources**: 311, Housing, Events, Transportation, Finance
- **1 Orchestrator**: Automatically routes queries to right sources
- **1 MCP Wrapper**: Connects Claude to your local data services

## Architecture

```
Claude ←→ MCP Wrapper ←→ Orchestrator ←→ 5 Data MCPs ←→ NYC Open Data
```

Everything runs locally in Docker containers.

## Commands

```bash
# View running services
docker ps

# Check health
curl http://localhost:4000/health

# Stop services
docker compose down

# Start services
docker compose up -d

# View logs
docker logs nyc-mcp-orchestrator
```

## Example Queries in Claude

```
What noise complaints happened in Brooklyn last week?

Show me housing violations and 311 complaints in the same neighborhoods

What events are happening this weekend?

Compare traffic patterns and street closures in Manhattan

Analyze city spending on transportation projects
```

## Troubleshooting

**MCP not showing in Claude?**
```bash
# Restart Claude completely (Quit & Reopen)
# Verify config
cat ~/.config/claude/config.json  # Claude Code
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json  # Claude Desktop
```

**Docker errors?**
```bash
docker compose down -v
docker compose up -d --build
```

**API errors?**
```bash
# Make sure you added API keys to .env
cat .env | grep API_KEY
```

## Learn More

- Full docs: [README.md](README.md)
- Detailed setup: [SETUP.md](SETUP.md)
- API reference: [docs/](docs/)

## Get API Keys

Free NYC Open Data API keys: https://data.cityofnewyork.us/profile/app_tokens

You can use the same key for all services.
