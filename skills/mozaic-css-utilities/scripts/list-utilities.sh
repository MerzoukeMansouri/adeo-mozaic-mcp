#!/bin/bash
# List CSS utilities by category
# Usage: ./list-utilities.sh [category]
# Categories: layout, utility, all (default)

CATEGORY="${1:-all}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
  exit 1
fi

# Query utilities by category
if [ "$CATEGORY" = "all" ]; then
  sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  category,
  description
FROM css_utilities
ORDER BY category, name;
EOF
else
  sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  category,
  description
FROM css_utilities
WHERE category = '$CATEGORY'
ORDER BY name;
EOF
fi
