#!/bin/bash
# List Freemarker components by category
CATEGORY="${1:-all}"
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
CATEGORY="${CATEGORY//$SQ/$SQ$SQ}"
[ "$CATEGORY" = "all" ] && CATEGORY=""

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, slug, category, description
FROM components
WHERE frameworks LIKE '%freemarker%'
${CATEGORY:+AND category = '$CATEGORY'}
ORDER BY category, name;
EOF
