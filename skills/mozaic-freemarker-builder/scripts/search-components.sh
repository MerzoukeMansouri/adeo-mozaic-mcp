#!/bin/bash
# Search Freemarker components by name or description
QUERY="${1:?Search query required}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, slug, category, description
FROM components
WHERE frameworks LIKE '%freemarker%'
  AND (LOWER(name) LIKE LOWER('%$QUERY%') OR LOWER(description) LIKE LOWER('%$QUERY%'))
ORDER BY name
LIMIT 20;
EOF
