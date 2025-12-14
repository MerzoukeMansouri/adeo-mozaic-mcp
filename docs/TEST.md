# Testing

## Quick Start

```bash
pnpm test            # Run unit tests
pnpm test:coverage   # Run tests with coverage report
pnpm database:sanity # Run database sanity checks
pnpm lint            # Run ESLint
pnpm format:check    # Check Prettier formatting
```

## Unit Tests

Unit tests validate the parser logic for extracting data from Vue, React, documentation, tokens, and SCSS source files.

### Run Tests

```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
pnpm test:coverage  # With coverage report
```

Coverage report generated at `coverage/index.html`.

### Test Files

| File | Description |
|------|-------------|
| `src/parsers/__tests__/vue-parser.test.ts` | Vue component parsing |
| `src/parsers/__tests__/react-parser.test.ts` | React component parsing |
| `src/parsers/__tests__/docs-parser.test.ts` | Documentation/MDX parsing |
| `src/parsers/__tests__/scss-parser.test.ts` | CSS utility class generation |
| `src/parsers/__tests__/tokens-parser.test.ts` | Design token parsing |
| `src/__tests__/sanity-check.test.ts` | Database integrity checks |
| `src/__tests__/tools.integration.test.ts` | MCP tool integration tests |

### What's Tested

**Vue Parser:**
- `defineProps<{}>()` extraction with TypeScript generics
- `withDefaults()` default value extraction
- Union type options (`'s' | 'm' | 'l'`)
- Slot extraction (default + named)
- Event emit extraction

**React Parser:**
- Const array extraction (`const sizes = ['s', 'm', 'l'] as const`)
- Interface prop extraction with inheritance
- External `.types.ts` file reading
- Callback prop detection
- Component category inference

**Docs Parser:**
- Frontmatter extraction (title, category)
- Title extraction from H1/HTML
- Keyword extraction (components, CSS classes)
- Content cleaning (imports, JSX)
- Category inference from paths
- URL path generation

**SCSS Parser:**
- Flexy grid class generation (columns, modifiers, responsive)
- Container utility classes
- Margin/Padding utility classes (all sides, sizes)
- Ratio utility classes (aspect ratios)
- Scroll utility classes

**Tokens Parser:**
- Category mapping (colors, spacing, typography)
- Color value detection and subcategory extraction
- Spacing token generation (magic units)
- CSS/SCSS variable naming conventions
- Value parsing (rem, px, hex)

**Integration Tests (MCP Tools):**
- `get_component_info` - Component lookup, props, examples
- `get_design_tokens` - Token retrieval, format outputs (JSON/CSS/SCSS)
- `search_documentation` - FTS search, snippets, limits
- `list_components` - Component listing, category filtering
- `get_css_utility` - Utility classes, examples
- `list_css_utilities` - Utility listing, category filtering

## Sanity Check

The sanity check validates the built database contains expected data.

### Run

```bash
pnpm database:sanity
```

### Exit Codes

| Code | Meaning |
|------|---------|
| `0` | All checks passed |
| `1` | One or more checks failed |

### Checks Performed

| Category | Validates |
|----------|-----------|
| Tokens | Count, categories, required fields |
| Components | Vue/React counts, props, slots, events |
| CSS Utilities | Classes, examples |
| Documentation | Page count, content length |
| FTS | Full-text search indexes work |
| FK Integrity | No orphaned records |

## Code Quality

### Linting

```bash
pnpm lint        # Check for issues
pnpm lint:fix    # Auto-fix issues
```

### Formatting

```bash
pnpm format        # Format all files
pnpm format:check  # Check formatting
```

### Pre-commit Hooks

Husky runs lint-staged on commit, which:
- Runs ESLint with auto-fix
- Runs Prettier formatting

## CI/CD

GitHub Actions runs on push/PR to `main`:

```yaml
# .github/workflows/test.yml
jobs:
  lint:     # pnpm lint && pnpm format:check
  test:     # pnpm test:coverage
  sanity:   # pnpm database:sanity
```

All jobs run in parallel. The database (`data/mozaic.db`) must be committed for sanity checks to pass.
