#!/bin/bash
# Generate Vue 3 component code
# Usage: ./generate-component.sh <component-name> [props-json]

COMPONENT_NAME="$1"
PROPS_JSON="${2:-{}}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Component name required"
  echo "Usage: $0 <component-name> [props-json]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
  exit 1
fi

# Verify component exists
COMPONENT_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM components WHERE name = '$COMPONENT_NAME' AND frameworks LIKE '%vue%'")

if [ "$COMPONENT_EXISTS" = "0" ]; then
  echo "Error: Component '$COMPONENT_NAME' not found"
  exit 1
fi

# Build props string from examples (use first example as base)
FIRST_EXAMPLE=$(sqlite3 "$DB_PATH" <<EOF
.mode list
SELECT code FROM component_examples
WHERE component_id = (
  SELECT id FROM components
  WHERE name = '$COMPONENT_NAME'
    AND frameworks LIKE '%vue%'
)
ORDER BY id LIMIT 1;
EOF
)

# Generate component code
if [ -n "$FIRST_EXAMPLE" ]; then
  CODE="<${COMPONENT_NAME}\n  ${FIRST_EXAMPLE}\n/>"
else
  CODE="<${COMPONENT_NAME} />"
fi

cat <<EOF
{
  "component": "$COMPONENT_NAME",
  "framework": "vue",
  "code": $(printf '%s' "$CODE" | jq -Rs .),
  "import": "import { ${COMPONENT_NAME} } from '@mozaic-ds/vue-3'",
  "cssImport": "import '@mozaic-ds/vue-3/dist/style.css'"
}
EOF
