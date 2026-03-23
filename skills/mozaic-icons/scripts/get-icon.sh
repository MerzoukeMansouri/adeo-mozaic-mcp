#!/bin/bash
# Get specific icon with SVG markup and framework code
# Usage: ./get-icon.sh <icon-name> [format]
# Formats: svg, react, vue, all (default)

ICON_NAME="$1"
FORMAT="${2:-all}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$ICON_NAME" ]; then
  echo "Error: Icon name required"
  echo "Usage: $0 <icon-name> [svg|react|vue|all]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Get icon info
ICON_INFO=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  name,
  icon_name,
  type,
  size,
  view_box,
  paths
FROM icons
WHERE name = '$ICON_NAME'
LIMIT 1;
EOF
)

if [ -z "$ICON_INFO" ] || [ "$ICON_INFO" = "[]" ]; then
  echo "Error: Icon '$ICON_NAME' not found"
  exit 1
fi

# Extract icon details
VIEW_BOX=$(echo "$ICON_INFO" | jq -r '.[0].view_box')
PATHS=$(echo "$ICON_INFO" | jq -r '.[0].paths')
ICON_SIZE=$(echo "$ICON_INFO" | jq -r '.[0].size')

# Generate code based on format
case "$FORMAT" in
  svg)
    cat <<EOF
{
  "icon": $ICON_INFO,
  "viewBox": "$VIEW_BOX",
  "size": $ICON_SIZE,
  "paths": $PATHS
}
EOF
    ;;

  react)
    cat <<EOF
{
  "icon": $ICON_INFO,
  "import": "import { Icon$ICON_NAME } from '@mozaic-ds/icons/react'",
  "usage": "<Icon$ICON_NAME />",
  "withProps": "<Icon$ICON_NAME size={32} color=\"currentColor\" aria-label=\"Icon description\" />",
  "viewBox": "$VIEW_BOX"
}
EOF
    ;;

  vue)
    cat <<EOF
{
  "icon": $ICON_INFO,
  "import": "import { Icon$ICON_NAME } from '@mozaic-ds/icons/vue'",
  "usage": "<Icon$ICON_NAME />",
  "withProps": "<Icon$ICON_NAME :size=\"32\" color=\"currentColor\" aria-label=\"Icon description\" />",
  "viewBox": "$VIEW_BOX"
}
EOF
    ;;

  all)
    cat <<EOF
{
  "icon": $ICON_INFO,
  "viewBox": "$VIEW_BOX",
  "size": $ICON_SIZE,
  "paths": $PATHS,
  "react": {
    "import": "import { Icon$ICON_NAME } from '@mozaic-ds/icons/react'",
    "usage": "<Icon$ICON_NAME />",
    "withProps": "<Icon$ICON_NAME size={32} color=\"currentColor\" aria-label=\"Icon description\" />"
  },
  "vue": {
    "import": "import { Icon$ICON_NAME } from '@mozaic-ds/icons/vue'",
    "usage": "<Icon$ICON_NAME />",
    "withProps": "<Icon$ICON_NAME :size=\"32\" color=\"currentColor\" aria-label=\"Icon description\" />"
  }
}
EOF
    ;;

  *)
    echo "Error: Invalid format. Use svg, react, vue, or all"
    exit 1
    ;;
esac
