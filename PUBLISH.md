# Publishing to npm

Guide for publishing `mozaic-mcp-server` to npm registry.

## Prerequisites

- [ ] npm account (create at https://www.npmjs.com/signup)
- [ ] npm CLI logged in: `npm login`
- [ ] Package name available on npm
- [ ] All tests passing
- [ ] Database built

## Check Package Name Availability

```bash
npm search mozaic-mcp-server
```

If the package name is taken, you may need to use a scoped package (e.g., `@your-org/mozaic-mcp-server`).

## Pre-Publish Checklist

### 1. Verify Package Contents

```bash
npm pack --dry-run
```

This shows what will be included. Verify:
- ✅ `skills/` directory (all 5 skills)
- ✅ `bin/install-skills.js`
- ✅ `dist/` (compiled server)
- ✅ `data/mozaic.db` (database)
- ✅ README, SKILLS.md, INSTALLATION.md

### 2. Test Locally with npm link

```bash
# In the project directory
npm link

# Test the commands
mozaic-mcp-server --help
mozaic-skills
mozaic-skills uninstall

# Unlink when done
npm unlink -g mozaic-mcp-server
```

### 3. Build Everything

```bash
pnpm build          # Builds MCP server and database
pnpm test           # Run tests
pnpm database:sanity  # Verify database
```

### 4. Update Version

Choose appropriate version bump:

```bash
npm version patch  # 1.0.0 → 1.0.1 (bug fixes)
npm version minor  # 1.0.0 → 1.1.0 (new features)
npm version major  # 1.0.0 → 2.0.0 (breaking changes)
```

This updates `package.json` and creates a git tag.

## Publishing

### Method 1: Publish to Public npm Registry (Recommended)

```bash
# Login to npm
npm login

# Publish (first time)
npm publish --access public

# For updates
npm publish
```

### Method 2: Publish as Scoped Package

If `mozaic-mcp-server` is taken, use a scope:

```bash
# Update package.json name:
{
  "name": "@your-username/mozaic-mcp-server"
}

# Publish
npm publish --access public
```

Users would then use:
```bash
npx @your-username/mozaic-mcp-server install
```

### Method 3: Test with Local tarball

Before publishing, test the tarball:

```bash
# Create tarball
npm pack

# This creates: mozaic-mcp-server-1.0.0.tgz

# Install from tarball (in a different directory)
npx /path/to/mozaic-mcp-server-1.0.0.tgz install

# Or test globally
npm install -g ./mozaic-mcp-server-1.0.0.tgz
mozaic-skills
npm uninstall -g mozaic-mcp-server
```

## After Publishing

### 1. Verify Publication

```bash
npm view mozaic-mcp-server
npm view mozaic-mcp-server versions
```

### 2. Test Installation

```bash
npx mozaic-mcp-server install
npx mozaic-mcp-server uninstall
```

### 3. Push Git Tags

```bash
git push && git push --tags
```

### 4. Create GitHub Release

1. Go to: https://github.com/your-repo/releases/new
2. Select the tag you created
3. Add release notes (see RELEASE.md template)
4. Publish release

## Troubleshooting

### Error: Package name already taken

**Solution 1**: Use scoped package
```json
{
  "name": "@your-username/mozaic-mcp-server"
}
```

**Solution 2**: Choose different name
```json
{
  "name": "mozaic-design-mcp-server"
}
```

### Error: Need to authenticate

```bash
npm login
# Enter your npm credentials
```

### Error: Skills not in package

Check `package.json`:
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

### Error: bin command not working

Check `package.json`:
```json
{
  "bin": {
    "mozaic-mcp-server": "dist/index.js",
    "mozaic-skills": "bin/install-skills.js"  // ← Must be here
  }
}
```

Ensure files have proper shebangs:
```javascript
#!/usr/bin/env node
```

## npm Configuration Issues

Your error shows:
```
npm warn Unknown user config "email"
npm warn Unknown user config "always-auth"
```

**Fix**: Update your `~/.npmrc`:

```bash
# Remove or update old configs
# Open ~/.npmrc and remove these lines:
# email=...
# always-auth=...

# Or use this command:
npm config delete email
npm config delete always-auth
```

## Package Size Optimization

Current package is ~35-40 MB (mostly database).

If too large, consider:

1. **Compress database**
   ```bash
   gzip data/mozaic.db
   # Decompress on install
   ```

2. **Separate packages**
   - `mozaic-mcp-server` (server + database)
   - `mozaic-skills` (skills only)

3. **Optional database download**
   - Publish without database
   - Download on first run

## Publishing Checklist

- [ ] Build completed: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] Database sanity check: `pnpm database:sanity`
- [ ] Version bumped: `npm version patch/minor/major`
- [ ] Tested locally: `npm link && mozaic-skills`
- [ ] Logged into npm: `npm whoami`
- [ ] Published: `npm publish --access public`
- [ ] Verified: `npm view mozaic-mcp-server`
- [ ] Tested install: `npx mozaic-mcp-server install`
- [ ] Git tags pushed: `git push --tags`
- [ ] GitHub release created

## Continuous Deployment

This repository supports **two methods** for automated publishing:

### Method 1: npm Trusted Publishers (Recommended - No Token Needed!)

**Benefits**:
- ✅ No npm token management required
- ✅ Automatic provenance attestation
- ✅ Better security (OIDC authentication)
- ✅ Supply chain transparency

**Setup**: See [TRUSTED_PUBLISHERS_SETUP.md](./TRUSTED_PUBLISHERS_SETUP.md) for complete guide.

**Quick Summary**:
1. Do initial manual publish (one-time): `npm publish --access public`
2. Configure trusted publisher at: https://www.npmjs.com/package/mozaic-mcp-server/access
3. Create GitHub release → Auto-publishes with provenance

The workflow is already configured for Trusted Publishers with `--provenance` flag.

### Method 2: Classic npm Token (Fallback)

If you prefer traditional token-based publishing:

1. Generate npm token: https://www.npmjs.com/settings/[username]/tokens/create
2. Add to GitHub secrets: Repository Settings → Secrets → Actions → New secret
   - Name: `NPM_TOKEN`
   - Value: Your npm token

3. Create GitHub release → Auto-publishes to npm

**Note**: npm is phasing out classic tokens in favor of Trusted Publishers.

## Next Steps After First Publish

1. Update documentation with actual package name
2. Test `npx mozaic-mcp-server install` command
3. Share on social media / GitHub discussions
4. Monitor https://www.npmjs.com/package/mozaic-mcp-server for stats

## Support

- npm registry: https://www.npmjs.com/
- npm docs: https://docs.npmjs.com/cli/v10/commands/npm-publish
- Package issues: https://github.com/your-repo/issues
