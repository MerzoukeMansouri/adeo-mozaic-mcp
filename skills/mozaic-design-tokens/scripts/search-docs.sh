#!/bin/bash
# Search Mozaic documentation for styling guidance
# Usage: ./search-docs.sh <query> [limit]

QUERY="$1"
LIMIT="${2:-5}"
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
[[ "$LIMIT" =~ ^[0-9]+$ ]] || LIMIT="5"

if [ -z "$QUERY" ]; then
  echo "Error: Search query required"
  echo "Usage: $0 <query> [limit]"
  exit 1
fi

# Search documentation entries
sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  title,
  content,
  category,
  path
FROM documentation
WHERE title LIKE '%$QUERY%'
   OR content LIKE '%$QUERY%'
   OR category LIKE '%$QUERY%'
ORDER BY
  CASE
    WHEN title LIKE '%$QUERY%' THEN 1
    WHEN category LIKE '%$QUERY%' THEN 2
    ELSE 3
  END
LIMIT $LIMIT;
EOF
