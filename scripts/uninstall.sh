#!/bin/bash

# Mozaic MCP Server - Uninstall Script
# Removes the mozaic MCP server from Claude Desktop configuration

set -e

CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

echo "🔧 Mozaic MCP Server Uninstaller"
echo "================================="
echo ""

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "ℹ️  No Claude Desktop config found at: $CONFIG_FILE"
    echo "   Nothing to uninstall"
    exit 0
fi

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq not found - manual removal required"
    echo ""
    echo "Please manually remove the 'mozaic' entry from:"
    echo "  $CONFIG_FILE"
    echo ""
    exit 0
fi

# Check if mozaic server is configured
if ! jq -e '.mcpServers.mozaic' "$CONFIG_FILE" > /dev/null 2>&1; then
    echo "ℹ️  Mozaic server not found in config"
    echo "   Nothing to uninstall"
    exit 0
fi

# Remove mozaic server
echo "📝 Removing mozaic from Claude Desktop config..."

TEMP_FILE=$(mktemp)
jq 'del(.mcpServers.mozaic)' "$CONFIG_FILE" > "$TEMP_FILE"

# Check if mcpServers is now empty and clean it up
if jq -e '.mcpServers == {}' "$TEMP_FILE" > /dev/null 2>&1; then
    jq 'del(.mcpServers)' "$TEMP_FILE" > "${TEMP_FILE}.2"
    mv "${TEMP_FILE}.2" "$TEMP_FILE"
fi

mv "$TEMP_FILE" "$CONFIG_FILE"

echo "✅ Mozaic MCP server removed from config"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Desktop"
echo "  2. The mozaic tools will no longer be available"
echo ""
echo "To reinstall, run: ./scripts/install.sh"
