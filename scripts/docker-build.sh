#!/bin/bash

# Docker Build Helper Script for Mozaic MCP Server
# This script prepares the database and builds the Docker image

set -e

echo "🚀 Starting Docker build for Mozaic MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if database exists in home directory
SOURCE_DB="$HOME/.claude/mozaic.db"
LOCAL_DB="./mozaic.db"

if [ -f "$SOURCE_DB" ]; then
    echo -e "${GREEN}✓${NC} Found database at $SOURCE_DB"

    # Copy database to build context
    cp "$SOURCE_DB" "$LOCAL_DB"
    echo -e "${GREEN}✓${NC} Copied database to build context"
else
    echo -e "${YELLOW}⚠${NC} Database not found at $SOURCE_DB"
    echo "  Looking for existing database in project..."

    if [ -f "$LOCAL_DB" ]; then
        echo -e "${GREEN}✓${NC} Using existing database in project directory"
    else
        echo -e "${RED}✗${NC} No database found. Please ensure mozaic.db exists."
        echo "  Run 'pnpm build' first to generate the database."
        exit 1
    fi
fi

# Build Docker image
echo "🔨 Building Docker image..."
docker build -t mozaic-mcp-server:latest .

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Docker image built successfully!"
    echo ""
    echo "📦 Image: mozaic-mcp-server:latest"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Create .env file from .env.example"
    echo "  2. Run with docker-compose:"
    echo "     docker-compose up -d"
    echo "  3. Or run directly:"
    echo "     docker run -p 3000:3000 -e AUTH_TOKEN=your-token mozaic-mcp-server:latest"
    echo ""
    echo "🌐 Endpoints:"
    echo "  - Health: http://localhost:3000/health"
    echo "  - API Docs: http://localhost:3000/api"
    echo "  - MCP: http://localhost:3000/mcp (requires auth)"
else
    echo -e "${RED}✗${NC} Docker build failed!"
    exit 1
fi