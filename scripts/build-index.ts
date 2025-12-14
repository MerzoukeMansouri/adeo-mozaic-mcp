#!/usr/bin/env tsx

import { existsSync, mkdirSync, rmSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

import {
  initDatabase,
  insertTokens,
  insertComponents,
  insertDocs,
  getDatabaseStats,
} from "../src/db/queries.js";
import { parseTokens } from "../src/parsers/tokens-parser.js";
import { parseVueComponents } from "../src/parsers/vue-parser.js";
import { parseReactComponents } from "../src/parsers/react-parser.js";
import { parseDocumentation } from "../src/parsers/docs-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const DATA_DIR = join(PROJECT_ROOT, "data");
const REPOS_DIR = join(PROJECT_ROOT, "repos");
const DB_PATH = join(DATA_DIR, "mozaic.db");

// Repository URLs
const REPOS = {
  designSystem: {
    url: "https://github.com/adeo/mozaic-design-system.git",
    path: join(REPOS_DIR, "mozaic-design-system"),
  },
  vue: {
    url: "https://github.com/adeo/mozaic-vue.git",
    path: join(REPOS_DIR, "mozaic-vue"),
  },
  react: {
    url: "https://github.com/adeo/mozaic-react.git",
    path: join(REPOS_DIR, "mozaic-react"),
  },
};

async function cloneRepositories(): Promise<void> {
  console.log("📥 Cloning repositories...");

  if (!existsSync(REPOS_DIR)) {
    mkdirSync(REPOS_DIR, { recursive: true });
  }

  for (const [name, repo] of Object.entries(REPOS)) {
    if (existsSync(repo.path)) {
      console.log(`   ✓ ${name} already cloned, pulling latest...`);
      try {
        execSync("git pull", { cwd: repo.path, stdio: "pipe" });
      } catch {
        console.log(`   ⚠ Could not pull ${name}, using existing version`);
      }
    } else {
      console.log(`   Cloning ${name}...`);
      try {
        execSync(`git clone --depth 1 ${repo.url} ${repo.path}`, {
          stdio: "pipe",
        });
        console.log(`   ✓ Cloned ${name}`);
      } catch (error) {
        console.log(`   ⚠ Could not clone ${name}: ${error}`);
      }
    }
  }
}

async function buildDesignTokens(): Promise<void> {
  console.log("🔧 Building design tokens...");

  const designSystemPath = REPOS.designSystem.path;

  if (!existsSync(designSystemPath)) {
    console.log("   ⚠ Design system repo not found, skipping token build");
    return;
  }

  try {
    // Install dependencies and build tokens
    console.log("   Installing dependencies...");
    execSync("npm install --legacy-peer-deps", {
      cwd: designSystemPath,
      stdio: "pipe",
    });

    console.log("   Building tokens...");
    execSync("npm run tokens:build", { cwd: designSystemPath, stdio: "pipe" });

    console.log("   ✓ Tokens built successfully");
  } catch (error) {
    console.log(`   ⚠ Could not build tokens: ${error}`);
    console.log("   Will use pre-existing token files if available");
  }
}

async function indexTokens(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("📦 Indexing design tokens...");

  const tokensPath = join(REPOS.designSystem.path, "packages", "tokens");

  if (!existsSync(tokensPath)) {
    throw new Error(`Tokens path not found: ${tokensPath}. Make sure the design-system repository was cloned successfully.`);
  }

  const tokens = await parseTokens(tokensPath);

  if (tokens.length === 0) {
    throw new Error("No tokens were parsed from the design-system repository.");
  }

  insertTokens(db, tokens);

  console.log(`   ✓ Indexed ${tokens.length} tokens`);
  return tokens.length;
}

async function indexVueComponents(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("🧩 Indexing Vue components...");

  const componentsPath = join(REPOS.vue.path, "src", "components");

  if (!existsSync(componentsPath)) {
    throw new Error(`Vue components path not found: ${componentsPath}. Make sure the mozaic-vue repository was cloned successfully.`);
  }

  const components = await parseVueComponents(componentsPath);

  if (components.length === 0) {
    throw new Error("No Vue components were parsed from the mozaic-vue repository.");
  }

  insertComponents(db, components);

  console.log(`   ✓ Indexed ${components.length} Vue components`);
  return components.length;
}

async function indexReactComponents(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("⚛️  Indexing React components...");

  const componentsPath = join(REPOS.react.path, "src", "components");

  if (!existsSync(componentsPath)) {
    throw new Error(`React components path not found: ${componentsPath}. Make sure the mozaic-react repository was cloned successfully.`);
  }

  const components = await parseReactComponents(componentsPath);

  if (components.length === 0) {
    throw new Error("No React components were parsed from the mozaic-react repository.");
  }

  insertComponents(db, components);

  console.log(`   ✓ Indexed ${components.length} React components`);
  return components.length;
}

async function indexDocumentation(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("📚 Indexing documentation...");

  const docsPath = join(REPOS.designSystem.path, "src", "docs");

  if (!existsSync(docsPath)) {
    throw new Error(`Documentation path not found: ${docsPath}. Make sure the design-system repository was cloned successfully.`);
  }

  const docs = await parseDocumentation(docsPath);

  if (docs.length === 0) {
    throw new Error("No documentation was parsed from the design-system repository.");
  }

  insertDocs(db, docs);

  console.log(`   ✓ Indexed ${docs.length} documentation pages`);
  return docs.length;
}

async function main(): Promise<void> {
  console.log("🔧 Building Mozaic MCP index...\n");

  // Create data directory
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  // Remove existing database
  if (existsSync(DB_PATH)) {
    console.log("🗑️  Removing existing database...");
    rmSync(DB_PATH);
    // Also remove WAL files if they exist
    if (existsSync(`${DB_PATH}-wal`)) rmSync(`${DB_PATH}-wal`);
    if (existsSync(`${DB_PATH}-shm`)) rmSync(`${DB_PATH}-shm`);
  }

  // Clone repositories
  await cloneRepositories();
  console.log("");

  // Build design tokens (optional, uses pre-built if fails)
  // await buildDesignTokens();
  // console.log("");

  // Initialize database
  console.log("💾 Initializing database...");
  const db = initDatabase(DB_PATH);
  console.log(`   ✓ Database created at ${DB_PATH}\n`);

  // Index all data
  await indexTokens(db);
  await indexVueComponents(db);
  await indexReactComponents(db);
  await indexDocumentation(db);

  // Print stats
  console.log("\n📊 Database Statistics:");
  const stats = getDatabaseStats(db);
  console.log(`   • Tokens: ${stats.tokens}`);
  console.log(`   • Components: ${stats.components}`);
  console.log(`   • Documentation: ${stats.documentation}`);

  db.close();

  console.log("\n✅ Index build complete!");
  console.log(`\nDatabase saved to: ${DB_PATH}`);
  console.log("\nYou can now start the MCP server with: npm start");
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
