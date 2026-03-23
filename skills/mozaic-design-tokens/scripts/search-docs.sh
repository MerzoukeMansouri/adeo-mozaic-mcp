#!/bin/bash
# Search Mozaic documentation for styling guidance
# Usage: ./search-docs.sh <query> [limit]

QUERY="$1"
LIMIT="${2:-5}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$QUERY" ]; then
  echo "Error: Search query required"
  echo "Usage: $0 <query> [limit]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
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
