#!/usr/bin/env node

// Harness-agnostic installer. Delegates to the cross-agent CLIs:
//   skills -> `npx skills` (Agent Skills standard, Claude Code, Codex, Cursor, Copilot, Gemini CLI, ...)
//   mcp    -> `npx add-mcp` (writes each agent's MCP config: .mcp.json, .cursor/mcp.json, .vscode/mcp.json, ...)
//   db     -> copies the packaged database to ~/.mozaic/mozaic.db for the skills' shell scripts
// Extra flags (-g/--global, -a/--agent <name>, -y/--yes) are passed through to both CLIs.

import { spawnSync } from "child_process";
import { readdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const PACKAGE_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const { version } = JSON.parse(readFileSync(join(PACKAGE_DIR, "package.json"), "utf-8"));
const SERVER = `mozaic-mcp-server@${version.split(".")[0]}`;
const SKILLS = readdirSync(join(PACKAGE_DIR, "skills"));

const HELP = `Mozaic Design System installer (skills + MCP server, any coding agent)

Usage:
  npx -y -p ${SERVER} adeo-mozaic-install-tools [command] [flags]

Commands:
  all (default)          Install skills, MCP server and database
  skills                 Install the ${SKILLS.length} skills (and the database their scripts use)
  mcp                    Add the MCP server to your agents' config
  db                     Install/refresh the database at ~/.mozaic/mozaic.db
  list                   Show installed skills and MCP servers
  remove [skills|mcp]    Remove skills, the MCP server, or both

Flags (passed to npx skills / npx add-mcp):
  -g, --global           Install for your user instead of the current project
  -a, --agent <name>     Target an agent (claude-code, codex, cursor, github-copilot, ...), repeatable
  -y, --yes              Skip prompts

Without -g, config is written to the current project so it can be committed and shared.`;

function run(args, command = "npx") {
  const { status } = spawnSync(command, command === "npx" ? ["-y", ...args] : args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (status !== 0) process.exit(status ?? 1);
}

const installSkills = (flags) =>
  run(["skills", "add", PACKAGE_DIR, "--skill", "*", "--copy", ...flags]);
const installMcp = (flags) => run(["add-mcp", SERVER, "--name", "mozaic", ...flags]);
const installDb = () => run([join(PACKAGE_DIR, "bin", "mozaic-db.js")], process.execPath);

const [command = "all", ...rest] = process.argv.slice(2);

switch (command) {
  case "all":
    installSkills(rest);
    installDb();
    installMcp(rest);
    break;
  case "skills":
    installSkills(rest);
    installDb();
    break;
  case "mcp":
    installMcp(rest);
    break;
  case "db":
    installDb();
    break;
  case "list":
  case "status":
    run(["skills", "list", ...rest]);
    run(["add-mcp", "list", ...rest]);
    break;
  case "remove": {
    const target = ["skills", "mcp"].includes(rest[0]) ? rest.shift() : "all";
    if (target !== "mcp") run(["skills", "remove", ...SKILLS, ...rest]);
    if (target !== "skills") run(["add-mcp", "remove", "mozaic", ...rest]);
    break;
  }
  case "help":
  case "--help":
  case "-h":
    console.log(HELP);
    break;
  default:
    console.error(`Unknown command: ${command}\n\n${HELP}`);
    process.exit(1);
}
