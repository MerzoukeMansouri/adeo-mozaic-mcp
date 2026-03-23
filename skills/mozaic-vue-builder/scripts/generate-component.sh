#!/bin/bash
# Generate Vue 3 component code
# Usage: ./generate-component.sh <component-name> [props-json]

COMPONENT_NAME="$1"
PROPS_JSON="${2:-{}}"
DB_PATH="${HOME}/.claude/mozaic.db"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Component name required"
  echo "Usage: $0 <component-name> [props-json]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Get component template
TEMPLATE=$(sqlite3 "$DB_PATH" <<EOF
.mode list
SELECT template FROM components
WHERE name = '$COMPONENT_NAME'
  AND frameworks LIKE '%vue%'
LIMIT 1;
EOF
)

if [ -z "$TEMPLATE" ]; then
  echo "Error: Component '$COMPONENT_NAME' not found or has no template"
  exit 1
fi

# For now, return the basic template
# In a full implementation, this would merge props-json with the template
cat <<EOF
{
  "component": "$COMPONENT_NAME",
  "framework": "vue",
  "code": $(echo "$TEMPLATE" | jq -Rs .),
  "import": "import { M${COMPONENT_NAME} } from '@mozaic-ds/vue-3'",
  "cssImport": "import '@mozaic-ds/vue-3/dist/style.css'"
}
EOF
