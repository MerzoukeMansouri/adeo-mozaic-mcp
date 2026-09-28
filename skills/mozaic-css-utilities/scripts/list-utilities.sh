#!/bin/bash
# List CSS utilities by category
# Usage: ./list-utilities.sh [category]
# Categories: layout, utility, all (default)

CATEGORY="${1:-all}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
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
