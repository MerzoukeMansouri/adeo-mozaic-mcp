# mozaic-design-tokens: examples

## Common Use Cases

### Use Case 1: Getting Brand Colors

**User**: "What are the brand colors?"

**Workflow**:
1. Use `get-tokens.sh colors json` to retrieve color tokens
2. Show brand color palette
3. Provide usage examples
4. Suggest semantic color alternatives

**Output**:
```json
{
  "colors": {
    "brand": {
      "primary-01": "#007DBC",
      "primary-02": "#0062CC",
      "secondary-01": "#78BE20",
      "secondary-02": "#5FA700"
    }
  }
}
```

### Use Case 2: Typography Scale

**User**: "What font sizes should I use?"

**Workflow**:
1. Use `get-tokens.sh typography scss` to retrieve typography tokens
2. Show type scale with line heights
3. Provide semantic naming (heading, body, caption)
4. Show usage examples

**Output**:
```scss
// Typography Scale
$font-size-xs: 0.75rem;   // 12px
$font-size-s: 0.875rem;   // 14px
$font-size-m: 1rem;       // 16px (base)
$font-size-l: 1.125rem;   // 18px
$font-size-xl: 1.5rem;    // 24px
$font-size-2xl: 2rem;     // 32px

// Line Heights
$line-height-tight: 1.2;
$line-height-normal: 1.5;
$line-height-relaxed: 1.75;
```

### Use Case 3: Spacing System

**User**: "How do I use consistent spacing?"

**Workflow**:
1. Use `get-tokens.sh spacing css` to retrieve spacing tokens
2. Explain magic unit system (4px base)
3. Show spacing scale
4. Provide component examples

**Output**:
```css
/* Magic Unit: 4px */
--spacing-unit: 0.25rem;  /* 4px */
--spacing-xs: 0.5rem;     /* 8px */
--spacing-s: 0.75rem;     /* 12px */
--spacing-m: 1rem;        /* 16px */
--spacing-l: 1.5rem;      /* 24px */
--spacing-xl: 2rem;       /* 32px */
--spacing-2xl: 3rem;      /* 48px */
--spacing-3xl: 4rem;      /* 64px */

/* Usage */
.card {
  padding: var(--spacing-l);
  margin-bottom: var(--spacing-m);
}
```

### Use Case 4: Responsive Breakpoints

**User**: "What are the responsive breakpoints?"

**Workflow**:
1. Use `get-tokens.sh screens scss` to retrieve breakpoint tokens
2. Show breakpoint values
3. Provide media query examples
4. Suggest mobile-first approach

**Output**:
```scss
// Breakpoints
$screen-xs: 320px;   // Mobile
$screen-s: 480px;    // Large mobile
$screen-m: 768px;    // Tablet
$screen-l: 1024px;   // Desktop
$screen-xl: 1280px;  // Large desktop
$screen-2xl: 1920px; // Wide desktop

// Media Queries (Mobile-first)
@media (min-width: $screen-m) {
  // Tablet and up
}

@media (min-width: $screen-l) {
  // Desktop and up
}
```

### Use Case 5: Shadow System

**User**: "How do I add elevation to a card?"

**Workflow**:
1. Use `get-tokens.sh shadows css` to retrieve shadow tokens
2. Show elevation levels
3. Explain when to use each level
4. Provide component examples

**Output**:
```css
/* Elevation Levels */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);

/* Usage */
.card {
  box-shadow: var(--shadow-md);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.modal {
  box-shadow: var(--shadow-xl);
}
```

### Use Case 6: Grid System

**User**: "How does the grid system work?"

**Workflow**:
1. Use `get-tokens.sh grid scss` to retrieve grid tokens
2. Show grid configuration
3. Explain gutter system
4. Provide layout examples

**Output**:
```scss
// Grid System
$grid-columns: 12;
$grid-gutter-xs: 1rem;   // 16px
$grid-gutter-s: 1.5rem;  // 24px
$grid-gutter-m: 2rem;    // 32px

// Container Widths
$container-sm: 540px;
$container-md: 720px;
$container-lg: 960px;
$container-xl: 1140px;
```
