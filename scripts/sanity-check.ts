#!/usr/bin/env tsx

/**
 * Database Sanity Check Script
 * Verifies data integrity and completeness in the Mozaic MCP Server database.
 */

import Database from "better-sqlite3";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, "..", "data", "mozaic.db");

// ANSI colors
const c = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

// Track results
const failures: string[] = [];
let passCount = 0;

function pass(msg: string): void {
  console.log(`   ${c.green}\u2713${c.reset} ${msg}`);
  passCount++;
}

function fail(msg: string): void {
  console.log(`   ${c.red}\u2717${c.reset} ${msg}`);
  failures.push(msg);
}

function warn(msg: string): void {
  console.log(`   ${c.yellow}\u26A0${c.reset} ${msg}`);
}

function section(emoji: string, title: string): void {
  console.log(`\n${emoji} ${c.bold}${title}${c.reset}`);
}

// Expected minimums
const EXPECTED = {
  tokens: { total: 580, color: 400, typography: 50, spacing: 15, grid: 3, properties: 10 },
  components: {
    total: 85,
    vue: 45,
    react: 30,
    vueExamples: 180,
    reactExamples: 40,
    propsPercent: 55,
    slots: 15,
    events: 20,
  },
  cssUtilities: { total: 6, classes: 450, flexy: 150, margin: 80, padding: 80 },
  documentation: { total: 230 },
  icons: { total: 1400, uniqueNames: 300, types: 5 },
};

// ============================================================================
// CHECKS
// ============================================================================

function checkTokens(db: Database.Database): void {
  section("\uD83D\uDCE6", "TOKENS");

  const total = (db.prepare("SELECT COUNT(*) as n FROM tokens").get() as { n: number }).n;
  if (total >= EXPECTED.tokens.total) {
    pass(`${total} tokens indexed`);
  } else {
    fail(`Token count: expected \u2265${EXPECTED.tokens.total}, got ${total}`);
  }

  const categories = db
    .prepare("SELECT category, COUNT(*) as n FROM tokens GROUP BY category ORDER BY n DESC")
    .all() as Array<{ category: string; n: number }>;
  const catMap = new Map(categories.map((c) => [c.category, c.n]));
  const expected = [
    "color",
    "spacing",
    "shadow",
    "border",
    "radius",
    "screen",
    "typography",
    "grid",
  ];
  const missing = expected.filter((c) => !catMap.has(c));

  if (missing.length === 0) {
    pass(
      `${categories.length} categories: ${categories.map((c) => `${c.category}(${c.n})`).join(", ")}`
    );
  } else {
    fail(`Missing categories: ${missing.join(", ")}`);
  }

  const colorCount = catMap.get("color") || 0;
  if (colorCount >= EXPECTED.tokens.color) {
    pass(`${colorCount} color tokens`);
  } else {
    fail(`Color tokens: expected \u2265${EXPECTED.tokens.color}, got ${colorCount}`);
  }

  const typographyCount = catMap.get("typography") || 0;
  if (typographyCount >= EXPECTED.tokens.typography) {
    pass(`${typographyCount} typography tokens`);
  } else {
    fail(`Typography tokens: expected \u2265${EXPECTED.tokens.typography}, got ${typographyCount}`);
  }

  const spacingCount = catMap.get("spacing") || 0;
  if (spacingCount >= EXPECTED.tokens.spacing) {
    pass(`${spacingCount} spacing tokens`);
  } else {
    fail(`Spacing tokens: expected \u2265${EXPECTED.tokens.spacing}, got ${spacingCount}`);
  }

  const gridCount = catMap.get("grid") || 0;
  if (gridCount >= EXPECTED.tokens.grid) {
    pass(`${gridCount} grid tokens`);
  } else {
    fail(`Grid tokens: expected \u2265${EXPECTED.tokens.grid}, got ${gridCount}`);
  }

  const props = (db.prepare("SELECT COUNT(*) as n FROM token_properties").get() as { n: number }).n;
  if (props >= EXPECTED.tokens.properties) {
    pass(`${props} token properties`);
  } else {
    fail(`Token properties: expected \u2265${EXPECTED.tokens.properties}, got ${props}`);
  }

  const nullPath = (
    db.prepare("SELECT COUNT(*) as n FROM tokens WHERE path IS NULL OR path = ''").get() as {
      n: number;
    }
  ).n;
  const nullValue = (
    db
      .prepare("SELECT COUNT(*) as n FROM tokens WHERE value_raw IS NULL OR value_raw = ''")
      .get() as { n: number }
  ).n;
  if (nullPath === 0 && nullValue === 0) {
    pass("All required fields populated");
  } else {
    fail(`Missing fields: ${nullPath} paths, ${nullValue} values`);
  }

  const withCss = (
    db.prepare("SELECT COUNT(*) as n FROM tokens WHERE css_variable IS NOT NULL").get() as {
      n: number;
    }
  ).n;
  const pct = Math.round((withCss / total) * 100);
  if (pct >= 90) {
    pass(`${pct}% have CSS variables`);
  } else {
    warn(`Only ${pct}% have CSS variables`);
  }
}

function checkComponents(db: Database.Database): void {
  section("\uD83E\uDDE9", "COMPONENTS");

  const total = (db.prepare("SELECT COUNT(*) as n FROM components").get() as { n: number }).n;
  if (total >= EXPECTED.components.total) {
    pass(`${total} components indexed`);
  } else {
    fail(`Component count: expected \u2265${EXPECTED.components.total}, got ${total}`);
  }

  const vue = (
    db.prepare("SELECT COUNT(*) as n FROM components WHERE frameworks LIKE '%vue%'").get() as {
      n: number;
    }
  ).n;
  if (vue >= EXPECTED.components.vue) {
    pass(`${vue} Vue components`);
  } else {
    fail(`Vue components: expected \u2265${EXPECTED.components.vue}, got ${vue}`);
  }

  const react = (
    db.prepare("SELECT COUNT(*) as n FROM components WHERE frameworks LIKE '%react%'").get() as {
      n: number;
    }
  ).n;
  if (react >= EXPECTED.components.react) {
    pass(`${react} React components`);
  } else {
    fail(`React components: expected \u2265${EXPECTED.components.react}, got ${react}`);
  }

  const vueEx = (
    db.prepare("SELECT COUNT(*) as n FROM component_examples WHERE framework = 'vue'").get() as {
      n: number;
    }
  ).n;
  if (vueEx >= EXPECTED.components.vueExamples) {
    pass(`${vueEx} Vue examples`);
  } else {
    fail(`Vue examples: expected \u2265${EXPECTED.components.vueExamples}, got ${vueEx}`);
  }

  const reactEx = (
    db.prepare("SELECT COUNT(*) as n FROM component_examples WHERE framework = 'react'").get() as {
      n: number;
    }
  ).n;
  if (reactEx >= EXPECTED.components.reactExamples) {
    pass(`${reactEx} React examples`);
  } else {
    fail(`React examples: expected \u2265${EXPECTED.components.reactExamples}, got ${reactEx}`);
  }

  const totalProps = (
    db.prepare("SELECT COUNT(*) as n FROM component_props").get() as { n: number }
  ).n;
  const withProps = (
    db.prepare("SELECT COUNT(DISTINCT component_id) as n FROM component_props").get() as {
      n: number;
    }
  ).n;
  const propsPct = total > 0 ? Math.round((withProps / total) * 100) : 0;
  if (propsPct >= EXPECTED.components.propsPercent) {
    pass(`${totalProps} props (${propsPct}% of components have props)`);
  } else {
    warn(
      `${propsPct}% of components have props (expected \u2265${EXPECTED.components.propsPercent}%)`
    );
  }

  const slots = (db.prepare("SELECT COUNT(*) as n FROM component_slots").get() as { n: number }).n;
  if (slots >= EXPECTED.components.slots) {
    pass(`${slots} slots`);
  } else {
    fail(`Slots: expected \u2265${EXPECTED.components.slots}, got ${slots}`);
  }

  const events = (db.prepare("SELECT COUNT(*) as n FROM component_events").get() as { n: number })
    .n;
  if (events >= EXPECTED.components.events) {
    pass(`${events} events`);
  } else {
    fail(`Events: expected \u2265${EXPECTED.components.events}, got ${events}`);
  }
}

function checkCssUtilities(db: Database.Database): void {
  section("\uD83C\uDFA8", "CSS UTILITIES");

  const total = (db.prepare("SELECT COUNT(*) as n FROM css_utilities").get() as { n: number }).n;
  if (total === EXPECTED.cssUtilities.total) {
    pass(`${total} CSS utilities`);
  } else {
    fail(`CSS utilities: expected ${EXPECTED.cssUtilities.total}, got ${total}`);
  }

  const utilities = db.prepare("SELECT name, category FROM css_utilities").all() as Array<{
    name: string;
    category: string;
  }>;
  const names = utilities.map((u) => u.name);
  const expected = ["Flexy", "Container", "Margin", "Padding", "Ratio", "Scroll"];
  const missing = expected.filter((n) => !names.includes(n));
  if (missing.length === 0) {
    pass(`All utilities present: ${names.join(", ")}`);
  } else {
    fail(`Missing utilities: ${missing.join(", ")}`);
  }

  const layout = utilities.filter((u) => u.category === "layout").length;
  const utility = utilities.filter((u) => u.category === "utility").length;
  if (layout === 2 && utility === 4) {
    pass(`${layout} layout, ${utility} utility`);
  } else {
    fail(`Category split: expected 2 layout + 4 utility, got ${layout} + ${utility}`);
  }

  const classes = (
    db.prepare("SELECT COUNT(*) as n FROM css_utility_classes").get() as { n: number }
  ).n;
  if (classes >= EXPECTED.cssUtilities.classes) {
    pass(`${classes} CSS classes`);
  } else {
    fail(`CSS classes: expected \u2265${EXPECTED.cssUtilities.classes}, got ${classes}`);
  }

  const classCounts = db
    .prepare(
      `SELECT u.name, COUNT(c.id) as n FROM css_utilities u LEFT JOIN css_utility_classes c ON c.utility_id = u.id GROUP BY u.id`
    )
    .all() as Array<{ name: string; n: number }>;
  const classMap = new Map(classCounts.map((c) => [c.name, c.n]));

  const flexy = classMap.get("Flexy") || 0;
  if (flexy >= EXPECTED.cssUtilities.flexy) {
    pass(`Flexy: ${flexy} classes`);
  } else {
    fail(`Flexy classes: expected \u2265${EXPECTED.cssUtilities.flexy}, got ${flexy}`);
  }

  const margin = classMap.get("Margin") || 0;
  if (margin >= EXPECTED.cssUtilities.margin) {
    pass(`Margin: ${margin} classes`);
  } else {
    fail(`Margin classes: expected \u2265${EXPECTED.cssUtilities.margin}, got ${margin}`);
  }

  const padding = classMap.get("Padding") || 0;
  if (padding >= EXPECTED.cssUtilities.padding) {
    pass(`Padding: ${padding} classes`);
  } else {
    fail(`Padding classes: expected \u2265${EXPECTED.cssUtilities.padding}, got ${padding}`);
  }

  const examples = (
    db.prepare("SELECT COUNT(*) as n FROM css_utility_examples").get() as { n: number }
  ).n;
  const withExamples = (
    db.prepare("SELECT COUNT(DISTINCT utility_id) as n FROM css_utility_examples").get() as {
      n: number;
    }
  ).n;
  if (withExamples === total) {
    pass(`${examples} examples (all utilities covered)`);
  } else {
    fail(`Only ${withExamples}/${total} utilities have examples`);
  }
}

function checkDocumentation(db: Database.Database): void {
  section("\uD83D\uDCDA", "DOCUMENTATION");

  const total = (db.prepare("SELECT COUNT(*) as n FROM documentation").get() as { n: number }).n;
  if (total >= EXPECTED.documentation.total) {
    pass(`${total} pages indexed`);
  } else {
    fail(`Documentation: expected \u2265${EXPECTED.documentation.total}, got ${total}`);
  }

  const emptyTitle = (
    db
      .prepare("SELECT COUNT(*) as n FROM documentation WHERE title IS NULL OR title = ''")
      .get() as { n: number }
  ).n;
  const emptyPath = (
    db.prepare("SELECT COUNT(*) as n FROM documentation WHERE path IS NULL OR path = ''").get() as {
      n: number;
    }
  ).n;
  const emptyContent = (
    db
      .prepare("SELECT COUNT(*) as n FROM documentation WHERE content IS NULL OR content = ''")
      .get() as { n: number }
  ).n;
  if (emptyTitle === 0 && emptyPath === 0 && emptyContent === 0) {
    pass("All required fields populated");
  } else {
    fail(`Missing: ${emptyTitle} titles, ${emptyPath} paths, ${emptyContent} content`);
  }

  const short = (
    db.prepare("SELECT COUNT(*) as n FROM documentation WHERE LENGTH(content) < 50").get() as {
      n: number;
    }
  ).n;
  if (short === 0) {
    pass("All content has meaningful length");
  } else {
    warn(`${short} docs have very short content`);
  }

  const withKeywords = (
    db
      .prepare(
        "SELECT COUNT(*) as n FROM documentation WHERE keywords IS NOT NULL AND keywords != ''"
      )
      .get() as { n: number }
  ).n;
  const pct = Math.round((withKeywords / total) * 100);
  if (pct >= 70) {
    pass(`${pct}% have keywords`);
  } else {
    warn(`Only ${pct}% have keywords`);
  }
}

function checkIcons(db: Database.Database): void {
  section("\uD83C\uDFAF", "ICONS");

  const total = (db.prepare("SELECT COUNT(*) as n FROM icons").get() as { n: number }).n;
  if (total >= EXPECTED.icons.total) {
    pass(`${total} icons indexed`);
  } else {
    fail(`Icon count: expected \u2265${EXPECTED.icons.total}, got ${total}`);
  }

  const uniqueNames = (
    db.prepare("SELECT COUNT(DISTINCT icon_name) as n FROM icons").get() as { n: number }
  ).n;
  if (uniqueNames >= EXPECTED.icons.uniqueNames) {
    pass(`${uniqueNames} unique icon names`);
  } else {
    fail(`Unique icons: expected \u2265${EXPECTED.icons.uniqueNames}, got ${uniqueNames}`);
  }

  const types = db
    .prepare("SELECT type, COUNT(*) as n FROM icons GROUP BY type ORDER BY n DESC")
    .all() as Array<{ type: string; n: number }>;
  if (types.length >= EXPECTED.icons.types) {
    pass(`${types.length} icon types: ${types.map((t) => `${t.type}(${t.n})`).join(", ")}`);
  } else {
    fail(`Icon types: expected \u2265${EXPECTED.icons.types}, got ${types.length}`);
  }

  const sizes = db
    .prepare("SELECT size, COUNT(*) as n FROM icons GROUP BY size ORDER BY size")
    .all() as Array<{ size: number; n: number }>;
  const expectedSizes = [16, 24, 32, 48, 64];
  const missingSizes = expectedSizes.filter((s) => !sizes.some((sz) => sz.size === s));
  if (missingSizes.length === 0) {
    pass(`All sizes present: ${sizes.map((s) => `${s.size}px(${s.n})`).join(", ")}`);
  } else {
    warn(`Missing sizes: ${missingSizes.join(", ")}`);
  }

  const emptyPaths = (
    db.prepare("SELECT COUNT(*) as n FROM icons WHERE paths IS NULL OR paths = ''").get() as {
      n: number;
    }
  ).n;
  if (emptyPaths === 0) {
    pass("All icons have path data");
  } else {
    fail(`${emptyPaths} icons missing path data`);
  }

  // Test icon FTS
  try {
    const iconFts = (
      db.prepare("SELECT COUNT(*) as n FROM icons_fts WHERE icons_fts MATCH 'Arrow*'").get() as {
        n: number;
      }
    ).n;
    if (iconFts > 0) {
      pass(`Icon FTS: "Arrow*" \u2192 ${iconFts} results`);
    } else {
      fail('Icon FTS: "Arrow*" returned 0 results');
    }
  } catch (e) {
    fail(`Icon FTS error: ${e}`);
  }
}

function checkFts(db: Database.Database): void {
  section("\uD83D\uDD0D", "FULL-TEXT SEARCH");

  try {
    const tokenFts = (
      db.prepare("SELECT COUNT(*) as n FROM tokens_fts WHERE tokens_fts MATCH 'primary'").get() as {
        n: number;
      }
    ).n;
    if (tokenFts > 0) {
      pass(`Token FTS: "primary" \u2192 ${tokenFts} results`);
    } else {
      fail('Token FTS: "primary" returned 0 results');
    }
  } catch (e) {
    fail(`Token FTS error: ${e}`);
  }

  try {
    const docFts = (
      db.prepare("SELECT COUNT(*) as n FROM docs_fts WHERE docs_fts MATCH 'button'").get() as {
        n: number;
      }
    ).n;
    if (docFts > 0) {
      pass(`Doc FTS: "button" \u2192 ${docFts} results`);
    } else {
      fail('Doc FTS: "button" returned 0 results');
    }
  } catch (e) {
    fail(`Doc FTS error: ${e}`);
  }

  try {
    const snippet = db
      .prepare(
        "SELECT snippet(docs_fts, 1, '<b>', '</b>', '...', 20) as s FROM docs_fts WHERE docs_fts MATCH 'button' LIMIT 1"
      )
      .get() as { s: string } | undefined;
    if (snippet?.s?.includes("<b>")) {
      pass("FTS snippets working");
    } else {
      warn("FTS snippets may not highlight");
    }
  } catch (e) {
    warn(`FTS snippet error: ${e}`);
  }
}

function checkFkIntegrity(db: Database.Database): void {
  section("\uD83D\uDD17", "FOREIGN KEY INTEGRITY");

  const checks = [
    {
      name: "token_properties \u2192 tokens",
      q: "SELECT COUNT(*) as n FROM token_properties tp WHERE NOT EXISTS (SELECT 1 FROM tokens t WHERE t.id = tp.token_id)",
    },
    {
      name: "component_props \u2192 components",
      q: "SELECT COUNT(*) as n FROM component_props cp WHERE NOT EXISTS (SELECT 1 FROM components c WHERE c.id = cp.component_id)",
    },
    {
      name: "component_slots \u2192 components",
      q: "SELECT COUNT(*) as n FROM component_slots cs WHERE NOT EXISTS (SELECT 1 FROM components c WHERE c.id = cs.component_id)",
    },
    {
      name: "component_events \u2192 components",
      q: "SELECT COUNT(*) as n FROM component_events ce WHERE NOT EXISTS (SELECT 1 FROM components c WHERE c.id = ce.component_id)",
    },
    {
      name: "component_examples \u2192 components",
      q: "SELECT COUNT(*) as n FROM component_examples ce WHERE NOT EXISTS (SELECT 1 FROM components c WHERE c.id = ce.component_id)",
    },
    {
      name: "css_utility_classes \u2192 css_utilities",
      q: "SELECT COUNT(*) as n FROM css_utility_classes cuc WHERE NOT EXISTS (SELECT 1 FROM css_utilities cu WHERE cu.id = cuc.utility_id)",
    },
    {
      name: "css_utility_examples \u2192 css_utilities",
      q: "SELECT COUNT(*) as n FROM css_utility_examples cue WHERE NOT EXISTS (SELECT 1 FROM css_utilities cu WHERE cu.id = cue.utility_id)",
    },
  ];

  let allOk = true;
  for (const { name, q } of checks) {
    try {
      const orphans = (db.prepare(q).get() as { n: number }).n;
      if (orphans === 0) {
        pass(`${name}: OK`);
      } else {
        fail(`${name}: ${orphans} orphans`);
        allOk = false;
      }
    } catch (e) {
      fail(`${name}: error - ${e}`);
      allOk = false;
    }
  }

  if (allOk) pass("All FK relationships valid");
}

// ============================================================================
// MAIN
// ============================================================================

function main(): void {
  console.log(`\n${c.cyan}${c.bold}\uD83D\uDD0D Database Sanity Check${c.reset}`);
  console.log("\u2550".repeat(50));

  if (!existsSync(dbPath)) {
    console.log(`\n${c.red}${c.bold}ERROR:${c.reset} Database not found at ${dbPath}`);
    console.log("Run 'pnpm build' first.\n");
    process.exit(1);
  }

  const db = new Database(dbPath, { readonly: true });
  db.pragma("foreign_keys = ON");

  try {
    checkTokens(db);
    checkComponents(db);
    checkCssUtilities(db);
    checkDocumentation(db);
    checkIcons(db);
    checkFts(db);
    checkFkIntegrity(db);

    console.log("\n" + "\u2550".repeat(50));

    if (failures.length === 0) {
      console.log(`\n${c.green}${c.bold}\u2705 All ${passCount} sanity checks passed!${c.reset}\n`);
      process.exit(0);
    } else {
      console.log(`\n${c.red}${c.bold}\u274C ${failures.length} FAILURES:${c.reset}`);
      for (const f of failures) {
        console.log(`   ${c.red}\u2022${c.reset} ${f}`);
      }
      console.log(
        `\n${c.green}${passCount} passed${c.reset}, ${c.red}${failures.length} failed${c.reset}\n`
      );
      process.exit(1);
    }
  } finally {
    db.close();
  }
}

main();
