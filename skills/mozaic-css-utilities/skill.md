---
name: mozaic-css-utilities
description: Mozaic CSS utility classes and layout systems expert. Master Flexy grid, Container, Margin, Padding, Ratio, and Scroll utilities for responsive layouts without writing custom CSS.
version: 1.0.0
---

# Mozaic CSS Utilities

An expert assistant for working with Mozaic CSS-only utility classes. These utilities work without any framework (no Vue or React needed) and provide powerful layout and spacing capabilities through simple CSS classes.

## ⚠️ Prerequisites

**This skill requires the Mozaic MCP server to be configured.**

Without the MCP server, this skill cannot:
- Access the Mozaic CSS utilities database
- Retrieve Flexy grid classes, spacing utilities, etc.
- Search documentation for CSS patterns

**Setup**:
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

See [INSTALLATION.md](https://github.com/merzoukemansouri/adeo-mozaic-mcp/blob/main/INSTALLATION.md) for complete setup.

## What This Skill Does

1. **Browse Utilities**: Discover available CSS utilities (Flexy, Container, Margin, Padding, etc.)
2. **Layout Systems**: Build responsive grids with Flexy
3. **Spacing Utilities**: Apply consistent margins and padding
4. **Container Management**: Create centered, responsive containers
5. **Aspect Ratios**: Maintain element ratios with Ratio utility
6. **Scroll Behavior**: Control scrolling with Scroll utility

## MCP Tools Used

This skill uses the Mozaic MCP server tools:
- `mcp__mozaic__list_css_utilities` - Browse utilities by category
- `mcp__mozaic__get_css_utility` - Get detailed utility class documentation
- `mcp__mozaic__search_documentation` - Search for utility usage examples

## When to Use This Skill

Use this skill when you:
- Need to build responsive grid layouts
- Want to apply consistent spacing without custom CSS
- Need container components for page layouts
- Want to maintain aspect ratios (videos, images)
- Need to control scroll behavior
- Prefer utility-first CSS approach
- Don't want to write custom CSS for common patterns

## Available CSS Utilities

### Layout Utilities
- **Flexy**: Flexbox-based responsive grid system
- **Container**: Centered, max-width containers

### Spacing Utilities
- **Margin**: Margin utility classes
- **Padding**: Padding utility classes

### Display Utilities
- **Ratio**: Aspect ratio containers
- **Scroll**: Scroll behavior control

## Interactive Workflow

### Step 1: What Do You Need?

When you activate this skill, I'll ask:

**"What type of layout or utility do you need?"**

Options:
- A) Grid/Layout (Flexy for responsive columns)
- B) Container (Centered page containers)
- C) Spacing (Margin and Padding)
- D) Aspect Ratio (Ratio for videos/images)
- E) Scroll Control (Scroll utilities)
- F) Browse all utilities

### Step 2: Get Utility Details

I'll use `mcp__mozaic__list_css_utilities` and `mcp__mozaic__get_css_utility` to show:
- Available CSS classes
- Responsive modifiers
- Usage examples
- Best practices

### Step 3: Generate Examples

Provide ready-to-use HTML examples with utility classes applied.

## Flexy Grid System

The Flexy utility is a powerful flexbox-based grid system.

### Basic Grid

```html
<!-- 2-column grid -->
<div class="flexy">
  <div class="flexy__col flexy__col--6">Column 1 (50%)</div>
  <div class="flexy__col flexy__col--6">Column 2 (50%)</div>
</div>

<!-- 3-column grid -->
<div class="flexy">
  <div class="flexy__col flexy__col--4">Column 1 (33.33%)</div>
  <div class="flexy__col flexy__col--4">Column 2 (33.33%)</div>
  <div class="flexy__col flexy__col--4">Column 3 (33.33%)</div>
</div>

<!-- 4-column grid -->
<div class="flexy">
  <div class="flexy__col flexy__col--3">Column 1 (25%)</div>
  <div class="flexy__col flexy__col--3">Column 2 (25%)</div>
  <div class="flexy__col flexy__col--3">Column 3 (25%)</div>
  <div class="flexy__col flexy__col--3">Column 4 (25%)</div>
</div>
```

### Responsive Grid

```html
<!-- Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns -->
<div class="flexy">
  <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
    Item 1
  </div>
  <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
    Item 2
  </div>
  <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
    Item 3
  </div>
</div>
```

**Responsive Modifiers**:
- `@s`: Small screens (≥480px)
- `@m`: Medium screens (≥768px)
- `@l`: Large screens (≥1024px)
- `@xl`: Extra large screens (≥1280px)

### Grid Gutters

```html
<!-- Default gutter (16px) -->
<div class="flexy flexy--gutter">
  <div class="flexy__col flexy__col--6">Column 1</div>
  <div class="flexy__col flexy__col--6">Column 2</div>
</div>

<!-- Small gutter (8px) -->
<div class="flexy flexy--gutter-s">
  <div class="flexy__col flexy__col--6">Column 1</div>
  <div class="flexy__col flexy__col--6">Column 2</div>
</div>

<!-- Large gutter (24px) -->
<div class="flexy flexy--gutter-l">
  <div class="flexy__col flexy__col--6">Column 1</div>
  <div class="flexy__col flexy__col--6">Column 2</div>
</div>

<!-- No gutter -->
<div class="flexy flexy--gutter-none">
  <div class="flexy__col flexy__col--6">Column 1</div>
  <div class="flexy__col flexy__col--6">Column 2</div>
</div>
```

### Alignment

```html
<!-- Vertical alignment -->
<div class="flexy flexy--align-start">Start aligned</div>
<div class="flexy flexy--align-center">Center aligned</div>
<div class="flexy flexy--align-end">End aligned</div>

<!-- Horizontal alignment -->
<div class="flexy flexy--justify-start">Start justified</div>
<div class="flexy flexy--justify-center">Center justified</div>
<div class="flexy flexy--justify-end">End justified</div>
<div class="flexy flexy--justify-between">Space between</div>
<div class="flexy flexy--justify-around">Space around</div>
```

### Column Offset

```html
<!-- Offset column by 2 (push right) -->
<div class="flexy">
  <div class="flexy__col flexy__col--6 flexy__col--offset-2">
    Offset by 2 columns
  </div>
</div>

<!-- Responsive offset -->
<div class="flexy">
  <div class="flexy__col flexy__col--8 flexy__col--offset-2@l">
    Offset only on large screens
  </div>
</div>
```

### Column Order

```html
<!-- Change order on different screens -->
<div class="flexy">
  <div class="flexy__col flexy__col--6 flexy__col--order-2@m">
    First on mobile, second on tablet+
  </div>
  <div class="flexy__col flexy__col--6 flexy__col--order-1@m">
    Second on mobile, first on tablet+
  </div>
</div>
```

## Container Utility

Create centered, max-width containers.

```html
<!-- Default container (max-width responsive) -->
<div class="container">
  <p>Centered content with responsive max-width</p>
</div>

<!-- Fluid container (full width with padding) -->
<div class="container container--fluid">
  <p>Full width with consistent padding</p>
</div>

<!-- Fixed width containers -->
<div class="container container--sm">Max 540px</div>
<div class="container container--md">Max 720px</div>
<div class="container container--lg">Max 960px</div>
<div class="container container--xl">Max 1140px</div>
```

## Margin Utilities

Apply consistent margins using the spacing scale.

### All Sides

```html
<!-- Margin all sides -->
<div class="m-0">No margin</div>
<div class="m-xs">Margin 8px</div>
<div class="m-s">Margin 12px</div>
<div class="m-m">Margin 16px</div>
<div class="m-l">Margin 24px</div>
<div class="m-xl">Margin 32px</div>
<div class="m-auto">Margin auto (centering)</div>
```

### Specific Sides

```html
<!-- Margin top -->
<div class="mt-m">Margin top 16px</div>

<!-- Margin bottom -->
<div class="mb-l">Margin bottom 24px</div>

<!-- Margin left -->
<div class="ml-s">Margin left 12px</div>

<!-- Margin right -->
<div class="mr-s">Margin right 12px</div>

<!-- Margin horizontal (left + right) -->
<div class="mx-m">Margin horizontal 16px</div>

<!-- Margin vertical (top + bottom) -->
<div class="my-l">Margin vertical 24px</div>
```

### Responsive Margins

```html
<!-- Different margins at breakpoints -->
<div class="m-s m-m@m m-l@l">
  Small margin on mobile, medium on tablet, large on desktop
</div>

<!-- Remove margin on specific breakpoints -->
<div class="mb-m mb-0@l">
  Margin bottom on mobile/tablet, none on desktop
</div>
```

### Negative Margins

```html
<!-- Pull element up/left -->
<div class="mt--m">Negative margin top -16px</div>
<div class="ml--l">Negative margin left -24px</div>
```

## Padding Utilities

Apply consistent padding using the spacing scale.

### All Sides

```html
<!-- Padding all sides -->
<div class="p-0">No padding</div>
<div class="p-xs">Padding 8px</div>
<div class="p-s">Padding 12px</div>
<div class="p-m">Padding 16px</div>
<div class="p-l">Padding 24px</div>
<div class="p-xl">Padding 32px</div>
```

### Specific Sides

```html
<!-- Padding top -->
<div class="pt-m">Padding top 16px</div>

<!-- Padding bottom -->
<div class="pb-l">Padding bottom 24px</div>

<!-- Padding left -->
<div class="pl-s">Padding left 12px</div>

<!-- Padding right -->
<div class="pr-s">Padding right 12px</div>

<!-- Padding horizontal (left + right) -->
<div class="px-m">Padding horizontal 16px</div>

<!-- Padding vertical (top + bottom) -->
<div class="py-l">Padding vertical 24px</div>
```

### Responsive Padding

```html
<!-- Different padding at breakpoints -->
<div class="p-s p-m@m p-l@l">
  Small padding on mobile, medium on tablet, large on desktop
</div>

<!-- Card with responsive padding -->
<div class="card p-m p-l@m p-xl@l">
  Responsive card padding
</div>
```

## Ratio Utility

Maintain aspect ratios for images, videos, and containers.

```html
<!-- 16:9 ratio (video) -->
<div class="ratio ratio--16x9">
  <iframe src="video.mp4"></iframe>
</div>

<!-- 4:3 ratio -->
<div class="ratio ratio--4x3">
  <img src="image.jpg" alt="4:3 image">
</div>

<!-- 1:1 ratio (square) -->
<div class="ratio ratio--1x1">
  <img src="avatar.jpg" alt="Square avatar">
</div>

<!-- 21:9 ratio (ultrawide) -->
<div class="ratio ratio--21x9">
  <video src="ultrawide.mp4"></video>
</div>

<!-- Custom ratio with CSS variable -->
<div class="ratio" style="--ratio: 2.35;">
  <img src="cinema.jpg" alt="Cinematic ratio">
</div>
```

## Scroll Utility

Control scroll behavior.

```html
<!-- Horizontal scroll container -->
<div class="scroll scroll--x">
  <div style="width: 2000px">
    Wide content that scrolls horizontally
  </div>
</div>

<!-- Vertical scroll container -->
<div class="scroll scroll--y" style="height: 300px">
  <p>Long content...</p>
  <p>That scrolls...</p>
  <p>Vertically...</p>
</div>

<!-- Scroll with shadows at edges -->
<div class="scroll scroll--x scroll--shadow">
  <div style="width: 2000px">
    Scrollable with edge shadows
  </div>
</div>

<!-- Smooth scrolling -->
<div class="scroll scroll--smooth">
  Content with smooth scroll behavior
</div>
```

## Common Layout Patterns

### Pattern 1: Sidebar Layout

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <!-- Sidebar: full width on mobile, 1/3 on desktop -->
    <aside class="flexy__col flexy__col--12 flexy__col--4@l">
      <div class="p-m">Sidebar</div>
    </aside>

    <!-- Main: full width on mobile, 2/3 on desktop -->
    <main class="flexy__col flexy__col--12 flexy__col--8@l">
      <div class="p-m">Main content</div>
    </main>
  </div>
</div>
```

### Pattern 2: Card Grid

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <!-- 1 column mobile, 2 columns tablet, 3 columns desktop -->
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 1</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 2</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m mb-m">Card 3</div>
    </div>
  </div>
</div>
```

### Pattern 3: Hero Section

```html
<section class="hero py-xl">
  <div class="container">
    <div class="flexy flexy--align-center flexy--justify-center">
      <div class="flexy__col flexy__col--12 flexy__col--8@m flexy__col--6@l">
        <h1 class="mb-m">Hero Title</h1>
        <p class="mb-l">Hero description text</p>
        <button class="btn">Call to Action</button>
      </div>
    </div>
  </div>
</section>
```

### Pattern 4: Feature Grid

```html
<div class="container py-xl">
  <div class="flexy flexy--gutter-l">
    <!-- 1 col mobile, 2 col tablet, 4 col desktop -->
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--3@l">
      <div class="text-center p-m">
        <div class="ratio ratio--1x1 mb-m">
          <img src="icon1.svg" alt="Feature 1">
        </div>
        <h3>Feature 1</h3>
      </div>
    </div>
    <!-- Repeat for more features -->
  </div>
</div>
```

### Pattern 5: Form Layout

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <div class="flexy__col flexy__col--12 flexy__col--6@m">
      <div class="mb-m">
        <label>First Name</label>
        <input type="text" class="px-s py-s">
      </div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m">
      <div class="mb-m">
        <label>Last Name</label>
        <input type="text" class="px-s py-s">
      </div>
    </div>
    <div class="flexy__col flexy__col--12">
      <div class="mb-m">
        <label>Email</label>
        <input type="email" class="px-s py-s">
      </div>
    </div>
  </div>
</div>
```

## Best Practices

### 1. Mobile-First Approach

```html
<!-- Good: Start mobile, add breakpoints up -->
<div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
  Mobile: 100%, Tablet: 50%, Desktop: 33.33%
</div>

<!-- Avoid: Desktop-first -->
<div class="flexy__col flexy__col--4 flexy__col--6@m flexy__col--12@s">
  Harder to reason about
</div>
```

### 2. Consistent Spacing Scale

```html
<!-- Good: Use spacing utilities -->
<div class="mb-m p-l">Consistent spacing</div>

<!-- Avoid: Arbitrary values -->
<div style="margin-bottom: 17px; padding: 23px">
  Inconsistent spacing
</div>
```

### 3. Semantic Container Usage

```html
<!-- Good: Use container for page sections -->
<section class="py-xl">
  <div class="container">
    <h2>Section Title</h2>
  </div>
</section>

<!-- Avoid: Multiple nested containers -->
<div class="container">
  <div class="container">
    Don't nest containers
  </div>
</div>
```

### 4. Grid Within Grid (Nested Grids)

```html
<!-- Good: Nest grids for complex layouts -->
<div class="flexy flexy--gutter">
  <div class="flexy__col flexy__col--8">
    <div class="flexy flexy--gutter">
      <div class="flexy__col flexy__col--6">Nested 1</div>
      <div class="flexy__col flexy__col--6">Nested 2</div>
    </div>
  </div>
  <div class="flexy__col flexy__col--4">Sidebar</div>
</div>
```

## Commands

When this skill is active:

- **"Show [utility] classes"**: Get all classes for a utility
- **"Build a [layout] with Flexy"**: Get layout examples
- **"How do I [task]?"**: Get utility guidance
- **"Responsive [pattern]"**: Get responsive patterns
- **"Spacing utilities"**: Get margin/padding classes

## Integration with Other Skills

This skill works well with:
- **mozaic-design-tokens**: Get spacing/breakpoint values
- **mozaic-vue-builder**: Add utilities to Vue components
- **mozaic-react-builder**: Add utilities to React components

## Example Session

**User**: "I need a 3-column product grid"

**Skill**:
I'll help you build a responsive 3-column grid with Flexy!

Do you want:
- A) Equal columns (33.33% each)
- B) Responsive (1 col mobile, 2 tablet, 3 desktop)
- C) With gutters between items

**User**: "B - Responsive with gutters"

**Skill**:
Perfect! Here's your responsive product grid:

[Uses `mcp__mozaic__get_css_utility` for Flexy]

```html
<div class="container">
  <div class="flexy flexy--gutter">
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 1</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 2</div>
    </div>
    <div class="flexy__col flexy__col--12 flexy__col--6@m flexy__col--4@l">
      <div class="card p-m">Product 3</div>
    </div>
  </div>
</div>
```

This creates:
- Mobile: 1 column (stacked)
- Tablet (≥768px): 2 columns
- Desktop (≥1024px): 3 columns
- With 16px gutters between items

Would you like me to:
- Add more products?
- Adjust gutter size?
- Add card styling?

---

**Let's build beautiful layouts with Mozaic CSS utilities!**
