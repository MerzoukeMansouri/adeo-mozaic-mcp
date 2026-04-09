#!/bin/bash
# Search Web Components by name or description
# Usage: ./search-components.sh <query>

QUERY="$1"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$QUERY" ]; then
  echo "Error: Search query required"
  echo "Usage: $0 <query>"
  echo "Example: $0 button"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
  exit 1
fi

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, slug, category, description
FROM components
WHERE frameworks LIKE '%webcomponents%'
  AND (
    name LIKE '%$QUERY%'
    OR slug LIKE '%$QUERY%'
    OR description LIKE '%$QUERY%'
    OR category LIKE '%$QUERY%'
  )
ORDER BY name
LIMIT 20;
EOF
