#!/bin/bash
# Generate Web Component usage code
# Usage: ./generate-component.sh <component-slug> [attributes-json] [children]

COMPONENT_SLUG="$1"
ATTRIBUTES_JSON="${2:-{}}"
CHILDREN="$3"
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
  echo "Usage: $0 <component-slug> [attributes-json] [children]"
  echo "Example: $0 button '{\"theme\":\"primary\",\"size\":\"m\"}' 'Click me'"
  exit 1
fi

# Get component info
COMPONENT_NAME=$(sqlite3 "$DB_PATH" <<EOF
SELECT name FROM components
WHERE slug = '$COMPONENT_SLUG'
  AND frameworks LIKE '%webcomponents%'
LIMIT 1;
EOF
)

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Web Component '$COMPONENT_SLUG' not found"
  exit 1
fi

# Generate import statement
echo "// Import web component"
echo "import '@adeo/mozaic-web-components/${COMPONENT_SLUG}.js';"
echo ""
echo "// Usage in HTML"

# Build attributes string
ATTRS=""
if [ "$ATTRIBUTES_JSON" != "{}" ]; then
  # Parse JSON and build attributes (simplified - in production use jq)
  ATTRS=$(echo "$ATTRIBUTES_JSON" | sed 's/[{}"]//g' | sed 's/,/ /g' | sed 's/:/=/g')
fi

# Generate component tag
TAG_NAME="$COMPONENT_SLUG"

if [ -n "$CHILDREN" ]; then
  if [ -n "$ATTRS" ]; then
    echo "<${TAG_NAME} ${ATTRS}>"
  else
    echo "<${TAG_NAME}>"
  fi
  echo "  ${CHILDREN}"
  echo "</${TAG_NAME}>"
else
  if [ -n "$ATTRS" ]; then
    echo "<${TAG_NAME} ${ATTRS}></${TAG_NAME}>"
  else
    echo "<${TAG_NAME}></${TAG_NAME}>"
  fi
fi
