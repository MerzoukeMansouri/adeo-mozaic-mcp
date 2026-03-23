#!/bin/bash
# List React components by category
# Usage: ./list-components.sh [category]
# Categories: form, navigation, feedback, layout, data-display, action, all (default)

CATEGORY="${1:-all}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
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
WHERE frameworks LIKE '%react%'
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
WHERE frameworks LIKE '%react%'
  AND category = '$CATEGORY'
ORDER BY name;
EOF
fi
