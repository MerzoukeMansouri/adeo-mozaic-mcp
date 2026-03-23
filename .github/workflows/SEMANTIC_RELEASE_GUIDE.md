# Semantic Release Guide

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and package publishing.

## How It Works

1. **Push to main**: Every push to the `main` branch triggers the release workflow
2. **Analyze commits**: Semantic-release analyzes commit messages since the last release
3. **Determine version**: Based on commit types, it determines the next version number
4. **Generate changelog**: Creates/updates CHANGELOG.md with release notes
5. **Publish to npm**: Publishes the new version to npm registry
6. **Create GitHub release**: Creates a GitHub release with release notes

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types and Version Bumps

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (1.0.0 → 1.1.0) | `feat: add icon search functionality` |
| `fix:` | Patch (1.0.0 → 1.0.1) | `fix: correct database query syntax` |
| `perf:` | Patch (1.0.0 → 1.0.1) | `perf: optimize shell script execution` |
| `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | See below |
| `docs:`, `style:`, `refactor:`, `test:`, `build:`, `ci:`, `chore:` | Patch | `docs: update installation guide` |

### Breaking Changes

To trigger a major version bump, include `BREAKING CHANGE:` in the commit footer:

```
feat: convert to shell-based architecture

BREAKING CHANGE: MCP server is no longer required. Skills now use shell scripts.
```

Or use the `!` notation:

```
feat!: convert to shell-based architecture
```

## Examples

### Feature Addition (Minor)
```bash
git commit -m "feat: add Vue component generator script"
# Version: 1.0.0 → 1.1.0
```

### Bug Fix (Patch)
```bash
git commit -m "fix: resolve database connection error in get-component.sh"
# Version: 1.0.0 → 1.0.1
```

### Documentation Update (Patch)
```bash
git commit -m "docs: update README with new installation instructions"
# Version: 1.0.0 → 1.0.1
```

### Breaking Change (Major)
```bash
git commit -m "feat!: remove MCP server dependency

BREAKING CHANGE: Skills no longer use MCP server. Users must run npx mozaic-mcp-server install to get the new shell-based skills."
# Version: 1.0.0 → 2.0.0
```

### Multiple Changes
```bash
git commit -m "feat: add design tokens shell script

- Add get-tokens.sh for querying design tokens
- Support JSON, SCSS, CSS, and JS output formats
- Include documentation search script"
# Version: 1.0.0 → 1.1.0
```

## Setup Requirements

### GitHub Secrets

The workflow requires these secrets to be configured in GitHub:

1. **GITHUB_TOKEN** (automatic)
   - Provided automatically by GitHub Actions
   - Used for creating releases and pushing to repository

2. **NPM_TOKEN** (manual setup required)
   - Create token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Use "Automation" token type
   - Add to GitHub repository secrets: Settings → Secrets → Actions → New repository secret
   - Name: `NPM_TOKEN`

### Branch Protection (Optional)

To ensure all commits follow the convention:

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable "Require status checks to pass before merging"
4. Enable "Require linear history" (enforces squash/rebase merges)

## Workflow Triggers

The release workflow runs on:
- Every push to `main` branch
- Does NOT run on pull requests
- Skips if commit message contains `[skip ci]`

## What Gets Published

When a release is created:

1. **npm Package**: Published to https://www.npmjs.com/package/mozaic-mcp-server
2. **GitHub Release**: Created at https://github.com/YOUR_USERNAME/adeo-mozaic-mcp/releases
3. **CHANGELOG.md**: Updated in the repository
4. **package.json**: Version number updated
5. **Git Tag**: Created (e.g., `v2.0.0`)

## Skipping Releases

To push to main without triggering a release:

```bash
git commit -m "chore: update internal documentation [skip ci]"
```

## Testing Locally

To test what version would be released:

```bash
npx semantic-release --dry-run
```

This shows:
- What version would be released
- What commits would be included
- What changelog would be generated
- **Does NOT** actually publish anything

## Troubleshooting

### Release Failed: No npm Token

**Problem**: Workflow fails with "npm token required"

**Solution**: Add NPM_TOKEN secret to GitHub repository

### No Release Created

**Problem**: Pushed to main but no release was created

**Possible causes**:
1. No commits since last release that trigger a release (only `chore:`, `ci:`, etc.)
2. Commit message contains `[skip ci]`
3. All commits are merge commits without conventional format

**Solution**: Make a commit with `feat:` or `fix:` type

### Wrong Version Bump

**Problem**: Expected minor but got patch (or vice versa)

**Solution**: Check commit message format. `feat:` = minor, `fix:` = patch

## Manual Release (Emergency)

If automated release fails, you can release manually:

```bash
# Install dependencies
pnpm install

# Build project
pnpm compile

# Run semantic-release
NPM_TOKEN=your_token_here npx semantic-release
```

## Resources

- [Semantic Release Docs](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [npm Publishing Guide](https://docs.npmjs.com/creating-and-publishing-unscoped-public-packages)
