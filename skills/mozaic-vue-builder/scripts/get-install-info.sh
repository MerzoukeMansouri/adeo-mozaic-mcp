#!/bin/bash
# Get installation information for a Vue component
# Usage: ./get-install-info.sh <component-name> [package-manager]

COMPONENT_NAME="$1"
PACKAGE_MANAGER="${2:-pnpm}"
DB_PATH="${HOME}/.claude/mozaic.db"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Component name required"
  echo "Usage: $0 <component-name> [npm|yarn|pnpm]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx mozaic-mcp-server install"
  exit 1
fi

# Verify component exists
COMPONENT_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM components WHERE name = '$COMPONENT_NAME' AND frameworks LIKE '%vue%'")

if [ "$COMPONENT_EXISTS" = "0" ]; then
  echo "Error: Component '$COMPONENT_NAME' not found"
  exit 1
fi

# Generate installation command based on package manager
case "$PACKAGE_MANAGER" in
  npm)
    INSTALL_CMD="npm install @mozaic-ds/vue-3"
    INSTALL_PEER="npm install vue@^3.3.0"
    ;;
  yarn)
    INSTALL_CMD="yarn add @mozaic-ds/vue-3"
    INSTALL_PEER="yarn add vue@^3.3.0"
    ;;
  pnpm)
    INSTALL_CMD="pnpm add @mozaic-ds/vue-3"
    INSTALL_PEER="pnpm add vue@^3.3.0"
    ;;
  *)
    echo "Error: Invalid package manager. Use npm, yarn, or pnpm"
    exit 1
    ;;
esac

# Output installation info as JSON
cat <<EOF
{
  "component": "$COMPONENT_NAME",
  "framework": "vue",
  "packageManager": "$PACKAGE_MANAGER",
  "package": "@mozaic-ds/vue-3",
  "installCommand": "$INSTALL_CMD",
  "peerDependencies": {
    "vue": "^3.3.0"
  },
  "installPeerCommand": "$INSTALL_PEER",
  "imports": {
    "component": "import { M${COMPONENT_NAME} } from '@mozaic-ds/vue-3'",
    "styles": "import '@mozaic-ds/vue-3/dist/style.css'"
  },
  "quickStart": {
    "globalRegistration": "import { createApp } from 'vue'\\nimport MozaicVue from '@mozaic-ds/vue-3'\\n\\nconst app = createApp(App)\\napp.use(MozaicVue)",
    "componentRegistration": "import { M${COMPONENT_NAME} } from '@mozaic-ds/vue-3'\\nimport '@mozaic-ds/vue-3/dist/style.css'"
  }
}
EOF
