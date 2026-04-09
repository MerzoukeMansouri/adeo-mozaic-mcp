#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, rmSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SKILLS_DEST = join(homedir(), '.claude', 'skills');
const SKILLS_SOURCE = join(__dirname, '..', 'skills');
const DB_SOURCE = join(__dirname, '..', 'data', 'mozaic.db');
const DB_DEST = join(homedir(), '.claude', 'mozaic.db');

const SKILLS = [
  'mozaic-vue-builder',
  'mozaic-react-builder',
  'mozaic-webcomponents-builder',
  'mozaic-design-tokens',
  'mozaic-css-utilities',
  'mozaic-icons'
];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function printHeader() {
  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  Mozaic Design System Skills - Installation', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log('');
}

function printFooter(installed) {
  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  Installation Complete!', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log('');
  log(`✅ Installed ${installed} skills successfully`, 'green');
  console.log('');
  log('Skills installed:', 'bright');
  SKILLS.forEach(skill => {
    if (existsSync(join(SKILLS_DEST, skill))) {
      log(`  • ${skill}`, 'green');
    }
  });
  console.log('');
  log('📖 Documentation: https://github.com/merzoukemansouri/adeo-mozaic-mcp/blob/main/SKILLS.md', 'blue');
  console.log('');
  log('Skills are now available in Claude Code!', 'bright');
  log('They will activate automatically based on context.', 'cyan');
  console.log('');
}

async function installSkills() {
  printHeader();

  // Check if skills source exists
  if (!existsSync(SKILLS_SOURCE)) {
    log('❌ Error: Skills directory not found', 'red');
    log(`   Expected at: ${SKILLS_SOURCE}`, 'red');
    process.exit(1);
  }

  // Check if database source exists
  if (!existsSync(DB_SOURCE)) {
    log('❌ Error: Database not found', 'red');
    log(`   Expected at: ${DB_SOURCE}`, 'red');
    process.exit(1);
  }

  log(`Installing skills from: ${SKILLS_SOURCE}`, 'blue');
  log(`Installing skills to:   ${SKILLS_DEST}`, 'blue');
  log(`Installing database to: ${DB_DEST}`, 'blue');
  console.log('');

  // Create destination directory if needed
  const claudeDir = join(homedir(), '.claude');
  if (!existsSync(claudeDir)) {
    log('📁 Creating .claude directory...', 'yellow');
    mkdirSync(claudeDir, { recursive: true });
  }

  if (!existsSync(SKILLS_DEST)) {
    log('📁 Creating skills directory...', 'yellow');
    mkdirSync(SKILLS_DEST, { recursive: true });
  }

  // Install database
  try {
    if (existsSync(DB_DEST)) {
      log('🔄 Updating database...', 'yellow');
    } else {
      log('💾 Installing database...', 'green');
    }
    cpSync(DB_SOURCE, DB_DEST);
  } catch (error) {
    log(`❌ Failed to install database: ${error.message}`, 'red');
    process.exit(1);
  }

  let installed = 0;

  // Install each skill
  for (const skill of SKILLS) {
    const source = join(SKILLS_SOURCE, skill);
    const dest = join(SKILLS_DEST, skill);

    if (!existsSync(source)) {
      log(`⚠️  Skipping ${skill} (not found)`, 'yellow');
      continue;
    }

    try {
      // Check if skill already exists
      if (existsSync(dest)) {
        log(`🔄 Updating: ${skill}`, 'yellow');
        rmSync(dest, { recursive: true, force: true });
      } else {
        log(`✨ Installing: ${skill}`, 'green');
      }

      // Copy skill
      cpSync(source, dest, { recursive: true });
      installed++;
    } catch (error) {
      log(`❌ Failed to install ${skill}: ${error.message}`, 'red');
    }
  }

  printFooter(installed);

  console.log('');
  log('📊 Database Info:', 'bright');
  log(`  Location: ${DB_DEST}`, 'cyan');
  log('  Contains: Components, Icons, Design Tokens, CSS Utilities', 'cyan');
  console.log('');
}

// Handle command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'uninstall') {
  // Uninstall skills
  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  Mozaic Design System Skills - Uninstallation', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log('');

  if (!existsSync(SKILLS_DEST)) {
    log('✅ No skills directory found. Nothing to uninstall.', 'green');
    process.exit(0);
  }

  log(`Removing skills from: ${SKILLS_DEST}`, 'blue');
  console.log('');

  let removed = 0;

  for (const skill of SKILLS) {
    const dest = join(SKILLS_DEST, skill);

    if (existsSync(dest)) {
      try {
        log(`🗑️  Removing: ${skill}`, 'yellow');
        rmSync(dest, { recursive: true, force: true });
        removed++;
      } catch (error) {
        log(`❌ Failed to remove ${skill}: ${error.message}`, 'red');
      }
    }
  }

  // Remove database
  if (existsSync(DB_DEST)) {
    try {
      log('🗑️  Removing database...', 'yellow');
      rmSync(DB_DEST, { force: true });
    } catch (error) {
      log(`❌ Failed to remove database: ${error.message}`, 'red');
    }
  }

  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  Uninstallation Complete!', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log('');
  log(`✅ Removed ${removed} skills successfully`, 'green');
  log('✅ Removed database', 'green');
  console.log('');
} else {
  // Default: install
  installSkills().catch(error => {
    console.error('');
    log('❌ Installation failed:', 'red');
    log(error.message, 'red');
    console.error('');
    process.exit(1);
  });
}
