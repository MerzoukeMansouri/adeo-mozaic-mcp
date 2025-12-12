#!/bin/bash

# Mozaic MCP Server - Install Script
# Adds the mozaic MCP server to Claude Desktop configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

echo "🔧 Mozaic MCP Server Installer"
echo "==============================="
echo ""

# Check if dist/index.js exists
if [ ! -f "$PROJECT_DIR/dist/index.js" ]; then
    echo "❌ Error: dist/index.js not found"
    echo "   Run 'pnpm build' first to compile the server"
    exit 1
fi

# Check if database exists
if [ ! -f "$PROJECT_DIR/data/mozaic.db" ]; then
    echo "⚠️  Warning: Database not found at data/mozaic.db"
    echo "   Run 'pnpm build:index' to build the database"
    echo ""
fi

# Create config directory if it doesn't exist
if [ ! -d "$CONFIG_DIR" ]; then
    echo "📁 Creating Claude config directory..."
    mkdir -p "$CONFIG_DIR"
fi

# Create or update config file
if [ ! -f "$CONFIG_FILE" ]; then
    echo "📝 Creating new Claude Desktop config..."
    cat > "$CONFIG_FILE" << EOF
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": ["$PROJECT_DIR/dist/index.js"]
    }
  }
}
EOF
    echo "✅ Config created at: $CONFIG_FILE"
else
    echo "📝 Updating existing Claude Desktop config..."

    # Check if jq is available
    if command -v jq &> /dev/null; then
        # Use jq for proper JSON manipulation
        TEMP_FILE=$(mktemp)

        # Check if mozaic server already exists
        if jq -e '.mcpServers.mozaic' "$CONFIG_FILE" > /dev/null 2>&1; then
            echo "⚠️  Mozaic server already configured, updating..."
        fi

        # Add or update mozaic server
        jq --arg path "$PROJECT_DIR/dist/index.js" \
           '.mcpServers.mozaic = {"command": "node", "args": [$path]}' \
           "$CONFIG_FILE" > "$TEMP_FILE"

        mv "$TEMP_FILE" "$CONFIG_FILE"
        echo "✅ Config updated successfully"
    else
        echo "⚠️  jq not found - manual configuration required"
        echo ""
        echo "Add the following to your Claude Desktop config:"
        echo "  File: $CONFIG_FILE"
        echo ""
        echo '  "mcpServers": {'
        echo '    "mozaic": {'
        echo '      "command": "node",'
        echo "      \"args\": [\"$PROJECT_DIR/dist/index.js\"]"
        echo '    }'
        echo '  }'
        echo ""
        exit 0
    fi
fi

echo ""
echo "🎉 Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Desktop"
echo "  2. The 'mozaic' MCP server should now be available"
echo ""
echo "Available tools:"
echo "  • get_design_tokens  - Get color, typography, spacing tokens"
echo "  • get_component_info - Get component props, slots, events"
echo "  • list_components    - List all Mozaic components"
echo "  • generate_component - Generate Vue/React/HTML code"
echo "  • search_documentation - Search Mozaic docs"
