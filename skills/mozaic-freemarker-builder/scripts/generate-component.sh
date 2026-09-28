#!/bin/bash
# Generate Freemarker macro usage code
COMPONENT="${1:?Component name required}"
CONFIG="${2:-{}}"
CONTENT="${3:-Content goes here}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.mozaic/mozaic.db}"
if [ ! -f "$DB_PATH" ]; then
  echo "Mozaic database not found, installing it to $DB_PATH..." >&2
  npx -y -p mozaic-mcp-server@2 mozaic-db "$DB_PATH" >&2 || {
    echo "Error: could not install the database. Run: npx -y -p mozaic-mcp-server@2 mozaic-db" >&2
    exit 1
  }
fi
# Arguments end up in SQL: escape single quotes, keep numbers numeric
SQ="'"
COMPONENT="${COMPONENT//$SQ/$SQ$SQ}"

# Get component info
COMP_DATA=$(sqlite3 "$DB_PATH" "SELECT slug FROM components WHERE frameworks LIKE '%freemarker%' AND (LOWER(slug) LIKE LOWER('%$COMPONENT%') OR LOWER(name) LIKE LOWER('%$COMPONENT%')) LIMIT 1;")

if [ -z "$COMP_DATA" ]; then
  echo "Component '$COMPONENT' not found"
  exit 1
fi

MACRO_NAME=$(echo "$COMP_DATA" | tr -d '-')

# Generate code
cat <<EOF
<#import "mozaic/${MACRO_NAME}.ftl" as ${MACRO_NAME}>

<#assign config = ${CONFIG}>

<@${MACRO_NAME}.${MACRO_NAME} config=config>
    ${CONTENT}
</@${MACRO_NAME}.${MACRO_NAME}>
EOF
