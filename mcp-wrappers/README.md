# NYC MCP Wrappers for Claude Code

These MCP wrappers allow Claude Code to communicate with your Docker-based NYC data services.

## Setup Instructions

### 1. Ensure Docker Services are Running

```bash
cd /Users/forestcoon/Desktop/projects/nyc-mcp
docker compose up -d
```

Verify services are healthy:
```bash
docker ps
```

### 2. Configure Claude Code

You need to add the MCP server configuration to Claude Code's settings. Here's how:

#### For Claude Code VSCode Extension:

1. Open VSCode Settings (Cmd+,)
2. Search for "Claude Code: MCP Servers"
3. Click "Edit in settings.json"
4. Add the following configuration:

```json
{
  "claude-code.mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": [
        "/Users/forestcoon/Desktop/projects/nyc-mcp/mcp-wrappers/mcp-orchestrator-wrapper.js"
      ],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
```

#### Alternative: Use the Command Line

You can also add the server using the Claude MCP command-line tool:

```bash
claude mcp add nyc-orchestrator node /Users/forestcoon/Desktop/projects/nyc-mcp/mcp-wrappers/mcp-orchestrator-wrapper.js
```

### 3. Restart Claude Code

After adding the configuration, restart VSCode or reload the Claude Code extension.

## Usage

Once configured, you can use the NYC data tools in Claude Code conversations:

**Example prompts:**
- "Use the nyc-orchestrator to query noise complaints in Brooklyn"
- "What 311 data sources are available?"
- "Show me construction activity in Manhattan using the NYC MCP"

## Available Tools

### `query_nyc_data`
Query NYC data across all available sources. The orchestrator automatically routes your question to the appropriate data sources.

**Parameters:**
- `query` (required): Natural language query
- `context` (optional): Additional context
  - `borough`: NYC borough name
  - `days`: Number of days to look back
  - `limit`: Maximum results

**Example:**
```json
{
  "query": "What are the most common noise complaints in Brooklyn?",
  "context": {
    "borough": "BROOKLYN",
    "days": 30,
    "limit": 100
  }
}
```

### `list_available_mcps`
List all available MCP data sources and their capabilities.

## Available Data Sources

Your system includes these data sources:
- **NYC-311**: Service requests, complaints, response times
- **HPD**: Housing Preservation & Development data
- **Events**: NYC events calendar
- **DOT**: Department of Transportation data
- **Comptroller**: NYC Comptroller financial data

## Troubleshooting

### MCP Server Not Showing Up

1. Check Docker containers are running:
   ```bash
   docker ps
   ```

2. Test orchestrator directly:
   ```bash
   curl http://localhost:4000/health
   ```

3. Check Claude Code logs for errors

### Connection Errors

Make sure:
- Docker containers are running and healthy
- Ports 3001-3005 and 4000 are accessible
- Node.js is installed and in your PATH

### Verify MCP Wrapper

Test the wrapper standalone:
```bash
cd /Users/forestcoon/Desktop/projects/nyc-mcp/mcp-wrappers
echo '{"method":"tools/list"}' | node mcp-orchestrator-wrapper.js
```

## Adding Individual MCP Servers

If you want to add individual data sources instead of just the orchestrator, you can create wrappers for each:

- `mcp-311-wrapper.js` - NYC 311 service requests
- `mcp-hpd-wrapper.js` - Housing data
- `mcp-events-wrapper.js` - NYC events
- `mcp-dot-wrapper.js` - Transportation data
- `mcp-comptroller-wrapper.js` - Financial data

Let me know if you need these individual wrappers created!
