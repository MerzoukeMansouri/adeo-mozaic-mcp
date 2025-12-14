# Testing

## Quick Start

```bash
pnpm test           # Run unit tests
pnpm sanity-check   # Run database sanity checks
```

## Unit Tests

Unit tests validate the parser logic for extracting component data from Vue and React source files.

### Run Tests

```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
```

### Test Files

| File | Description |
|------|-------------|
| `src/parsers/__tests__/vue-parser.test.ts` | Vue component parsing |
| `src/parsers/__tests__/react-parser.test.ts` | React component parsing |
| `src/__tests__/sanity-check.test.ts` | Database integrity checks |

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

## Sanity Check

The sanity check validates the built database contains expected data.

### Run

```bash
pnpm sanity-check
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

## CI/CD

GitHub Actions runs both test suites on push/PR to `main`:

```yaml
# .github/workflows/test.yml
jobs:
  test:     # pnpm test
  sanity:   # pnpm sanity-check
```

Both jobs run in parallel. The database (`data/mozaic.db`) must be committed for sanity checks to pass.
