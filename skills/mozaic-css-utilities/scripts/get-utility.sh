#!/bin/bash
# Get CSS utility details including classes and examples
# Usage: ./get-utility.sh <utility-name> [include-classes]

UTILITY_NAME="$1"
INCLUDE_CLASSES="${2:-true}"
DB_PATH="${HOME}/.claude/mozaic.db"

if [ -z "$UTILITY_NAME" ]; then
  echo "Error: Utility name required"
  echo "Usage: $0 <utility-name> [true|false]"
  echo "Utilities: flexy, container, margin, padding, ratio, scroll"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Get utility basic info
UTILITY_INFO=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT * FROM css_utilities
WHERE LOWER(name) = LOWER('$UTILITY_NAME')
LIMIT 1;
EOF
)

if [ "$UTILITY_INFO" = "[]" ]; then
  echo "Error: Utility '$UTILITY_NAME' not found"
  exit 1
fi

# Get CSS classes if requested
if [ "$INCLUDE_CLASSES" = "true" ]; then
  CSS_CLASSES=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  class_name
FROM css_utility_classes
WHERE utility_id = (
  SELECT id FROM css_utilities
  WHERE LOWER(name) = LOWER('$UTILITY_NAME')
)
ORDER BY class_name;
EOF
)
else
  CSS_CLASSES="[]"
fi

# Get examples
EXAMPLES=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  title,
  code,
  description
FROM css_utility_examples
WHERE utility_id = (
  SELECT id FROM css_utilities
  WHERE LOWER(name) = LOWER('$UTILITY_NAME')
)
ORDER BY id;
EOF
)

# Combine all information
cat <<EOF
{
  "utility": $UTILITY_INFO,
  "classes": $CSS_CLASSES,
  "examples": $EXAMPLES
}
EOF
