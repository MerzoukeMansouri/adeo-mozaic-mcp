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
  clearDatabase,
  type Component,
} from "../src/db/queries.js";
import { parseTokens } from "../src/parsers/tokens-parser.js";
import { parseVueComponents, MOZAIC_COMPONENTS } from "../src/parsers/vue-parser.js";
import { parseReactComponents, MOZAIC_REACT_COMPONENTS } from "../src/parsers/react-parser.js";
import { parseDocumentation, MOZAIC_DOCS } from "../src/parsers/docs-parser.js";

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
    console.log("   ⚠ Tokens path not found, using sample tokens");
    // Insert sample tokens
    const sampleTokens = [
      { category: "color", path: "color.primary-01.100", value: "#78be20", description: "Primary green" },
      { category: "color", path: "color.primary-01.200", value: "#5a8f18", description: "Primary green dark" },
      { category: "color", path: "color.primary-02.100", value: "#0066cc", description: "Primary blue" },
      { category: "color", path: "color.secondary-blue.100", value: "#0066cc", description: "Secondary blue" },
      { category: "color", path: "color.danger.100", value: "#df382b", description: "Danger/error red" },
      { category: "color", path: "color.success.100", value: "#3aaa35", description: "Success green" },
      { category: "color", path: "color.warning.100", value: "#ffbe00", description: "Warning yellow" },
      { category: "color", path: "color.info.100", value: "#2196f3", description: "Info blue" },
      { category: "size", path: "size.space.01", value: "4px", description: "Base spacing unit" },
      { category: "size", path: "size.space.02", value: "8px", description: "2x spacing" },
      { category: "size", path: "size.space.03", value: "12px", description: "3x spacing" },
      { category: "size", path: "size.space.04", value: "16px", description: "4x spacing" },
      { category: "size", path: "size.space.05", value: "24px", description: "5x spacing" },
      { category: "size", path: "size.space.06", value: "32px", description: "6x spacing" },
      { category: "font", path: "font.size.xs", value: "12px", description: "Extra small font" },
      { category: "font", path: "font.size.s", value: "14px", description: "Small font" },
      { category: "font", path: "font.size.m", value: "16px", description: "Medium font (base)" },
      { category: "font", path: "font.size.l", value: "18px", description: "Large font" },
      { category: "font", path: "font.size.xl", value: "24px", description: "Extra large font" },
      { category: "font", path: "font.weight.regular", value: "400", description: "Regular weight" },
      { category: "font", path: "font.weight.semi-bold", value: "600", description: "Semi-bold weight" },
      { category: "font", path: "font.weight.bold", value: "700", description: "Bold weight" },
    ];
    insertTokens(db, sampleTokens);
    return sampleTokens.length;
  }

  const tokens = await parseTokens(tokensPath);
  insertTokens(db, tokens);

  console.log(`   ✓ Indexed ${tokens.length} tokens`);
  return tokens.length;
}

async function indexVueComponents(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("🧩 Indexing Vue components...");

  const componentsPath = join(REPOS.vue.path, "src", "components");

  let components: Component[] = [];

  if (existsSync(componentsPath)) {
    components = await parseVueComponents(componentsPath);
  }

  // If no components were parsed, use the default list
  if (components.length === 0) {
    console.log("   ⚠ Using default Vue component list");
    components = MOZAIC_COMPONENTS.map((c) => ({
      name: c.name!,
      slug: c.slug!,
      category: c.category,
      description: c.description,
      frameworks: ["vue"],
      props: [],
      slots: [],
      events: [],
      examples: [],
      cssClasses: [],
    }));
  }

  insertComponents(db, components);

  console.log(`   ✓ Indexed ${components.length} Vue components`);
  return components.length;
}

async function indexReactComponents(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("⚛️  Indexing React components...");

  const componentsPath = join(REPOS.react.path, "src", "components");

  let components: Component[] = [];

  if (existsSync(componentsPath)) {
    components = await parseReactComponents(componentsPath);
  }

  // If no components were parsed, use the default list
  if (components.length === 0) {
    console.log("   ⚠ Using default React component list");
    components = MOZAIC_REACT_COMPONENTS.map((c) => ({
      name: c.name!,
      slug: c.slug!,
      category: c.category,
      description: c.description,
      frameworks: ["react"],
      props: [],
      slots: [],
      events: [],
      examples: [],
      cssClasses: [],
    }));
  }

  insertComponents(db, components);

  console.log(`   ✓ Indexed ${components.length} React components`);
  return components.length;
}

async function indexDocumentation(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("📚 Indexing documentation...");

  const docsPath = join(REPOS.designSystem.path, "src", "docs");

  let docs = await parseDocumentation(docsPath);

  // Add fallback docs if none were parsed
  if (docs.length === 0) {
    console.log("   ⚠ Using default documentation");
    docs = MOZAIC_DOCS;
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
