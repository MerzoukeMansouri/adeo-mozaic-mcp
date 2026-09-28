#!/bin/bash
# Search Freemarker components by name or description
QUERY="${1:?Search query required}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
fi

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, slug, category, description
FROM components
WHERE frameworks LIKE '%freemarker%'
  AND (LOWER(name) LIKE LOWER('%$QUERY%') OR LOWER(description) LIKE LOWER('%$QUERY%'))
ORDER BY name
LIMIT 20;
EOF
