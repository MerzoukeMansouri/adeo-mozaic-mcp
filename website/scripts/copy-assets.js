#!/usr/bin/env node

import { cpSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const websiteRoot = join(__dirname, "..");
const projectRoot = join(websiteRoot, "..");

const publicDir = join(websiteRoot, "public");
const assetsDir = join(publicDir, "assets");
const contentDir = join(publicDir, "content");

// Ensure directories exist
mkdirSync(assetsDir, { recursive: true });
mkdirSync(contentDir, { recursive: true });

// Copy SVG assets
const docsAssetsDir = join(projectRoot, "docs", "assets");
if (existsSync(docsAssetsDir)) {
  cpSync(docsAssetsDir, assetsDir, { recursive: true });
  console.log("✓ Copied docs/assets to public/assets");
} else {
  console.log("⚠ docs/assets not found, skipping");
}

// Copy markdown files
const markdownFiles = [
  { src: join(projectRoot, "docs", "ARCHITECTURE.md"), dest: join(contentDir, "ARCHITECTURE.md") },
  { src: join(projectRoot, "docs", "DEVELOPMENT.md"), dest: join(contentDir, "DEVELOPMENT.md") },
  { src: join(projectRoot, "docs", "TEST.md"), dest: join(contentDir, "TEST.md") },
];

for (const { src, dest } of markdownFiles) {
  if (existsSync(src)) {
    cpSync(src, dest);
    console.log(`✓ Copied ${src.split("/").pop()} to public/content`);
  } else {
    console.log(`⚠ ${src.split("/").pop()} not found, skipping`);
  }
}

// Copy database
const dbSrc = join(projectRoot, "data", "mozaic.db");
const dbDest = join(publicDir, "mozaic.db");
if (existsSync(dbSrc)) {
  cpSync(dbSrc, dbDest);
  console.log("✓ Copied mozaic.db to public/");
} else {
  console.log("⚠ mozaic.db not found, skipping (run 'pnpm build' in root first)");
}

console.log("\nAsset copy complete!");
