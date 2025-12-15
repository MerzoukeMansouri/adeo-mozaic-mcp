#!/usr/bin/env tsx

import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import {
  getDatabaseStats,
  initDatabase,
  insertComponents,
  insertCssUtilities,
  insertDocs,
  insertIcons,
  insertTokens,
} from "../src/db/queries.js";
import { parseDocumentation, parseStorybookDocs } from "../src/parsers/docs-parser.js";
import { parseIcons } from "../src/parsers/icons-parser.js";
import { parseReactComponents } from "../src/parsers/react-parser.js";
import { parseCssUtilities } from "../src/parsers/scss-parser.js";
import { parseTokens } from "../src/parsers/tokens-parser.js";
import { parseVueComponents } from "../src/parsers/vue-parser.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PROJECT_ROOT = join(__dirname, "..");
const DATA_DIR = join(PROJECT_ROOT, "data");
const REPOS_DIR = join(PROJECT_ROOT, "repos");
const DB_PATH = join(DATA_DIR, "mozaic.db");

// Repository URLs (using SSH for private repos)
const REPOS = {
  designSystem: {
    url: "git@github.com:adeo/mozaic-design-system.git",
    path: join(REPOS_DIR, "mozaic-design-system"),
  },
  vue: {
    url: "git@github.com:adeo/mozaic-vue.git",
    path: join(REPOS_DIR, "mozaic-vue"),
  },
  react: {
    url: "git@github.com:adeo/mozaic-react.git",
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

async function _buildDesignTokens(): Promise<void> {
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
    throw new Error(
      `Tokens path not found: ${tokensPath}. Make sure the design-system repository was cloned successfully.`
    );
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
    throw new Error(
      `Vue components path not found: ${componentsPath}. Make sure the mozaic-vue repository was cloned successfully.`
    );
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
    throw new Error(
      `React components path not found: ${componentsPath}. Make sure the mozaic-react repository was cloned successfully.`
    );
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
    throw new Error(
      `Documentation path not found: ${docsPath}. Make sure the design-system repository was cloned successfully.`
    );
  }

  const docs = await parseDocumentation(docsPath);

  if (docs.length === 0) {
    throw new Error("No documentation was parsed from the design-system repository.");
  }

  insertDocs(db, docs);

  console.log(`   ✓ Indexed ${docs.length} documentation pages`);
  return docs.length;
}

async function indexCssUtilities(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("🎨 Indexing CSS utilities (layouts & spacing)...");

  const stylesPath = join(REPOS.designSystem.path, "packages", "styles");

  if (!existsSync(stylesPath)) {
    console.log("   ⚠ Styles path not found, skipping CSS utilities");
    return 0;
  }

  const utilities = await parseCssUtilities(stylesPath);

  if (utilities.length === 0) {
    console.log("   ⚠ No CSS utilities parsed");
    return 0;
  }

  insertCssUtilities(db, utilities);

  console.log(`   ✓ Indexed ${utilities.length} CSS utilities`);
  return utilities.length;
}

async function indexStorybookDocs(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("📖 Indexing Storybook documentation (Vue/React)...");

  let totalDocs = 0;

  // Index Vue Storybook docs
  const vueDocsPath = join(REPOS.vue.path, "src", "components");
  if (existsSync(vueDocsPath)) {
    const vueDocs = await parseStorybookDocs(vueDocsPath, "vue", "/vue");
    if (vueDocs.length > 0) {
      insertDocs(db, vueDocs);
      console.log(`   ✓ Indexed ${vueDocs.length} Vue Storybook docs`);
      totalDocs += vueDocs.length;
    }
  }

  // Index React Storybook docs
  const reactDocsPath = join(REPOS.react.path, "src", "stories");
  if (existsSync(reactDocsPath)) {
    const reactDocs = await parseStorybookDocs(reactDocsPath, "react", "/react");
    if (reactDocs.length > 0) {
      insertDocs(db, reactDocs);
      console.log(`   ✓ Indexed ${reactDocs.length} React Storybook docs`);
      totalDocs += reactDocs.length;
    }
  }

  if (totalDocs === 0) {
    console.log("   ⚠ No Storybook docs found");
  }

  return totalDocs;
}

async function indexIcons(db: ReturnType<typeof initDatabase>): Promise<number> {
  console.log("🎯 Indexing icons...");

  const iconsPath = join(REPOS.designSystem.path, "packages", "icons", "js", "icons.js");

  if (!existsSync(iconsPath)) {
    console.log("   ⚠ Icons file not found, skipping icons");
    return 0;
  }

  const icons = await parseIcons(iconsPath);

  if (icons.length === 0) {
    console.log("   ⚠ No icons parsed");
    return 0;
  }

  insertIcons(db, icons);

  // Count unique icon names (without size suffix)
  const uniqueIconNames = new Set(icons.map((i) => i.iconName));
  console.log(`   ✓ Indexed ${icons.length} icons (${uniqueIconNames.size} unique)`);

  return icons.length;
}

function printHeader(): void {
  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║   🎨  MOZAIC MCP SERVER - BUILD                          ║");
  console.log("║                                                          ║");
  console.log("║   Compiling TypeScript & Generating Database             ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
}

async function main(): Promise<void> {
  printHeader();

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
  await indexCssUtilities(db);
  await indexDocumentation(db);
  await indexStorybookDocs(db);
  await indexIcons(db);

  // Print stats
  console.log("\n📊 Database Statistics:");
  const stats = getDatabaseStats(db);
  console.log(`   • Tokens: ${stats.tokens}`);
  console.log(`   • Components: ${stats.components}`);
  console.log(`   • CSS Utilities: ${stats.cssUtilities}`);
  console.log(`   • Documentation: ${stats.documentation}`);
  console.log(`   • Icons: ${stats.icons}`);

  db.close();

  console.log("");
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║                                                          ║");
  console.log("║   ✅  BUILD COMPLETE                                     ║");
  console.log("║                                                          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");
  console.log(`   Database: ${DB_PATH}`);
  console.log("   Run: pnpm start");
  console.log("");
}

main().catch((error) => {
  console.error("❌ Build failed:", error);
  process.exit(1);
});
