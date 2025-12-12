#!/usr/bin/env node

import { spawn } from 'child_process';
import { writeFileSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logFile = join(__dirname, 'mcp-debug.log');

// Clear log file
writeFileSync(logFile, `=== MCP Debug Log - ${new Date().toISOString()} ===\n`);

function log(message) {
  appendFileSync(logFile, `[${new Date().toISOString()}] ${message}\n`);
}

log('Starting MCP server wrapper');
log(`Current directory: ${process.cwd()}`);
log(`Script directory: ${__dirname}`);
log(`Node version: ${process.version}`);

const serverPath = join(__dirname, 'dist', 'index.js');
log(`Server path: ${serverPath}`);

const child = spawn(process.execPath, [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: process.env
});

// Handle stdin
process.stdin.on('data', (data) => {
  log(`STDIN: ${data.toString().substring(0, 200)}`);
  child.stdin.write(data);
});

process.stdin.on('end', () => {
  log('STDIN ended');
  child.stdin.end();
});

// Handle stdout
child.stdout.on('data', (data) => {
  const output = data.toString();
  log(`STDOUT: ${output.substring(0, 200)}`);
  process.stdout.write(data);
});

// Handle stderr
child.stderr.on('data', (data) => {
  const error = data.toString();
  log(`STDERR: ${error}`);
  // Don't forward stderr to avoid breaking MCP protocol
});

// Handle child process events
child.on('error', (error) => {
  log(`Child process error: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  log(`Child process exited with code ${code}, signal ${signal}`);
  process.exit(code || 0);
});

process.on('SIGTERM', () => {
  log('Received SIGTERM');
  child.kill('SIGTERM');
});

process.on('SIGINT', () => {
  log('Received SIGINT');
  child.kill('SIGINT');
});