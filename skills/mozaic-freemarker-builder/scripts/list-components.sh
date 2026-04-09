#!/bin/bash
# List Freemarker components by category
CATEGORY="${1:-all}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, slug, category, description
FROM components
WHERE frameworks LIKE '%freemarker%'
${CATEGORY:+AND category = '$CATEGORY'}
ORDER BY category, name;
EOF
