#!/bin/bash
# List Mozaic style guide patterns (composed screens), optionally filtered
# Usage: ./list-style-guides.sh [category|all] [site|all]

CATEGORY="${1:-all}"
SITE="${2:-all}"
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
SITE="${SITE//$SQ/$SQ$SQ}"

WHERE="1=1"
[ "$CATEGORY" != "all" ] && WHERE="$WHERE AND category = '$CATEGORY'"
[ "$SITE" != "all" ] && WHERE="$WHERE AND site = '$SITE'"

sqlite3 "$DB_PATH" <<SQL
SELECT json_group_array(json_object(
  'slug', slug, 'name', name, 'category', category, 'site', site,
  'description', description, 'components', json(components)))
FROM (SELECT * FROM style_guides WHERE $WHERE ORDER BY category, name);
SQL
