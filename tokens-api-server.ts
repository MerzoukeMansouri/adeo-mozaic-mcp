#!/usr/bin/env node

import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import {
  getTokensByCategory,
  getCssUtility,
  listCssUtilities,
  searchIcons,
  getIconByName,
} from "./src/db/queries.js";
import type { Token } from "./src/db/queries.js";
import { mapCategoryToDbCategories } from "./src/parsers/tokens-parser.js";
import { generateSvg } from "./src/parsers/icons-parser.js";

const PORT = parseInt(process.env.PORT || "3000", 10);
const DATABASE_PATH = process.env.DATABASE_PATH || "./data/mozaic.db";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "change-me-in-production";
const CORS_ORIGINS = (process.env.CORS_ORIGINS || "https://v0.dev,https://*.v0.dev").split(",");

// Token formatting functions
function formatAsScss(tokens: Token[]): string {
  const lines: string[] = [];
  for (const token of tokens) {
    const varName = token.scssVariable || `$${token.path.replace(/\./g, "-")}`;
    lines.push(`${varName}: ${token.valueRaw};`);
  }
  return lines.join("\n");
}

function formatAsCss(tokens: Token[]): string {
  const lines: string[] = [":root {"];
  for (const token of tokens) {
    const varName = token.cssVariable || `--${token.path.replace(/\./g, "-")}`;
    lines.push(`  ${varName}: ${token.valueRaw};`);
  }
  lines.push("}");
  return lines.join("\n");
}

function formatAsJs(tokens: Token[]): string {
  const obj: Record<string, unknown> = {};

  for (const token of tokens) {
    const parts = token.path.split(".");
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!(part in current)) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }

    current[parts[parts.length - 1]] = token.valueRaw;
  }

  return `export const tokens = ${JSON.stringify(obj, null, 2)};`;
}

function formatAsJson(tokens: Token[]) {
  return tokens.map((t) => ({
    category: t.category,
    subcategory: t.subcategory,
    name: t.name,
    path: t.path,
    value: t.valueRaw,
    valueComputed: t.valueComputed,
    cssVariable: t.cssVariable,
    scssVariable: t.scssVariable,
    description: t.description,
  }));
}

// Initialize database
const db = new Database(DATABASE_PATH);

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const allowed = CORS_ORIGINS.some((pattern) => {
        if (pattern.includes("*")) {
          const regex = new RegExp(pattern.replace(/\*/g, ".*"));
          return regex.test(origin);
        }
        return pattern === origin;
      });

      if (allowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

// Auth middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;

  // Skip auth in development mode if no token is configured
  if (process.env.NODE_ENV === "development" && AUTH_TOKEN === "change-me-in-production") {
    console.warn("⚠️  Authentication skipped in development mode");
    return next();
  }

  if (!authHeader) {
    return res.status(401).json({ error: "Missing authorization header" });
  }

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  if (token !== AUTH_TOKEN) {
    return res.status(401).json({ error: "Invalid token" });
  }

  next();
}

app.use(authMiddleware);

// Routes
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/utilities", (_req, res) => {
  try {
    const utilities = listCssUtilities(db, "all");
    const output = utilities.map((u) => ({
      name: u.name,
      slug: u.slug,
      category: u.category,
      description: u.description,
      classCount: u.classCount,
    }));
    res.json(output);
  } catch (error) {
    console.error("Error handling /utilities request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/utilities/:name", (req, res) => {
  try {
    const { name } = req.params;
    const { includeClasses = "true" } = req.query;

    const utility = getCssUtility(db, name.toLowerCase());

    if (!utility) {
      return res.status(404).json({
        error: `CSS utility not found: ${name}`,
        available: ["flexy", "container", "margin", "padding", "ratio", "scroll"],
      });
    }

    const output = {
      name: utility.name,
      category: utility.category,
      description: utility.description,
      classes: includeClasses === "true" ? utility.classes : [],
      examples: utility.examples.map((e) => ({
        title: e.title,
        code: e.code,
      })),
    };

    res.json(output);
  } catch (error) {
    console.error("Error handling /utilities/:name request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/icons/search", (req, res) => {
  try {
    const { query, type, size, limit = "20" } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Missing required parameter: query",
        example: "/icons/search?query=arrow&type=navigation&size=24",
      });
    }

    const searchLimit = parseInt(limit as string, 10);
    const searchSize = size ? parseInt(size as string, 10) : undefined;

    // Build FTS query
    const terms = query
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 1);
    const ftsQuery = terms.length > 0 ? terms.map((t) => `${t}*`).join(" OR ") : `${query}*`;

    const results = searchIcons(db, ftsQuery, {
      type: type as string,
      size: searchSize,
      limit: searchLimit,
    });

    // Group by icon name
    const grouped = new Map<string, { iconName: string; type: string; sizes: number[] }>();
    for (const icon of results) {
      const key = icon.iconName;
      if (!grouped.has(key)) {
        grouped.set(key, {
          iconName: icon.iconName,
          type: icon.type,
          sizes: [],
        });
      }
      grouped.get(key)?.sizes.push(icon.size);
    }

    const output = {
      query,
      resultCount: results.length,
      uniqueIcons: grouped.size,
      icons: Array.from(grouped.values()).map((g) => ({
        name: g.iconName,
        type: g.type,
        availableSizes: g.sizes.sort((a, b) => a - b),
      })),
    };

    res.json(output);
  } catch (error) {
    console.error("Error handling /icons/search request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/icons/:name", (req, res) => {
  try {
    const { name } = req.params;
    const { format = "svg" } = req.query;

    let icon = getIconByName(db, name);

    // Try with size suffixes if not found
    if (!icon) {
      for (const size of [16, 24, 32, 48, 64]) {
        icon = getIconByName(db, `${name}${size}`);
        if (icon) break;
      }
    }

    if (!icon) {
      return res.status(404).json({
        error: `Icon not found: ${name}`,
        hint: "Use /icons/search?query=yourquery to find icons",
      });
    }

    const parsedIcon = {
      name: icon.name,
      iconName: icon.iconName,
      type: icon.type,
      size: icon.size,
      viewBox: icon.viewBox,
      paths: icon.paths,
    };

    if (format === "svg") {
      res.type("image/svg+xml");
      res.send(generateSvg(parsedIcon));
    } else {
      res.json({
        name: icon.name,
        iconName: icon.iconName,
        type: icon.type,
        size: icon.size,
        viewBox: icon.viewBox,
        svg: generateSvg(parsedIcon),
        rawPaths: icon.paths,
      });
    }
  } catch (error) {
    console.error("Error handling /icons/:name request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/tokens", (req, res) => {
  try {
    const { category, format = "json" } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Missing required field: category" });
    }

    const validCategories = [
      "colors",
      "typography",
      "spacing",
      "shadows",
      "borders",
      "screens",
      "grid",
      "all",
    ];
    if (!validCategories.includes(category)) {
      return res
        .status(400)
        .json({ error: `Invalid category. Must be one of: ${validCategories.join(", ")}` });
    }

    const validFormats = ["json", "scss", "css", "js"];
    if (!validFormats.includes(format)) {
      return res
        .status(400)
        .json({ error: `Invalid format. Must be one of: ${validFormats.join(", ")}` });
    }

    let tokens: Token[] = [];

    if (category === "all") {
      tokens = getTokensByCategory(db, "all");
    } else {
      const dbCategories = mapCategoryToDbCategories(category);
      for (const cat of dbCategories) {
        tokens.push(...getTokensByCategory(db, cat));
      }
    }

    if (tokens.length === 0) {
      return res.status(404).json({ error: `No tokens found for category: ${category}` });
    }

    let output: string | Record<string, unknown>[];

    switch (format) {
      case "scss":
        output = formatAsScss(tokens);
        res.type("text/plain");
        break;
      case "css":
        output = formatAsCss(tokens);
        res.type("text/css");
        break;
      case "js":
        output = formatAsJs(tokens);
        res.type("text/javascript");
        break;
      case "json":
      default:
        output = formatAsJson(tokens);
        break;
    }

    res.json(output);
  } catch (error) {
    console.error("Error handling /tokens request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mozaic Tokens API server running on port ${PORT}`);
  console.log(`   Database: ${DATABASE_PATH}`);
  console.log(`   CORS origins: ${CORS_ORIGINS.join(", ")}`);
  console.log(
    `   Auth: ${AUTH_TOKEN === "change-me-in-production" ? "⚠️  Using default token" : "✓ Custom token"}`
  );
});
