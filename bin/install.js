#!/usr/bin/env node

import { Command } from 'commander';
import prompts from 'prompts';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const PROJECT_DIR = join(__dirname, '..');
const SKILLS_DEST = join(homedir(), '.claude', 'skills');
const SKILLS_SOURCE = join(PROJECT_DIR, 'skills');
const DB_SOURCE = join(PROJECT_DIR, 'data', 'mozaic.db');
const DB_DEST = join(homedir(), '.claude', 'mozaic.db');
const MCP_CONFIG_DIR = join(homedir(), 'Library', 'Application Support', 'Claude');
const MCP_CONFIG_FILE = join(MCP_CONFIG_DIR, 'claude_desktop_config.json');

const SKILLS = [
  'mozaic-vue-builder',
  'mozaic-react-builder',
  'mozaic-design-tokens',
  'mozaic-css-utilities',
  'mozaic-icons'
];

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  white: '\x1b[97m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function printLogo() {
  const logo = [
    '    ███╗   ███╗ ██████╗ ███████╗ █████╗ ██╗ ██████╗',
    '    ████╗ ████║██╔═══██╗╚══███╔╝██╔══██╗██║██╔════╝',
    '    ██╔████╔██║██║   ██║  ███╔╝ ███████║██║██║     ',
    '    ██║╚██╔╝██║██║   ██║ ███╔╝  ██╔══██║██║██║     ',
    '    ██║ ╚═╝ ██║╚██████╔╝███████╗██║  ██║██║╚██████╗',
    '    ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝'
  ];

  console.log('');
  logo.forEach(line => log(line, 'white'));
  log('         Mozaic Design System Installer by ADEO', 'dim');
  console.log('');
}

function checkStatus() {
  const status = {
    skills: {},
    mcp: false,
    database: existsSync(DB_DEST)
  };

  for (const skill of SKILLS) {
    status.skills[skill] = existsSync(join(SKILLS_DEST, skill));
  }

  if (existsSync(MCP_CONFIG_FILE)) {
    try {
      const config = JSON.parse(readFileSync(MCP_CONFIG_FILE, 'utf-8'));
      status.mcp = config.mcpServers && config.mcpServers.mozaic;
    } catch (error) {
      status.mcp = false;
    }
  }

  return status;
}

function installDatabase() {
  if (!existsSync(DB_SOURCE)) {
    log('  ❌ Database not found', 'red');
    log('     Run: pnpm build', 'yellow');
    return false;
  }

  const claudeDir = join(homedir(), '.claude');
  if (!existsSync(claudeDir)) {
    mkdirSync(claudeDir, { recursive: true });
  }

  try {
    if (existsSync(DB_DEST)) {
      log('  🔄 Updating database...', 'yellow');
    } else {
      log('  💾 Installing database...', 'green');
    }
    cpSync(DB_SOURCE, DB_DEST);
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

function uninstallDatabase() {
  if (existsSync(DB_DEST)) {
    try {
      log('  🗑️  Removing database...', 'yellow');
      rmSync(DB_DEST, { force: true });
      return true;
    } catch (error) {
      log(`  ❌ Failed: ${error.message}`, 'red');
      return false;
    }
  }
  return true;
}

function installSkill(skill) {
  const source = join(SKILLS_SOURCE, skill);
  const dest = join(SKILLS_DEST, skill);

  if (!existsSync(source)) {
    log(`  ⚠️  Skipping ${skill} (not found)`, 'yellow');
    return false;
  }

  if (!existsSync(SKILLS_DEST)) {
    mkdirSync(SKILLS_DEST, { recursive: true });
  }

  try {
    if (existsSync(dest)) {
      log(`  🔄 Updating: ${skill}`, 'yellow');
      rmSync(dest, { recursive: true, force: true });
    } else {
      log(`  ✨ Installing: ${skill}`, 'green');
    }

    cpSync(source, dest, { recursive: true });
    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

function uninstallSkill(skill) {
  const dest = join(SKILLS_DEST, skill);

  if (existsSync(dest)) {
    try {
      log(`  🗑️  Removing: ${skill}`, 'yellow');
      rmSync(dest, { recursive: true, force: true });
      return true;
    } catch (error) {
      log(`  ❌ Failed: ${error.message}`, 'red');
      return false;
    }
  }
  return true;
}

function installMCP() {
  const distPath = join(PROJECT_DIR, 'dist', 'index.js');

  if (!existsSync(distPath)) {
    log('  ❌ dist/index.js not found', 'red');
    log('     Run: pnpm build', 'yellow');
    return false;
  }

  if (!existsSync(MCP_CONFIG_DIR)) {
    mkdirSync(MCP_CONFIG_DIR, { recursive: true });
  }

  try {
    let config = {};

    if (existsSync(MCP_CONFIG_FILE)) {
      try {
        config = JSON.parse(readFileSync(MCP_CONFIG_FILE, 'utf-8'));
      } catch (error) {
        log('  ⚠️  Creating new config', 'yellow');
      }
    }

    if (!config.mcpServers) {
      config.mcpServers = {};
    }

    const wasInstalled = !!config.mcpServers.mozaic;
    config.mcpServers.mozaic = {
      command: 'node',
      args: [distPath]
    };

    writeFileSync(MCP_CONFIG_FILE, JSON.stringify(config, null, 2));

    if (wasInstalled) {
      log('  🔄 Updating: MCP Server', 'yellow');
    } else {
      log('  ✨ Installing: MCP Server', 'green');
    }

    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

function uninstallMCP() {
  if (!existsSync(MCP_CONFIG_FILE)) {
    return true;
  }

  try {
    const config = JSON.parse(readFileSync(MCP_CONFIG_FILE, 'utf-8'));

    if (config.mcpServers && config.mcpServers.mozaic) {
      delete config.mcpServers.mozaic;
      writeFileSync(MCP_CONFIG_FILE, JSON.stringify(config, null, 2));
      log('  🗑️  Removing: MCP Server', 'yellow');
    }

    return true;
  } catch (error) {
    log(`  ❌ Failed: ${error.message}`, 'red');
    return false;
  }
}

function printSuccess(installed, uninstalled) {
  console.log('');
  log('╔═══════════════════════════════════════════════════════════╗', 'green');
  log('║              ✨ Operation Complete! ✨                    ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'green');
  console.log('');

  if (installed > 0 || uninstalled > 0) {
    log('┌─────────────────────────────────────────────────────────┐', 'cyan');
    log('│  Summary                                                │', 'cyan');
    log('├─────────────────────────────────────────────────────────┤', 'cyan');
    if (installed > 0) {
      log(`│  ✅ Installed: ${installed} component(s)`.padEnd(58) + '│', 'green');
    }
    if (uninstalled > 0) {
      log(`│  🗑️  Removed: ${uninstalled} component(s)`.padEnd(59) + '│', 'yellow');
    }
    log('└─────────────────────────────────────────────────────────┘', 'cyan');
    console.log('');
  }
}

// Commands
const program = new Command();

program
  .name('mozaic-install')
  .description('Mozaic Design System installer for Claude Code & Claude Desktop\n  Run without arguments for interactive mode')
  .version('1.0.0')
  .hook('preAction', () => {
    printLogo();
  });

program
  .command('list')
  .alias('status')
  .description('Show installation status')
  .action(() => {
    const status = checkStatus();

    log('┌─────────────────────────────────────────────────────────┐', 'cyan');
    log('│  📦 Installation Status                                 │', 'cyan');
    log('├─────────────────────────────────────────────────────────┤', 'cyan');

    // Skills
    const installedSkills = SKILLS.filter(s => status.skills[s]);
    if (installedSkills.length > 0) {
      log('│                                                         │', 'cyan');
      log('│  Skills:                                                │', 'bright');
      installedSkills.forEach(skill => {
        log(`│     ✓ ${skill}`.padEnd(58) + '│', 'green');
      });
    }

    // MCP
    if (status.mcp) {
      log('│                                                         │', 'cyan');
      log('│  MCP Server:                                            │', 'bright');
      log('│     ✓ Configured in Claude Desktop'.padEnd(58) + '│', 'green');
    }

    // Database
    if (status.database) {
      log('│                                                         │', 'cyan');
      log('│  Database:                                              │', 'bright');
      log('│     ✓ ~/.claude/mozaic.db'.padEnd(58) + '│', 'green');
    }

    if (installedSkills.length === 0 && !status.mcp && !status.database) {
      log('│                                                         │', 'cyan');
      log('│     Nothing installed                                   │', 'yellow');
      log('│                                                         │', 'cyan');
      log('│     Run: mozaic-install all                             │', 'dim');
    }

    log('│                                                         │', 'cyan');
    log('└─────────────────────────────────────────────────────────┘', 'cyan');
    console.log('');
  });

program
  .command('skills')
  .description('Install all Claude Code skills')
  .action(() => {
    log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
    log('║              ⚙️  Installing Skills...                    ║', 'bright');
    log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');

    let installed = 0;

    if (installDatabase()) installed++;

    for (const skill of SKILLS) {
      if (installSkill(skill)) installed++;
    }

    printSuccess(installed, 0);

    log('💡 Skills are now available in Claude Code!', 'bright');
    log('   They activate automatically based on context.', 'cyan');
    console.log('');
  });

program
  .command('mcp')
  .description('Install MCP server for Claude Desktop')
  .action(() => {
    log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
    log('║              ⚙️  Installing MCP Server...                ║', 'bright');
    log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');

    const installed = installMCP() ? 1 : 0;

    printSuccess(installed, 0);

    if (installed > 0) {
      log('┌─────────────────────────────────────────────────────────┐', 'yellow');
      log('│  ⚠️  Next Steps                                          │', 'yellow');
      log('├─────────────────────────────────────────────────────────┤', 'yellow');
      log('│                                                         │', 'yellow');
      log('│     1. Restart Claude Desktop                           │', 'cyan');
      log('│     2. Mozaic MCP server will be available              │', 'cyan');
      log('│                                                         │', 'yellow');
      log('└─────────────────────────────────────────────────────────┘', 'yellow');
      console.log('');
    }
  });

program
  .command('all')
  .description('Install everything (skills + MCP server)')
  .action(() => {
    log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
    log('║              ⚙️  Installing All Components...            ║', 'bright');
    log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');

    let installed = 0;

    if (installDatabase()) installed++;

    for (const skill of SKILLS) {
      if (installSkill(skill)) installed++;
    }

    if (installMCP()) installed++;

    printSuccess(installed, 0);

    log('💡 All components installed!', 'bright');
    log('   • Skills are available in Claude Code', 'cyan');
    log('   • Restart Claude Desktop to use MCP server', 'cyan');
    console.log('');
  });

program
  .command('remove')
  .argument('<component>', 'Component to remove: skills, mcp, or all')
  .description('Remove installed components')
  .action((component) => {
    log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
    log('║              🗑️  Removing Components...                  ║', 'bright');
    log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');

    let uninstalled = 0;

    if (component === 'skills' || component === 'all') {
      for (const skill of SKILLS) {
        if (uninstallSkill(skill)) uninstalled++;
      }

      if (uninstallDatabase()) uninstalled++;
    }

    if (component === 'mcp' || component === 'all') {
      if (uninstallMCP()) uninstalled++;
    }

    if (component !== 'skills' && component !== 'mcp' && component !== 'all') {
      log(`  ❌ Unknown component: ${component}`, 'red');
      log('     Valid options: skills, mcp, all', 'yellow');
      process.exit(1);
    }

    printSuccess(0, uninstalled);
  });

// Check if no command was provided - run interactive mode
const args = process.argv.slice(2);
const commands = ['list', 'status', 'skills', 'mcp', 'all', 'remove'];
const isCommand = args.length > 0 && (commands.includes(args[0]) || args[0].startsWith('-'));
const isInteractive = args.length === 0 || args[0] === 'select';

async function runInteractive() {
  // Run interactive mode
  printLogo();

  const status = checkStatus();

  console.log('');
  log('┌─────────────────────────────────────────────────────────┐', 'cyan');
  log('│  📦 Select components to install/manage                 │', 'cyan');
  log('└─────────────────────────────────────────────────────────┘', 'cyan');
  console.log('');
  log('  ↑/↓  Navigate    Space  Select/Deselect    Enter  Confirm', 'dim');
  console.log('');

  // Create choices
  const choices = [
    ...SKILLS.map(skill => {
      const isInstalled = status.skills[skill];
      const descriptions = {
        'mozaic-vue-builder': 'Vue 3 component generator',
        'mozaic-react-builder': 'React/TSX component generator',
        'mozaic-design-tokens': 'Design tokens & styling',
        'mozaic-css-utilities': 'CSS utilities & layouts',
        'mozaic-icons': 'Icon search & integration'
      };

      return {
        title: `${isInstalled ? '✓' : '○'} ${skill}`,
        value: skill,
        selected: isInstalled,
        description: `${descriptions[skill]} - ${isInstalled ? 'installed' : 'not installed'}`
      };
    }),
    {
      title: `${status.mcp ? '✓' : '○'} MCP Server (Claude Desktop)`,
      value: 'mcp-server',
      selected: status.mcp,
      description: `Model Context Protocol server - ${status.mcp ? 'installed' : 'not installed'}`
    }
  ];

  const response = await prompts({
    type: 'multiselect',
    name: 'components',
    message: 'Select components to install',
    choices: choices,
    hint: '- Space to select. Return to submit',
    instructions: false
  });

  if (!response.components) {
    console.log('');
    log('❌ Cancelled', 'red');
    console.log('');
    process.exit(0);
  }

  console.log('');
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║              ⚙️  Processing...                           ║', 'bright');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');
  console.log('');

  const selected = response.components || [];
  const selectedSkills = selected.filter(item => item !== 'mcp-server');
  const installMCPServer = selected.includes('mcp-server');

  let installed = 0;
  let uninstalled = 0;

  // Handle database
  if (selectedSkills.length > 0) {
    if (installDatabase()) installed++;
  } else if (Object.values(status.skills).every(s => !s)) {
    if (uninstallDatabase()) uninstalled++;
  }

  // Install/uninstall skills
  for (const skill of SKILLS) {
    const shouldInstall = selectedSkills.includes(skill);
    const isInstalled = status.skills[skill];

    if (shouldInstall && !isInstalled) {
      if (installSkill(skill)) installed++;
    } else if (!shouldInstall && isInstalled) {
      if (uninstallSkill(skill)) uninstalled++;
    }
  }

  // Handle MCP
  if (installMCPServer && !status.mcp) {
    if (installMCP()) installed++;
  } else if (!installMCPServer && status.mcp) {
    if (uninstallMCP()) uninstalled++;
  }

  printSuccess(installed, uninstalled);

  if (installMCPServer && !status.mcp) {
    log('┌─────────────────────────────────────────────────────────┐', 'yellow');
    log('│  ⚠️  Next Steps                                          │', 'yellow');
    log('├─────────────────────────────────────────────────────────┤', 'yellow');
    log('│                                                         │', 'yellow');
    log('│     1. Restart Claude Desktop                           │', 'cyan');
    log('│     2. Mozaic MCP server will be available              │', 'cyan');
    log('│                                                         │', 'yellow');
    log('└─────────────────────────────────────────────────────────┘', 'yellow');
    console.log('');
  }
}

if (isInteractive) {
  runInteractive().catch(error => {
    console.error('');
    log('❌ Error:', 'red');
    log(error.message, 'red');
    console.error('');
    process.exit(1);
  });
} else {
  // Parse commander commands
  program.parse();
}
