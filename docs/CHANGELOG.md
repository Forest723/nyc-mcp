# Changelog

## [2.0.0] - Simplified Architecture

### Changed
- **MAJOR REFACTOR**: Simplified from Docker-based microservices to single Node.js MCP server
- Project now follows standard MCP architecture used by professional projects
- Single `index.js` file handles all MCP protocol communication
- Direct stdio communication with Claude (no HTTP wrapper needed)

### Removed
- ❌ Docker Compose and all Dockerfiles
- ❌ Orchestrator service (query routing/synthesis)
- ❌ MCP wrappers (stdio ↔ HTTP bridge)
- ❌ Diagnostic agent
- ❌ Individual server.js files in each MCP directory
- ❌ Environment variable configuration
- ❌ Complex multi-container networking
- ❌ ~30+ files of infrastructure code

### Added
- ✅ Single `index.js` MCP server
- ✅ Simplified package.json with 2 dependencies
- ✅ Clean README focused on actual usage
- ✅ Updated SETUP.md guide

### Benefits
- **90% reduction in complexity**
- **Zero Docker dependencies** - just Node.js
- **Standard MCP pattern** - matches other professional MCP servers
- **Easier to understand** - one entry point
- **Faster to start** - no container build/startup time
- **Easier to debug** - direct process, no container layers

### Migration Guide

**Old way (v1.0):**
```json
{
  "mcpServers": {
    "nyc-orchestrator": {
      "type": "http",
      "url": "http://localhost:18000/mcp/v1"
    }
  }
}
```

Required: Docker Compose, 6 containers, orchestrator, wrapper

**New way (v2.0):**
```json
{
  "mcpServers": {
    "nyc-open-data": {
      "command": "node",
      "args": ["/path/to/nyc-mcp/index.js"]
    }
  }
}
```

Required: Node.js, that's it

### What's Kept
- ✅ All 311 tool implementations (search, trends, response times, health)
- ✅ Tool code in `mcps/nyc-311/tools/`
- ✅ Socrata API integration
- ✅ Package structure for other data sources (HPD, Events, DOT, Comptroller)
- ✅ License and documentation

### Technical Details

**Before:**
- 6 Docker containers
- HTTP REST API per data source
- Orchestrator for query routing
- MCP wrapper for protocol translation
- Complex port management (18000-18005)
- Environment variable configuration
- ~500 lines of docker-compose.yml
- ~200 lines of wrapper code
- ~300 lines of orchestrator logic

**After:**
- 1 Node.js process
- Direct MCP protocol (stdio)
- ~200 lines in index.js
- Zero configuration files

### Notes

The Docker-based architecture was an interesting exploration of microservices, but it didn't match how Claude expects to communicate with MCP servers. Professional MCP projects use simple stdio-based servers, which is what we've implemented in v2.0.

If you need an HTTP API for custom applications, you can still build that separately - but for Claude integration, the simple approach is better.
