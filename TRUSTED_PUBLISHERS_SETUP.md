# npm Trusted Publishers Setup Guide

This guide explains how to configure automated npm publishing using **npm Trusted Publishers** (OIDC authentication) with GitHub Actions. This eliminates the need for long-lived npm tokens and provides cryptographic proof of provenance.

## What is npm Trusted Publishers?

npm Trusted Publishers allows GitHub Actions workflows to publish packages using OpenID Connect (OIDC) authentication instead of storing npm tokens as secrets. This provides:

- ✅ **No token management**: No need to generate, rotate, or secure npm tokens
- ✅ **Automatic provenance**: Cryptographic proof of where packages were built
- ✅ **Better security**: Short-lived credentials generated per workflow run
- ✅ **Supply chain transparency**: Users can verify package authenticity

## Prerequisites

- ✅ npm account with publish permissions
- ✅ Package name available or owned on npm registry
- ✅ GitHub repository with Actions enabled
- ✅ npm CLI v11.5.1 or later (handled automatically in workflow)

## Setup Steps

### 1. Configure Repository in package.json

Ensure your `package.json` includes the repository field:

```json
{
  "name": "mozaic-mcp-server",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/MerzoukeMansouri/adeo-mozaic-mcp.git"
  },
  "publishConfig": {
    "access": "public",
    "provenance": true
  }
}
```

**Status**: ✅ Already configured

### 2. Configure Trusted Publisher on npmjs.com

This step **requires the package to be published at least once** first. After the initial publish:

1. Go to: `https://www.npmjs.com/package/mozaic-mcp-server/access`
2. Scroll to "Trusted Publishers" section
3. Click "Add trusted publisher"
4. Select "GitHub Actions"
5. Fill in the configuration:
   - **GitHub Organization/User**: `MerzoukeMansouri`
   - **Repository**: `adeo-mozaic-mcp`
   - **Workflow file**: `publish.yml` (or `.github/workflows/publish.yml`)
   - **Environment** (optional): Leave empty or specify environment name

**Important Notes**:
- Each package must be configured individually
- Configuration must **exactly match** your workflow details
- 404 errors during publish usually mean configuration mismatch

### 3. Update GitHub Actions Workflow

The workflow has been updated with:

```yaml
permissions:
  contents: read
  id-token: write  # Required for OIDC token generation

jobs:
  publish:
    steps:
      - name: Install latest npm (for Trusted Publishers)
        run: npm install -g npm@latest

      - name: Publish to NPM (with Trusted Publishers)
        run: npm publish --provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Status**: ✅ Already configured in `.github/workflows/publish.yml`

### 4. Initial Publish (One-Time)

For the **first publish only**, you still need to use npm token:

```bash
# Method 1: Publish manually with your npm account
npm login
npm publish --access public

# Method 2: Use GitHub Actions with NPM_TOKEN secret
# 1. Generate token at https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# 2. Add as GitHub secret: NPM_TOKEN
# 3. Create a GitHub release to trigger workflow
```

### 5. Configure Trusted Publisher (After First Publish)

After the package exists on npm:

1. Visit: https://www.npmjs.com/package/mozaic-mcp-server/access
2. Add trusted publisher configuration (see step 2 above)
3. **Remove NPM_TOKEN** from GitHub secrets (optional, for enhanced security)

### 6. Subsequent Publishes

Once Trusted Publisher is configured:

1. Create a new GitHub release (or manually trigger workflow)
2. GitHub Actions generates OIDC token automatically
3. npm verifies the token against your Trusted Publisher config
4. Package publishes with provenance attestation

## Publishing Methods

### Method 1: GitHub Release (Recommended)

```bash
# Create and push a version tag
npm version patch  # or minor/major
git push && git push --tags

# Then create GitHub release at:
# https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/releases/new
```

The workflow triggers automatically and publishes to npm.

### Method 2: Manual Workflow Trigger

Go to: https://github.com/MerzoukeMansouri/adeo-mozaic-mcp/actions/workflows/publish.yml

Click "Run workflow" and enter version (e.g., `1.0.1`)

## Verification

After publishing, users can verify provenance:

```bash
# View package provenance
npm view mozaic-mcp-server

# The output will include:
# - dist.attestations: Provenance data
# - provenance: GitHub Actions workflow details
```

## Troubleshooting

### Error: 404 during npm publish with Trusted Publishers

**Cause**: npm couldn't match your workflow to the Trusted Publisher configuration

**Solution**: Verify on npmjs.com that the configuration exactly matches:
- GitHub org/user: `MerzoukeMansouri`
- Repository: `adeo-mozaic-mcp`
- Workflow file: `publish.yml`
- Environment: (empty or matching workflow environment)

### Error: "need auth" when using Trusted Publishers

**Cause**: Either:
1. Package doesn't exist yet (initial publish required)
2. Trusted Publisher not configured
3. npm CLI version too old

**Solution**:
1. Do initial publish manually or with NPM_TOKEN
2. Configure Trusted Publisher after package exists
3. Workflow installs latest npm automatically

### Error: OIDC token request failed

**Cause**: Missing `id-token: write` permission

**Solution**: Already added to workflow:
```yaml
permissions:
  id-token: write
```

## Current Status

### ✅ Completed Configuration

- [x] Repository field in package.json
- [x] publishConfig with provenance
- [x] GitHub Actions workflow updated with:
  - [x] `id-token: write` permission
  - [x] Latest npm installation
  - [x] `--provenance` flag on publish
- [x] Documentation created

### ⏳ Pending Actions

- [ ] **Initial publish to npm** (required before Trusted Publisher setup)
  ```bash
  npm login
  npm publish --access public
  ```

- [ ] **Configure Trusted Publisher on npmjs.com** (after initial publish)
  - Go to: https://www.npmjs.com/package/mozaic-mcp-server/access
  - Add GitHub Actions trusted publisher
  - Match: MerzoukeMansouri / adeo-mozaic-mcp / publish.yml

- [ ] **Remove NPM_TOKEN** (optional, after Trusted Publisher works)
  - Enhances security by eliminating stored credentials
  - Workflow will use OIDC exclusively

## Migration Path

### Phase 1: Initial Publish (Current)
Use traditional npm token for first publish:
```bash
npm login
npm publish --access public
```

### Phase 2: Configure Trusted Publisher
After package exists:
1. Add trusted publisher on npmjs.com
2. Test with GitHub release
3. Verify provenance is generated

### Phase 3: Remove Token (Optional)
Once Trusted Publisher works:
1. Remove NPM_TOKEN from GitHub secrets
2. Update workflow to remove `NODE_AUTH_TOKEN` env var
3. All publishes use OIDC exclusively

## Benefits

With Trusted Publishers configured, you'll have:

1. **Automated Publishing**: Create GitHub release → package publishes automatically
2. **Provenance**: Cryptographic proof of build origin
3. **Security**: No long-lived tokens to manage or leak
4. **Transparency**: Users can verify package authenticity
5. **Compliance**: Supply chain security best practices

## Resources

- **npm Trusted Publishers Docs**: https://docs.npmjs.com/trusted-publishers/
- **npm Provenance Guide**: https://docs.npmjs.com/generating-provenance-statements/
- **GitHub OIDC Docs**: https://docs.github.com/en/actions/security-for-github-actions/security-hardening-your-deployments/about-security-hardening-with-openid-connect

## Next Steps

1. **Do initial publish**:
   ```bash
   npm login
   npm publish --access public
   ```

2. **Configure Trusted Publisher**:
   - Visit: https://www.npmjs.com/package/mozaic-mcp-server/access
   - Add GitHub Actions configuration

3. **Test with release**:
   - Create GitHub release with tag `v1.0.1`
   - Verify workflow publishes successfully
   - Check provenance: `npm view mozaic-mcp-server`

4. **Optional: Remove token**:
   - Delete NPM_TOKEN from GitHub secrets
   - Update workflow to remove NODE_AUTH_TOKEN env var

---

**Note**: This repository is already configured for Trusted Publishers. You just need to do the initial publish and then configure the trusted publisher on npmjs.com.
