#!/bin/bash
# Get detailed Freemarker component information
COMPONENT="${1:?Component name required}"
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
