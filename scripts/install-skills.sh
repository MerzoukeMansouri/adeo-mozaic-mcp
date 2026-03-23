#!/bin/bash

# Install Mozaic Design System Skills to Claude Code
# This script copies all skills to ~/.claude/skills/

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_SOURCE="$PROJECT_ROOT/skills"
SKILLS_DEST="$HOME/.claude/skills"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Mozaic Design System Skills - Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if skills source directory exists
if [ ! -d "$SKILLS_SOURCE" ]; then
    echo "❌ Error: Skills directory not found at $SKILLS_SOURCE"
    exit 1
fi

# Create destination directory if it doesn't exist
if [ ! -d "$SKILLS_DEST" ]; then
    echo "📁 Creating skills directory at $SKILLS_DEST"
    mkdir -p "$SKILLS_DEST"
fi

echo "Installing skills from: $SKILLS_SOURCE"
echo "Installing skills to:   $SKILLS_DEST"
echo ""

# List of skills to install
SKILLS=(
    "mozaic-vue-builder"
    "mozaic-react-builder"
    "mozaic-design-tokens"
    "mozaic-css-utilities"
    "mozaic-icons"
)

# Counter for installed skills
INSTALLED=0

# Install each skill
for skill in "${SKILLS[@]}"; do
    SOURCE="$SKILLS_SOURCE/$skill"
    DEST="$SKILLS_DEST/$skill"

    if [ ! -d "$SOURCE" ]; then
        echo "⚠️  Skipping $skill (not found)"
        continue
    fi

    # Check if skill already exists
    if [ -d "$DEST" ]; then
        echo "🔄 Updating: $skill"
        rm -rf "$DEST"
    else
        echo "✨ Installing: $skill"
    fi

    # Copy skill
    cp -r "$SOURCE" "$DEST"
    INSTALLED=$((INSTALLED + 1))
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Installed $INSTALLED skills successfully"
echo ""
echo "Skills installed:"
for skill in "${SKILLS[@]}"; do
    if [ -d "$SKILLS_DEST/$skill" ]; then
        echo "  • $skill"
    fi
done
echo ""
echo "📖 Documentation: $PROJECT_ROOT/SKILLS.md"
echo ""
echo "Skills are now available in Claude Code!"
echo "They will activate automatically based on context."
echo ""
