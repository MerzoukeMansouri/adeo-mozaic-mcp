#!/bin/bash
# Get detailed information about a Web Component
# Usage: ./get-component.sh <component-slug>

COMPONENT_SLUG="$1"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
fi

if [ -z "$COMPONENT_SLUG" ]; then
  echo "Error: Component slug required"
  echo "Usage: $0 <component-slug>"
  echo "Example: $0 button"
  exit 1
fi

COMPONENT_INFO=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT * FROM components
WHERE slug = '$COMPONENT_SLUG'
  AND frameworks LIKE '%webcomponents%'
LIMIT 1;
EOF
)

if [ -z "$COMPONENT_INFO" ] || [ "$COMPONENT_INFO" = "[]" ]; then
  echo "Error: Web Component '$COMPONENT_SLUG' not found"
  exit 1
fi

PROPS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, type, default_value, required, description
FROM component_props
WHERE component_id = (
  SELECT id FROM components WHERE slug = '$COMPONENT_SLUG' AND frameworks LIKE '%webcomponents%'
)
ORDER BY required DESC, name;
EOF
)
PROPS="${PROPS:-[]}"

SLOTS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, description
FROM component_slots
WHERE component_id = (
  SELECT id FROM components WHERE slug = '$COMPONENT_SLUG' AND frameworks LIKE '%webcomponents%'
)
ORDER BY name;
EOF
)
SLOTS="${SLOTS:-[]}"

EVENTS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT name, payload, description
FROM component_events
WHERE component_id = (
  SELECT id FROM components WHERE slug = '$COMPONENT_SLUG' AND frameworks LIKE '%webcomponents%'
)
ORDER BY name;
EOF
)
EVENTS="${EVENTS:-[]}"

EXAMPLES=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT title, code, description
FROM component_examples
WHERE component_id = (
  SELECT id FROM components WHERE slug = '$COMPONENT_SLUG' AND frameworks LIKE '%webcomponents%'
)
  AND framework = 'webcomponents'
ORDER BY id;
EOF
)
EXAMPLES="${EXAMPLES:-[]}"

CSS_CLASSES=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT class_name
FROM component_css_classes
WHERE component_id = (
  SELECT id FROM components WHERE slug = '$COMPONENT_SLUG' AND frameworks LIKE '%webcomponents%'
)
ORDER BY class_name;
EOF
)
CSS_CLASSES="${CSS_CLASSES:-[]}"

cat <<EOF
{
  "component": $COMPONENT_INFO,
  "attributes": $PROPS,
  "slots": $SLOTS,
  "events": $EVENTS,
  "examples": $EXAMPLES,
  "cssProperties": $CSS_CLASSES
}
EOF
