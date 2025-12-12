#!/usr/bin/env node

// MCP Server Wrapper - Handles Node version compatibility
import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to project directory so relative paths work
process.chdir(__dirname);

// Check if we need to rebuild better-sqlite3
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

// Path to the native module
const nativeModulePath = join(__dirname, 'node_modules/.pnpm/better-sqlite3@11.10.0/node_modules/better-sqlite3/build/Release/better_sqlite3.node');

if (!existsSync(nativeModulePath)) {
  // If native module doesn't exist, we need to rebuild
  // For now, we'll fall back to the pre-built database
  process.stderr.write(`Warning: better-sqlite3 not built for Node ${nodeVersion}\n`);
}

// Start the actual server
const serverPath = join(__dirname, 'dist', 'index.js');
const child = spawn(process.execPath, [serverPath], {
  stdio: 'inherit',
  cwd: __dirname,
  env: {
    ...process.env,
    NODE_PATH: join(__dirname, 'node_modules')
  }
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  child.kill('SIGINT');
});