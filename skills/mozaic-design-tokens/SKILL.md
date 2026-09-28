---
name: mozaic-design-tokens
description: Mozaic Design System tokens and styling expert. Access design tokens (colors, typography, spacing, shadows, borders, breakpoints, grid) in multiple formats (JSON, SCSS, CSS, JS) and search documentation for styling guidance.
compatibility: Requires bash, sqlite3 and jq, plus npx to fetch the Mozaic database (~/.mozaic/mozaic.db) on first use.
allowed-tools: Bash
metadata:
  version: "2.0.0"
---

# Mozaic Design Tokens

An expert assistant for working with Mozaic Design System tokens and styling. This skill helps you discover and use design tokens for colors, typography, spacing, shadows, borders, responsive breakpoints, and grid systems across your projects.

## What This Skill Does

1. **Browse Design Tokens**: Access tokens by category (colors, typography, spacing, etc.)
2. **Multiple Formats**: Get tokens in JSON, SCSS, CSS, or JavaScript formats
3. **Search Documentation**: Find styling guidance and best practices
4. **Responsive Design**: Work with breakpoints and responsive patterns
5. **Consistent Styling**: Ensure design system consistency across your app

## Shell Scripts Used

This skill uses shell scripts to query the local Mozaic database:
- `get-tokens.sh` - Get design tokens by category and format (JSON, SCSS, CSS, JS)
- `search-docs.sh` - Search Mozaic documentation for styling guidance

Database location: `~/.mozaic/mozaic.db` (override with `MOZAIC_DB_PATH`; installed automatically on first use)

## When to Use This Skill

Use this skill when you:
- Need to know brand colors or semantic colors
- Want to use consistent typography (font sizes, weights, line heights)
- Need spacing values following the magic unit scale
- Want to apply shadows, borders, or other design tokens
- Need responsive breakpoint values
- Want to understand grid system configuration
- Need tokens in specific format (SCSS variables, CSS custom properties, etc.)

## Design Token Categories

### 1. Colors
- **Brand Colors**: Primary brand identity colors
- **Semantic Colors**: Success, error, warning, info colors
- **Component Colors**: Specific to UI components (buttons, inputs, etc.)
- **Grays**: Neutral color scale
- **Background Colors**: Surface and background colors
- **Text Colors**: Typography color palette

### 2. Typography
- **Font Sizes**: Consistent type scale
- **Font Weights**: Regular, medium, bold, etc.
- **Line Heights**: Optimal line spacing
- **Letter Spacing**: Character spacing values
- **Font Families**: Primary and fallback fonts

### 3. Spacing
- **Magic Unit Scale**: Consistent spacing system (4px, 8px, 16px, 24px, etc.)
- **Component Spacing**: Internal component padding/margins
- **Layout Spacing**: Page-level spacing values

### 4. Shadows
- **Elevation Levels**: Shadow depths for layering
- **Focus Shadows**: Interactive element focus states
- **Component Shadows**: Card, modal, dropdown shadows

### 5. Borders
- **Border Widths**: Consistent border thickness
- **Border Radius**: Corner rounding values
- **Border Colors**: Border color palette

### 6. Screens (Breakpoints)
- **Mobile**: Small screen breakpoints
- **Tablet**: Medium screen breakpoints
- **Desktop**: Large screen breakpoints
- **Wide**: Extra-large screen breakpoints

### 7. Grid
- **Gutters**: Grid column spacing
- **Columns**: Grid column configuration
- **Container Widths**: Max container widths per breakpoint

## Interactive Workflow

### Step 1: What Do You Need?

When you activate this skill, I'll ask:

**"What type of design token do you need?"**

Options:
- A) Colors (brand, semantic, component)
- B) Typography (sizes, weights, line heights)
- C) Spacing (magic unit scale, component spacing)
- D) Shadows (elevation, focus, component)
- E) Borders (widths, radius, colors)
- F) Breakpoints (responsive screen sizes)
- G) Grid (gutters, columns, containers)
- H) All tokens (complete system)

### Step 2: Choose Output Format

**"What format do you need?"**

- A) JSON (structured data)
- B) SCSS ($variables)
- C) CSS (--custom-properties)
- D) JavaScript (constants)

### Step 3: Browse and Select

I'll use the `get-tokens.sh` script to show available tokens.

**Example - Colors in SCSS format**:
```scss
// Brand Colors
$color-primary-01: #007DBC;
$color-primary-02: #0062CC;
$color-secondary-01: #78BE20;

// Semantic Colors
$color-success: #78BE20;
$color-error: #E4032E;
$color-warning: #FFB400;
$color-info: #007DBC;

// Grays
$color-gray-100: #F5F5F5;
$color-gray-200: #EBEBEB;
$color-gray-500: #999999;
$color-gray-900: #333333;
```

### Step 4: Usage Examples

I'll provide examples for your chosen format:

**CSS Custom Properties**:
```css
:root {
  --color-primary: #007DBC;
  --color-success: #78BE20;
  --spacing-unit: 0.25rem; /* 4px */
  --spacing-s: 0.5rem;     /* 8px */
  --spacing-m: 1rem;       /* 16px */
  --spacing-l: 1.5rem;     /* 24px */
}

.button-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-m) var(--spacing-l);
}
```

## More Examples

Worked examples (Common Use Cases) are in [references/EXAMPLES.md](references/EXAMPLES.md). Read it when you need a full pattern or a sample session.

## Token Usage Patterns

### Pattern 1: CSS Custom Properties (Recommended)

```css
/* Define tokens as CSS variables */
:root {
  --color-primary: #007DBC;
  --spacing-m: 1rem;
  --font-size-m: 1rem;
  --border-radius-m: 0.25rem;
}

/* Use in components */
.button {
  background: var(--color-primary);
  padding: var(--spacing-m);
  font-size: var(--font-size-m);
  border-radius: var(--border-radius-m);
}
```

### Pattern 2: SCSS Variables

```scss
// Import Mozaic tokens
@use '@mozaic-ds/tokens' as tokens;

.component {
  color: tokens.$color-primary;
  padding: tokens.$spacing-m;
}
```

### Pattern 3: JavaScript/TypeScript

```typescript
import { tokens } from '@mozaic-ds/tokens';

const styles = {
  backgroundColor: tokens.colors.primary,
  padding: tokens.spacing.m,
  fontSize: tokens.typography.fontSize.m
};
```

## Best Practices

### 1. Use Semantic Tokens

```css
/* Good: Semantic meaning */
.success-message {
  color: var(--color-success);
  background: var(--color-success-light);
}

/* Avoid: Direct color values */
.success-message {
  color: #78BE20;
  background: #E8F5E9;
}
```

### 2. Follow the Spacing Scale

```css
/* Good: Use spacing tokens */
.card {
  padding: var(--spacing-l);
  margin-bottom: var(--spacing-m);
  gap: var(--spacing-s);
}

/* Avoid: Arbitrary values */
.card {
  padding: 23px;
  margin-bottom: 15px;
  gap: 9px;
}
```

### 3. Mobile-First Responsive Design

```scss
/* Good: Mobile-first with tokens */
.container {
  padding: $spacing-m;

  @media (min-width: $screen-m) {
    padding: $spacing-l;
  }

  @media (min-width: $screen-l) {
    padding: $spacing-xl;
  }
}
```

### 4. Consistent Typography

```css
/* Good: Use typography scale */
h1 {
  font-size: var(--font-size-2xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-bold);
}

/* Avoid: Random values */
h1 {
  font-size: 31px;
  line-height: 1.23;
  font-weight: 650;
}
```

### 5. Layered Shadows

```css
/* Good: Use elevation tokens */
.card-low {
  box-shadow: var(--shadow-sm);
}

.card-medium {
  box-shadow: var(--shadow-md);
}

.modal {
  box-shadow: var(--shadow-xl);
}
```

## Format Comparison

### JSON Format
**Best for**: Configuration files, design tools, documentation

```json
{
  "colors": {
    "primary": "#007DBC",
    "success": "#78BE20"
  },
  "spacing": {
    "m": "1rem",
    "l": "1.5rem"
  }
}
```

### SCSS Format
**Best for**: Sass/SCSS projects, preprocessor workflows

```scss
$color-primary: #007DBC;
$color-success: #78BE20;
$spacing-m: 1rem;
$spacing-l: 1.5rem;
```

### CSS Format
**Best for**: Modern CSS, runtime theming, CSS-in-JS

```css
:root {
  --color-primary: #007DBC;
  --color-success: #78BE20;
  --spacing-m: 1rem;
  --spacing-l: 1.5rem;
}
```

### JavaScript Format
**Best for**: JS/TS projects, React, styled-components

```javascript
export const tokens = {
  colors: {
    primary: '#007DBC',
    success: '#78BE20'
  },
  spacing: {
    m: '1rem',
    l: '1.5rem'
  }
};
```

## Documentation Search

Use the `search-docs.sh` script to find:
- Color usage guidelines
- Typography best practices
- Spacing system rules
- Responsive design patterns
- Accessibility considerations

**Example**:
```
"How to use primary colors" → Returns documentation on brand color usage
"Responsive breakpoints" → Returns breakpoint strategy and media queries
"Spacing system" → Returns magic unit scale explanation
```

## Commands

When this skill is active:

- **"Show [category] tokens"**: Get tokens by category
- **"Colors in [format]"**: Get colors in specific format
- **"What spacing should I use for [element]?"**: Spacing guidance
- **"Responsive breakpoints"**: Get breakpoint values
- **"Typography scale"**: Get font size scale
- **"How do I use [token]?"**: Token usage examples
- **"Search docs for [topic]"**: Search documentation

## Integration with Other Skills

This skill works well with:
- **mozaic-vue-builder**: Apply tokens to Vue components
- **mozaic-react-builder**: Apply tokens to React components
- **mozaic-css-utilities**: Combine tokens with utility classes

## Example Session

**User**: "I need to style a card component"

**Skill**:
I'll help you with design tokens for your card!

What aspects do you need?
- A) Colors (background, borders)
- B) Spacing (padding, margins)
- C) Shadows (elevation)
- D) All of the above

**User**: "D - All of the above"

**Skill**:
Perfect! What format do you prefer?
- A) CSS custom properties
- B) SCSS variables
- C) JavaScript
- D) JSON

**User**: "A - CSS"

**Skill**:
[Uses `get-tokens.sh` script for colors, spacing, shadows]

Here are the tokens for your card component:

```css
:root {
  /* Colors */
  --card-bg: #FFFFFF;
  --card-border: #EBEBEB;

  /* Spacing */
  --card-padding: 1.5rem;      /* 24px */
  --card-gap: 1rem;            /* 16px */
  --card-margin-bottom: 1rem;  /* 16px */

  /* Shadows */
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --card-shadow-hover: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Borders */
  --card-border-radius: 0.5rem; /* 8px */
  --card-border-width: 1px;
}

.card {
  background: var(--card-bg);
  padding: var(--card-padding);
  margin-bottom: var(--card-margin-bottom);
  border: var(--card-border-width) solid var(--card-border);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  transition: box-shadow 0.2s ease;
}

.card:hover {
  box-shadow: var(--card-shadow-hover);
}

.card__content {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
}
```

Would you like me to:
- Show responsive variations?
- Add dark theme tokens?
- Show SCSS or JS version?

---

**Let's build consistent, beautiful interfaces with Mozaic Design Tokens!**
