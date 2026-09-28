#!/bin/bash
# Search Mozaic icons by name, type, or size
# Usage: ./search-icons.sh <query> [type] [size] [limit]

QUERY="$1"
TYPE="$2"
SIZE="$3"
LIMIT="${4:-20}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
fi
# Arguments end up in SQL: escape single quotes, keep numbers numeric
SQ="'"
QUERY="${QUERY//$SQ/$SQ$SQ}"
TYPE="${TYPE//$SQ/$SQ$SQ}"
[[ "$SIZE" =~ ^[0-9]+$ ]] || SIZE=""
[[ "$LIMIT" =~ ^[0-9]+$ ]] || LIMIT="20"

if [ -z "$QUERY" ]; then
  echo "Error: Search query required"
  echo "Usage: $0 <query> [type] [size] [limit]"
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
