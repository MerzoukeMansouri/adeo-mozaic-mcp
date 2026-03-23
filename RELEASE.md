# Release Guide

Guide for publishing new versions of Mozaic MCP Server (includes skills).

## Prerequisites

- [ ] NPM account with publish access
- [ ] `NPM_TOKEN` secret configured in GitHub repository
- [ ] All tests passing
- [ ] Database built and tested

## What Gets Published

When you publish to npm, the package includes:

✅ **MCP Server**
- `dist/` - Compiled TypeScript
- `data/mozaic.db` - SQLite database with all indexed data

✅ **Skills** (automatically included!)
- `skills/mozaic-vue-builder/`
- `skills/mozaic-react-builder/`
- `skills/mozaic-design-tokens/`
- `skills/mozaic-css-utilities/`
- `skills/mozaic-icons/`

✅ **Installation Tools**
- `bin/install-skills.js` - NPX installer for skills
- `bin/mozaic-mcp-server` - MCP server executable

✅ **Documentation**
- `README.md`
- `SKILLS.md`
- `INSTALLATION.md`
- `LICENSE`

## Release Methods

### Method 1: Automatic Release (Recommended)

1. **Update version in package.json**
   ```bash
   npm version patch  # 1.0.0 → 1.0.1
   npm version minor  # 1.0.0 → 1.1.0
   npm version major  # 1.0.0 → 2.0.0
   ```

2. **Push the version tag**
   ```bash
   git push && git push --tags
   ```

3. **Create GitHub Release**
   - Go to GitHub Releases
   - Click "Create a new release"
   - Select the tag you just pushed
   - Add release notes (see template below)
   - Click "Publish release"

4. **GitHub Action automatically publishes to npm**
   - Workflow: `.github/workflows/publish.yml`
   - Triggered by: Release published
   - Publishes to: npmjs.com

### Method 2: Manual Publish

1. **Prepare the release**
   ```bash
   # Update version
   npm version patch

   # Build everything
   pnpm build

   # Run tests
   pnpm test

   # Verify package contents
   npm pack --dry-run
   ```

2. **Publish to npm**
   ```bash
   npm publish
   ```

3. **Create GitHub tag**
   ```bash
   git push && git push --tags
   ```

### Method 3: Manual Workflow Trigger

1. Go to GitHub Actions → Publish to NPM
2. Click "Run workflow"
3. Enter version (e.g., `1.2.0` or `1.2.0-beta.1`)
4. Workflow will publish automatically

## Pre-Release Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` (if exists)
- [ ] Run `pnpm build` successfully
- [ ] Run `pnpm test` - all tests pass
- [ ] Verify database is up to date: `pnpm database:sanity`
- [ ] Test npx installer: `node bin/install-skills.js`
- [ ] Verify skills are in `skills/` directory
- [ ] Update README if needed
- [ ] Commit all changes

## Verification After Release

1. **Verify npm package**
   ```bash
   npm view mozaic-mcp-server
   npm view mozaic-mcp-server versions
   ```

2. **Test installation**
   ```bash
   # Test MCP server
   npx mozaic-mcp-server

   # Test skills installation
   npx mozaic-mcp-server install

   # Verify skills installed
   ls ~/.claude/skills/ | grep mozaic
   ```

3. **Check package contents**
   ```bash
   npm pack
   tar -tzf mozaic-mcp-server-*.tgz | grep skills
   tar -tzf mozaic-mcp-server-*.tgz | grep bin/install-skills.js
   ```

## Release Notes Template

```markdown
## 🎉 Mozaic MCP Server v1.0.0

### ✨ New Features
- Added 5 Claude Code skills for interactive workflows
- NPX installer: `npx mozaic-mcp-server install`
- [Other features]

### 🐛 Bug Fixes
- [List bug fixes]

### 📚 Documentation
- Added SKILLS.md with complete skill documentation
- Added INSTALLATION.md with setup guide
- [Other doc updates]

### 🔧 MCP Tools (11 total)
- `get_component_info` - Vue/React component details
- `list_components` - Browse components
- `generate_vue_component` - Generate Vue code
- `generate_react_component` - Generate React code
- `get_css_utility` - CSS utility classes
- `list_css_utilities` - Browse utilities
- `search_icons` - Icon search
- `get_icon` - Get icon details
- `get_install_info` - Installation commands
- `get_design_tokens` - Design tokens
- `search_documentation` - Full-text search

### 🎨 Skills (5 total)
- `mozaic-vue-builder` - Vue 3 component generator
- `mozaic-react-builder` - React/TSX component generator
- `mozaic-design-tokens` - Design tokens expert
- `mozaic-css-utilities` - CSS utilities expert
- `mozaic-icons` - Icon search & integration

### 📦 Installation

**Skills Only:**
\`\`\`bash
npx mozaic-mcp-server install
\`\`\`

**MCP Server + Skills:**
\`\`\`bash
# 1. Install skills
npx mozaic-mcp-server install

# 2. Configure MCP server in Claude Code:
{
  "mcpServers": {
    "mozaic": {
      "command": "npx",
      "args": ["mozaic-mcp-server"]
    }
  }
}
\`\`\`

### 📖 Documentation
- [Installation Guide](./INSTALLATION.md)
- [Skills Documentation](./SKILLS.md)
- [MCP Server Docs](./README.md)
- [Playground](https://merzoukemansouri.github.io/adeo-mozaic-mcp/)

### ⚙️ Requirements
- Node.js ≥25.0.0
- Claude Code (latest)

### 🔗 Links
- NPM: https://www.npmjs.com/package/mozaic-mcp-server
- GitHub: https://github.com/merzoukemansouri/adeo-mozaic-mcp
```

## Skills Update Process

**Important**: Skills are automatically included in npm package!

When you update skills:

1. Edit skill markdown files in `skills/`
2. Test locally: `node bin/install-skills.js`
3. Commit changes
4. Follow normal release process above

No special steps needed - skills are part of the package.

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **PATCH** (1.0.0 → 1.0.1): Bug fixes, skill text updates
- **MINOR** (1.0.0 → 1.1.0): New skills, new MCP tools, new features
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes, MCP tool signature changes

## Troubleshooting

### Skills not in npm package

Check `package.json` has `files` field:
```json
{
  "files": [
    "dist",
    "data",
    "skills",  // ← Must be here
    "bin"
  ]
}
```

### npm publish fails

1. Check you're logged in: `npm whoami`
2. Check permissions: `npm access ls-packages`
3. Try manual publish: `npm publish --dry-run` first

### GitHub Action fails

1. Check `NPM_TOKEN` secret is set
2. Check workflow file: `.github/workflows/publish.yml`
3. Check logs in GitHub Actions tab

## Rollback

If you need to unpublish:

```bash
# Unpublish specific version (within 72 hours)
npm unpublish mozaic-mcp-server@1.0.0

# Deprecate instead (recommended)
npm deprecate mozaic-mcp-server@1.0.0 "Use version X.X.X instead"
```

## Beta/Alpha Releases

For pre-releases:

```bash
# Create beta version
npm version prerelease --preid=beta
# Example: 1.0.0 → 1.0.1-beta.0

# Publish with beta tag
npm publish --tag beta

# Users install with:
npx mozaic-mcp-server@beta install
```

## Post-Release Tasks

- [ ] Announce on GitHub Discussions
- [ ] Update documentation website
- [ ] Update examples
- [ ] Share on social media
- [ ] Monitor npm downloads
- [ ] Monitor GitHub issues

## Support

- **npm package**: https://www.npmjs.com/package/mozaic-mcp-server
- **GitHub Issues**: https://github.com/merzoukemansouri/adeo-mozaic-mcp/issues
- **Discussions**: https://github.com/merzoukemansouri/adeo-mozaic-mcp/discussions
