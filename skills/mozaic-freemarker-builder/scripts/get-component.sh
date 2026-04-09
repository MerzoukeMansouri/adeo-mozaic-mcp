#!/bin/bash
# Get detailed Freemarker component information
COMPONENT="${1:?Component name required}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  c.name,
  c.slug,
  c.category,
  c.description,
  json_group_array(
    json_object(
      'name', p.name,
      'type', p.type,
      'required', p.required,
      'default', p.default_value,
      'description', p.description
    )
  ) as props
FROM components c
LEFT JOIN component_props p ON p.component_id = c.id
WHERE c.frameworks LIKE '%freemarker%'
  AND (LOWER(c.slug) LIKE LOWER('%$COMPONENT%') OR LOWER(c.name) LIKE LOWER('%$COMPONENT%'))
GROUP BY c.id
LIMIT 1;
EOF
