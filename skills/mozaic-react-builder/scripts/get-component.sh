#!/bin/bash
# Get detailed information about a React component
# Usage: ./get-component.sh <component-name>

COMPONENT_NAME="$1"
DB_PATH="${HOME}/.claude/mozaic.db"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Component name required"
  echo "Usage: $0 <component-name>"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Get component basic info
COMPONENT_INFO=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT * FROM components
WHERE name = '$COMPONENT_NAME'
  AND frameworks LIKE '%react%'
LIMIT 1;
EOF
)

if [ "$COMPONENT_INFO" = "[]" ]; then
  echo "Error: Component '$COMPONENT_NAME' not found"
  exit 1
fi

# Get component props
PROPS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  type,
  default_value,
  required,
  description
FROM component_props
WHERE component_id = (
  SELECT id FROM components
  WHERE name = '$COMPONENT_NAME'
    AND frameworks LIKE '%react%'
)
ORDER BY required DESC, name;
EOF
)

# Get component events
EVENTS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  payload,
  description
FROM component_events
WHERE component_id = (
  SELECT id FROM components
  WHERE name = '$COMPONENT_NAME'
    AND frameworks LIKE '%react%'
)
ORDER BY name;
EOF
)

# Get component examples
EXAMPLES=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  title,
  code,
  description
FROM component_examples
WHERE component_id = (
  SELECT id FROM components
  WHERE name = '$COMPONENT_NAME'
    AND frameworks LIKE '%react%'
)
ORDER BY id;
EOF
)

# Combine all information into a single JSON output
cat <<EOF
{
  "component": $COMPONENT_INFO,
  "props": $PROPS,
  "events": $EVENTS,
  "examples": $EXAMPLES
}
EOF
