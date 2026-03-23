# Quick Publishing Guide

Choose your publishing method:

## Option A: Automated with Trusted Publishers (Recommended)

### First-Time Setup

1. **Initial publish** (one-time, requires npm account):
   ```bash
   npm login
   npm publish --access public
   ```

2. **Configure Trusted Publisher** on npmjs.com:
   - Go to: https://www.npmjs.com/package/mozaic-mcp-server/access
   - Click "Add trusted publisher"
   - Select "GitHub Actions"
   - Enter:
     - Organization: `MerzoukeMansouri`
     - Repository: `adeo-mozaic-mcp`
     - Workflow: `publish.yml`
     - Environment: (leave empty)

### Subsequent Publishes

Just create a GitHub release:

```bash
# Bump version
npm version patch  # or minor/major

# Push with tags
git push && git push --tags

# Create GitHub release at:
# https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/releases/new
```

The workflow publishes automatically with cryptographic provenance! 🎉

---

## Option B: Manual Publishing

```bash
# Login
npm login

# Bump version
npm version patch

# Publish
npm publish --access public

# Push changes
git push && git push --tags
```

---

## Verification

After publishing:

```bash
# Check publication
npm view mozaic-mcp-server

# Test installation
npx mozaic-mcp-server install

# Verify skills
ls ~/.claude/skills/
```

---

## What Gets Published

- ✅ MCP server (`dist/`)
- ✅ Database (`data/mozaic.db`)
- ✅ All 5 skills (`skills/`)
- ✅ NPX installer (`bin/install-skills.js`)
- ✅ Documentation

**Total size**: ~1.4 MB compressed

---

## Documentation

- **Detailed guide**: [TRUSTED_PUBLISHERS_SETUP.md](./TRUSTED_PUBLISHERS_SETUP.md)
- **Complete publishing**: [PUBLISH.md](./PUBLISH.md)
- **Skills info**: [SKILLS.md](./SKILLS.md)
- **Installation**: [INSTALLATION.md](./INSTALLATION.md)
