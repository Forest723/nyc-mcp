#!/bin/bash

# NYC MCP Installation Script
# This script configures the NYC MCP servers for Claude Desktop or Claude Code

set -e

echo "🗽 NYC MCP Installation Script"
echo "=============================="
echo ""

# Get the absolute path to this script's directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
MCP_WRAPPER_PATH="$SCRIPT_DIR/mcp-wrappers/mcp-orchestrator-wrapper.js"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"

# Install dependencies
echo ""
echo "📦 Installing MCP wrapper dependencies..."
cd "$SCRIPT_DIR/mcp-wrappers"
npm install
echo "✓ Dependencies installed"

# Detect which Claude client to configure
echo ""
echo "Which Claude client do you want to configure?"
echo "1) Claude Desktop (macOS app)"
echo "2) Claude Code (CLI tool)"
echo "3) Both"
echo "4) Skip (just show me the config)"
read -p "Enter choice (1-4): " choice

configure_claude_desktop() {
    local config_dir="$HOME/Library/Application Support/Claude"
    local config_file="$config_dir/claude_desktop_config.json"

    echo ""
    echo "Configuring Claude Desktop..."

    # Create directory if it doesn't exist
    mkdir -p "$config_dir"

    # Create or update config
    if [ -f "$config_file" ]; then
        echo "⚠️  Config file already exists at: $config_file"
        read -p "Do you want to backup and replace it? (y/n): " backup
        if [ "$backup" = "y" ]; then
            cp "$config_file" "$config_file.backup.$(date +%Y%m%d_%H%M%S)"
            echo "✓ Backup created"
        fi
    fi

    cat > "$config_file" << EOF
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": [
        "$MCP_WRAPPER_PATH"
      ],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
EOF

    echo "✓ Claude Desktop configured at: $config_file"
    echo "  Please restart Claude Desktop for changes to take effect"
}

configure_claude_code() {
    local config_dir="$HOME/.config/claude"
    local config_file="$config_dir/config.json"

    echo ""
    echo "Configuring Claude Code..."

    # Create directory if it doesn't exist
    mkdir -p "$config_dir"

    # Create or update config
    if [ -f "$config_file" ]; then
        echo "⚠️  Config file already exists at: $config_file"
        read -p "Do you want to backup and replace it? (y/n): " backup
        if [ "$backup" = "y" ]; then
            cp "$config_file" "$config_file.backup.$(date +%Y%m%d_%H%M%S)"
            echo "✓ Backup created"
        fi
    fi

    cat > "$config_file" << EOF
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": [
        "$MCP_WRAPPER_PATH"
      ],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
EOF

    echo "✓ Claude Code configured at: $config_file"
}

show_config_only() {
    echo ""
    echo "📋 Configuration for Claude Desktop/Code:"
    echo "==========================================="
    echo ""
    cat << EOF
{
  "mcpServers": {
    "nyc-orchestrator": {
      "command": "node",
      "args": [
        "$MCP_WRAPPER_PATH"
      ],
      "env": {
        "ORCHESTRATOR_URL": "http://localhost:4000"
      }
    }
  }
}
EOF
    echo ""
    echo "Claude Desktop location: ~/Library/Application Support/Claude/claude_desktop_config.json"
    echo "Claude Code location: ~/.config/claude/config.json"
}

case $choice in
    1)
        configure_claude_desktop
        ;;
    2)
        configure_claude_code
        ;;
    3)
        configure_claude_desktop
        configure_claude_code
        ;;
    4)
        show_config_only
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Start your Docker containers: docker compose up -d"
echo "2. Verify services are running: docker ps"
echo "3. Test the connection: curl http://localhost:4000/health"
if [ "$choice" = "1" ] || [ "$choice" = "3" ]; then
    echo "4. Restart Claude Desktop"
fi
echo ""
echo "You can now use NYC MCP in Claude!"
echo "Try asking: 'What 311 complaints are happening in Brooklyn?'"
