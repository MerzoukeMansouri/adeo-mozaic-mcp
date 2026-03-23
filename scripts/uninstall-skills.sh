#!/bin/bash

# Uninstall Mozaic Design System Skills from Claude Code
# This script removes all Mozaic skills from ~/.claude/skills/

set -e

SKILLS_DEST="$HOME/.claude/skills"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mozaic Design System Skills - Uninstallation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if skills destination directory exists
if [ ! -d "$SKILLS_DEST" ]; then
    echo "✅ No skills directory found. Nothing to uninstall."
    exit 0
fi

echo "Removing skills from: $SKILLS_DEST"
echo ""

# List of skills to uninstall
SKILLS=(
    "mozaic-vue-builder"
    "mozaic-react-builder"
    "mozaic-design-tokens"
    "mozaic-css-utilities"
    "mozaic-icons"
)

# Counter for removed skills
REMOVED=0

# Remove each skill
for skill in "${SKILLS[@]}"; do
    DEST="$SKILLS_DEST/$skill"

    if [ -d "$DEST" ]; then
        echo "🗑️  Removing: $skill"
        rm -rf "$DEST"
        REMOVED=$((REMOVED + 1))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Uninstallation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Removed $REMOVED skills successfully"
echo ""
