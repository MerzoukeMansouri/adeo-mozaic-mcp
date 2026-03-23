#!/bin/bash
# Get installation information for a React component
# Usage: ./get-install-info.sh <component-name> [package-manager]

COMPONENT_NAME="$1"
PACKAGE_MANAGER="${2:-pnpm}"
DB_PATH="${MOZAIC_DB_PATH:-${HOME}/.claude/mozaic.db}"

if [ -z "$COMPONENT_NAME" ]; then
  echo "Error: Component name required"
  echo "Usage: $0 <component-name> [npm|yarn|pnpm]"
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Please run: npx -p mozaic-mcp-server@latest adeo-mozaic-install-tools skills"
  exit 1
fi

# Verify component exists
COMPONENT_EXISTS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM components WHERE name = '$COMPONENT_NAME' AND frameworks LIKE '%react%'")

if [ "$COMPONENT_EXISTS" = "0" ]; then
  echo "Error: Component '$COMPONENT_NAME' not found"
  exit 1
fi

# Generate installation command based on package manager
case "$PACKAGE_MANAGER" in
  npm)
    INSTALL_CMD="npm install @mozaic-ds/react"
    INSTALL_PEER="npm install react@^18.0.0 react-dom@^18.0.0"
    INSTALL_DEV="npm install -D typescript @types/react @types/react-dom"
    ;;
  yarn)
    INSTALL_CMD="yarn add @mozaic-ds/react"
    INSTALL_PEER="yarn add react@^18.0.0 react-dom@^18.0.0"
    INSTALL_DEV="yarn add -D typescript @types/react @types/react-dom"
    ;;
  pnpm)
    INSTALL_CMD="pnpm add @mozaic-ds/react"
    INSTALL_PEER="pnpm add react@^18.0.0 react-dom@^18.0.0"
    INSTALL_DEV="pnpm add -D typescript @types/react @types/react-dom"
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
  "framework": "react",
  "packageManager": "$PACKAGE_MANAGER",
  "package": "@mozaic-ds/react",
  "installCommand": "$INSTALL_CMD",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "installPeerCommand": "$INSTALL_PEER",
  "devDependencies": {
    "typescript": "latest",
    "@types/react": "latest",
    "@types/react-dom": "latest"
  },
  "installDevCommand": "$INSTALL_DEV",
  "imports": {
    "component": "import { ${COMPONENT_NAME} } from '@mozaic-ds/react'",
    "styles": "import '@mozaic-ds/react/dist/styles.css'"
  },
  "tsconfig": {
    "compilerOptions": {
      "jsx": "react-jsx",
      "esModuleInterop": true,
      "strict": true
    }
  }
}
EOF
