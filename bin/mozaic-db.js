#!/usr/bin/env node

// Copies the database shipped in this package to a harness-neutral location
// used by the skills' shell scripts. Usage: mozaic-db [destination]

import { copyFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const source = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "mozaic.db");
const dest = process.argv[2] || process.env.MOZAIC_DB_PATH || join(homedir(), ".mozaic", "mozaic.db");

mkdirSync(dirname(dest), { recursive: true });
copyFileSync(source, dest);
console.log(`Mozaic database installed at ${dest}`);
