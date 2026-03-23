#!/bin/bash
# List Vue components by category
# Usage: ./list-components.sh [category]
# Categories: form, navigation, feedback, layout, data-display, action, all (default)

CATEGORY="${1:-all}"
DB_PATH="${HOME}/.claude/mozaic.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Query components by category
if [ "$CATEGORY" = "all" ]; then
  sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  category,
  description,
  frameworks
FROM components
WHERE frameworks LIKE '%vue%'
ORDER BY category, name;
EOF
else
  sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  category,
  description,
  frameworks
FROM components
WHERE frameworks LIKE '%vue%'
  AND category = '$CATEGORY'
ORDER BY name;
EOF
fi
