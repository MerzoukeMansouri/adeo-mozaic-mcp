# Mozaic Design System Skills

This document describes the Claude Code skills created for the Mozaic Design System. These skills work in conjunction with the Mozaic MCP server to provide interactive, guided workflows for building applications with Mozaic.

## Overview

**5 Claude Skills** that use the **Mozaic MCP Server** (11 tools) to provide procedural knowledge and workflows.

**Architecture Pattern**: Skills provide the "how" (workflows), MCP provides the "what" (data access)

## Skills Summary

| Skill | Type | Description | MCP Tools Used |
|-------|------|-------------|----------------|
| `mozaic-vue-builder` | Framework | Interactive Vue 3 component generator | 4 tools |
| `mozaic-react-builder` | Framework | Interactive React/TSX component generator | 4 tools |
| `mozaic-design-tokens` | Agnostic | Design tokens and styling expert | 2 tools |
| `mozaic-css-utilities` | Agnostic | CSS utility classes and layouts | 3 tools |
| `mozaic-icons` | Both | Icon search and integration | 2 tools |

**Total**: 5 skills covering all 11 MCP tools

---

## Skill 1: mozaic-vue-builder

**Location**: `skills/mozaic-vue-builder/skill.md`

### Purpose
Interactive assistant for building Vue 3 applications with Mozaic Design System.

### MCP Tools
- `mcp__mozaic__list_components`
- `mcp__mozaic__get_component_info` (framework: vue)
- `mcp__mozaic__generate_vue_component`
- `mcp__mozaic__get_install_info` (framework: vue)

### Key Features
- Browse components by category (forms, navigation, feedback, layout, etc.)
- Interactive component selection with proposals
- Generate complete Vue 3 SFC code
- Props configuration with v-model bindings
- Installation commands (npm/yarn/pnpm)

### Example Usage
```
User: "I need a login form"
Skill: Proposes TextInput + Button combinations → Generates Vue code
```

### Use When
- Building Vue 3 UI components
- Need component props and slots guidance
- Want installation instructions
- Building forms, modals, navigation

---

## Skill 2: mozaic-react-builder

**Location**: `skills/mozaic-react-builder/skill.md`

### Purpose
Interactive assistant for building React applications with Mozaic Design System and full TypeScript support.

### MCP Tools
- `mcp__mozaic__list_components`
- `mcp__mozaic__get_component_info` (framework: react)
- `mcp__mozaic__generate_react_component`
- `mcp__mozaic__get_install_info` (framework: react)

### Key Features
- Browse React components by category
- Interactive component selection
- Generate TypeScript/React code
- Full type safety with interfaces
- Installation commands + TypeScript config

### Example Usage
```
User: "I need a registration form with TypeScript"
Skill: Proposes components with TypeScript interfaces → Generates typed React code
```

### Use When
- Building React UI components
- Need TypeScript type definitions
- Want framework-specific props guidance
- Building forms, modals, tables

---

## Skill 3: mozaic-design-tokens

**Location**: `skills/mozaic-design-tokens/skill.md`

### Purpose
Expert for working with Mozaic design tokens (colors, typography, spacing, shadows, borders, breakpoints, grid).

### MCP Tools
- `mcp__mozaic__get_design_tokens`
- `mcp__mozaic__search_documentation`

### Key Features
- Browse tokens by category
- Multiple formats (JSON, SCSS, CSS, JS)
- Responsive breakpoint values
- Usage examples for Vue & React
- Consistent styling guidance

### Token Categories
- **Colors**: Brand, semantic, component colors
- **Typography**: Font sizes, weights, line heights
- **Spacing**: Magic unit scale (4px base)
- **Shadows**: Elevation levels
- **Borders**: Widths, radius, colors
- **Screens**: Responsive breakpoints
- **Grid**: Gutters, columns, containers

### Example Usage
```
User: "What are the brand colors?"
Skill: Returns colors in requested format (SCSS/CSS/JS) with usage examples
```

### Use When
- Need brand or semantic colors
- Want consistent typography scale
- Need spacing values
- Working with responsive breakpoints
- Need shadows or border values

---

## Skill 4: mozaic-css-utilities

**Location**: `skills/mozaic-css-utilities/skill.md`

### Purpose
Expert for Mozaic CSS-only utility classes (no framework needed).

### MCP Tools
- `mcp__mozaic__list_css_utilities`
- `mcp__mozaic__get_css_utility`
- `mcp__mozaic__search_documentation`

### Key Features
- Flexy grid system (flexbox-based)
- Container utilities
- Margin and Padding utilities
- Ratio utilities (aspect ratios)
- Scroll utilities
- Responsive modifiers

### Available Utilities
- **Flexy**: Responsive grid (12-column)
- **Container**: Centered containers
- **Margin**: Spacing utilities (m-*, mt-*, mb-*, etc.)
- **Padding**: Padding utilities (p-*, pt-*, pb-*, etc.)
- **Ratio**: Aspect ratio containers (16:9, 4:3, 1:1, etc.)
- **Scroll**: Scroll behavior control

### Example Usage
```
User: "I need a 3-column responsive grid"
Skill: Returns Flexy grid HTML with responsive breakpoints
```

### Use When
- Building responsive layouts
- Need consistent spacing
- Want utility-first CSS approach
- Don't want to write custom CSS
- Building grids, containers, aspect ratios

---

## Skill 5: mozaic-icons

**Location**: `skills/mozaic-icons/skill.md`

### Purpose
Icon search and integration for Vue & React applications.

### MCP Tools
- `mcp__mozaic__search_icons`
- `mcp__mozaic__get_icon`

### Key Features
- Search icons by keyword
- Browse by category (navigation, media, social, commerce, etc.)
- Filter by size (16, 24, 32, 48, 64)
- Generate Vue or React code
- Raw SVG output
- Accessibility guidance

### Icon Categories
- Navigation (arrows, chevrons, menu)
- Media (play, pause, volume)
- Actions (edit, delete, save)
- Social (Facebook, Twitter, Instagram)
- Commerce (cart, payment, shipping)
- Interface (user, notification, calendar)
- Communication (email, message, phone)
- Files (document, image, video)

### Example Usage
```
User: "I need a shopping cart icon"
Skill: Shows cart icons → User selects size/framework → Generates code
```

### Use When
- Finding icons for UI
- Need icons in specific sizes
- Want Vue or React icon components
- Building navigation, actions, social links

---

## How Skills Use MCP Tools

### Best Practice Pattern

Skills **do not duplicate** database logic. Instead, they:
1. Use MCP tools via fully qualified names (e.g., `mcp__mozaic__list_components`)
2. Provide procedural workflows and guidance
3. Teach **how** to use the tools effectively
4. Offer interactive, guided experiences

### Example: mozaic-vue-builder Workflow

```
1. User: "I need a form"
2. Skill uses mcp__mozaic__list_components → Shows form components
3. User selects components
4. Skill uses mcp__mozaic__get_component_info → Gets props/details
5. Skill proposes 2-3 combinations
6. User refines selection
7. Skill uses mcp__mozaic__generate_vue_component → Generates code
8. Skill uses mcp__mozaic__get_install_info → Installation commands
```

---

## Installation

### Skills Location

Skills are located in this repository:
```
mozaic-mcp-server/skills/
├── mozaic-vue-builder/
│   └── skill.md
├── mozaic-react-builder/
│   └── skill.md
├── mozaic-design-tokens/
│   └── skill.md
├── mozaic-css-utilities/
│   └── skill.md
└── mozaic-icons/
    └── skill.md
```

### Installation Methods

#### Method 1: NPX (Recommended)

Install the latest skills directly from npm:

```bash
# Install skills
npx mozaic-mcp-server install

# Uninstall skills
npx mozaic-mcp-server uninstall
```

This method:
- ✅ Always gets the latest version
- ✅ No need to clone the repository
- ✅ Works from anywhere
- ✅ No database/build required

#### Method 2: Local Scripts

From the repository:

```bash
# Install skills
./scripts/install-skills.sh

# Or using npm/pnpm
pnpm install-skills

# Uninstall
pnpm uninstall-skills
```

#### Method 3: Manual Copy

```bash
# From repository
cp -r skills/* ~/.claude/skills/
```

### MCP Server Configuration

**IMPORTANT**: Skills require the Mozaic MCP server to be running. Configure it in Claude Code settings:

**Option 1: Using npx (Recommended)**
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["mozaic-mcp-server"]
    }
  }
}
```

**Option 2: Local development**
```json
{
  "mcpServers": {
    "mozaic": {
      "command": "node",
      "args": ["/path/to/mozaic-mcp-server/dist/index.js"]
    }
  }
}
```

Without the MCP server configured, skills cannot access the Mozaic database (components, tokens, icons, etc.).

---

## Skill Activation

Skills activate automatically based on context, or you can invoke them:

- **Auto-activation**: When user mentions relevant keywords
- **Manual**: `/skill mozaic-vue-builder`

---

## Cross-Skill Integration

Skills work well together:

1. **mozaic-design-tokens** → Get colors
2. **mozaic-vue-builder** → Build component with those colors
3. **mozaic-css-utilities** → Add Flexy grid layout
4. **mozaic-icons** → Add icons to the component

---

## Benefits of This Architecture

✅ **No Code Duplication** - Skills use existing MCP tools
✅ **Clear Separation** - Vue vs React vs Agnostic
✅ **Single Source of Truth** - Database stays in MCP server
✅ **Best Practice** - Follows official Anthropic guidance
✅ **Maintainable** - Update MCP server, all skills benefit
✅ **Interactive** - Skills provide guided workflows
✅ **Shareable** - Markdown files easy to distribute

---

## Development

### File Structure
Each skill follows this structure:
```markdown
---
name: skill-name
description: Brief description
version: 1.0.0
---

# Skill Name

[Overview]

## What This Skill Does
## MCP Tools Used
## When to Use This Skill
## Interactive Workflow
## Common Use Cases
## Best Practices
## Commands
## Example Session
```

### Adding New Skills

1. Create skill directory: `~/.claude/skills/new-skill/`
2. Create `skill.md` with frontmatter
3. Reference MCP tools with fully qualified names
4. Provide interactive workflows
5. Include examples and best practices

---

## Resources

- **MCP Server**: `mozaic-mcp-server/`
- **Database**: `data/mozaic.db`
- **Website**: `website/` (skill playground)
- **Documentation**: Check MCP server README

---

## Support

For issues or questions:
- MCP Server: Check `mozaic-mcp-server/README.md`
- Skills: This document
- Claude Code: https://code.claude.com/docs

---

**Created**: March 23, 2026
**Author**: Mozaic MCP Server Team
**License**: MIT
