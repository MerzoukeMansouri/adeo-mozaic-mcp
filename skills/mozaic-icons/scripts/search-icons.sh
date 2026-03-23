#!/bin/bash
# Search Mozaic icons by name, type, or size
# Usage: ./search-icons.sh <query> [type] [size] [limit]

QUERY="$1"
TYPE="$2"
SIZE="$3"
LIMIT="${4:-20}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$QUERY" ]; then
  echo "Error: Search query required"
  echo "Usage: $0 <query> [type] [size] [limit]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

WHERE_CLAUSE="name LIKE '%$QUERY%'"
if [ -n "$TYPE" ]; then
  WHERE_CLAUSE="$WHERE_CLAUSE AND type = '$TYPE'"
fi
if [ -n "$SIZE" ]; then
  WHERE_CLAUSE="$WHERE_CLAUSE AND size = $SIZE"
fi

RESULT=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, icon_name, type, size, view_box
FROM icons
WHERE $WHERE_CLAUSE
ORDER BY
  CASE
    WHEN name LIKE '$QUERY%' THEN 1
    WHEN name LIKE '%$QUERY' THEN 2
    ELSE 3
  END,
  type, size
LIMIT $LIMIT;
EOF
)

echo "${RESULT:-[]}"
