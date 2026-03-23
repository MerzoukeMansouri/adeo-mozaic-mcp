#!/bin/bash
# Get design tokens by category and format
# Usage: ./get-tokens.sh <category> [format]
# Categories: colors, typography, spacing, shadows, borders, screens, grid, all
# Formats: json (default), scss, css, js

CATEGORY="$1"
FORMAT="${2:-json}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

# Normalize plural aliases to match DB category values
case "$CATEGORY" in
  colors)  CATEGORY="color" ;;
  shadows) CATEGORY="shadow" ;;
  borders) CATEGORY="border" ;;
  screens) CATEGORY="screen" ;;
esac

if [ -z "$CATEGORY" ]; then
  echo "Error: Category required"
  echo "Usage: $0 <colors|typography|spacing|shadows|borders|screens|grid|all> [json|scss|css|js]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Query tokens by category
if [ "$CATEGORY" = "all" ]; then
  TOKENS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  category,
  name,
  value_raw as value,
  description
FROM tokens
ORDER BY category, name;
EOF
)
else
  TOKENS=$(sqlite3 "$DB_PATH" <<EOF
.mode json
SELECT
  category,
  name,
  value_raw as value,
  description
FROM tokens
WHERE category = '$CATEGORY'
ORDER BY name;
EOF
)
fi

# Convert to requested format
case "$FORMAT" in
  json)
    echo "$TOKENS"
    ;;

  scss)
    echo "$TOKENS" | jq -r '.[] | "$\(.name): \(.value);"'
    ;;

  css)
    echo ":root {"
    echo "$TOKENS" | jq -r '.[] | "  --\(.name): \(.value);"'
    echo "}"
    ;;

  js)
    echo "export const tokens = {"
    echo "$TOKENS" | jq -r 'group_by(.category) | .[] | "  \(.[0].category): {" + ([.[] | "    \"\(.name)\": \"\(.value)\""] | join(",\n")) + "\n  },"'
    echo "};"
    ;;

  *)
    echo "Error: Invalid format. Use json, scss, css, or js"
    exit 1
    ;;
esac
