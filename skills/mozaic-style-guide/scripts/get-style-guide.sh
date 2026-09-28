#!/bin/bash
# Get a Mozaic style guide pattern and write its screenshot to a PNG file
# Usage: ./get-style-guide.sh <slug>
# Output: JSON object with the pattern details and "screenshot", the path of the PNG to open

SLUG="$1"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
fi
if [ -z "$SLUG" ]; then
  echo "Error: Style guide slug required"
  echo "Usage: $0 <slug>  (list slugs with ./list-style-guides.sh)"
  exit 1
fi

OUT_DIR="${MOZAIC_STYLE_GUIDES_DIR:-$(dirname "$DB_PATH")/style-guides}"
mkdir -p "$OUT_DIR"
SCREENSHOT="$OUT_DIR/$(printf '%s' "$SLUG" | tr -cd 'A-Za-z0-9_-').png"

# Arguments end up in SQL: escape single quotes, keep numbers numeric
SQ="'"
SLUG="${SLUG//$SQ/$SQ$SQ}"
SCREENSHOT_SQL="${SCREENSHOT//$SQ/$SQ$SQ}"

RESULT=$(sqlite3 "$DB_PATH" <<SQL
SELECT json_object(
  'slug', slug, 'name', name, 'category', category, 'site', site,
  'description', description, 'components', json(components),
  'screenshot', CASE WHEN writefile('$SCREENSHOT_SQL', image) > 0 THEN '$SCREENSHOT_SQL' END)
FROM style_guides
WHERE slug = '$SLUG' COLLATE NOCASE;
SQL
)

if [ -z "$RESULT" ]; then
  echo "Error: Style guide '$1' not found. List slugs with ./list-style-guides.sh" >&2
  exit 1
fi

echo "$RESULT"
