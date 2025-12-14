import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import type { Documentation } from "../db/queries.js";

interface ParsedDoc {
  title: string;
  content: string;
  category?: string;
  keywords: string[];
}

// Extract frontmatter from MDX files
function extractFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const body = match[2];

    const frontmatter: Record<string, string> = {};
    const lines = frontmatterStr.split("\n");
    for (const line of lines) {
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line
          .substring(colonIndex + 1)
          .trim()
          .replace(/^['"]|['"]$/g, "");
        frontmatter[key] = value;
      }
    }

    return { frontmatter, body };
  }

  return { frontmatter: {}, body: content };
}

// Extract title from content if not in frontmatter
function extractTitle(content: string): string {
  // Try to find first h1
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1];
  }

  // Try to find MDX heading
  const mdxMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (mdxMatch) {
    return mdxMatch[1];
  }

  return "Untitled";
}

// Extract keywords from content
function extractKeywords(content: string, title: string): string[] {
  const keywords = new Set<string>();

  // Add title words
  title.split(/\s+/).forEach((word) => {
    if (word.length > 2) {
      keywords.add(word.toLowerCase());
    }
  });

  // Extract component names (PascalCase)
  const componentRegex = /\bM[A-Z][a-zA-Z]+/g;
  const componentMatches = content.match(componentRegex);
  if (componentMatches) {
    componentMatches.forEach((match) => keywords.add(match.toLowerCase()));
  }

  // Extract CSS class names
  const cssClassRegex = /\bmc-[a-z0-9-]+/g;
  const cssMatches = content.match(cssClassRegex);
  if (cssMatches) {
    cssMatches.forEach((match) => keywords.add(match));
  }

  // Extract code keywords
  const codeKeywords = ["props", "slots", "events", "emit", "component", "style"];
  codeKeywords.forEach((keyword) => {
    if (content.toLowerCase().includes(keyword)) {
      keywords.add(keyword);
    }
  });

  return Array.from(keywords);
}

// Clean MDX content for storage
function cleanContent(content: string): string {
  // Remove import statements
  let cleaned = content.replace(/^import\s+.*$/gm, "");

  // Remove JSX components but keep their text content
  cleaned = cleaned.replace(/<[A-Z][a-zA-Z]*[^>]*>([\s\S]*?)<\/[A-Z][a-zA-Z]*>/g, "$1");

  // Remove empty code blocks
  cleaned = cleaned.replace(/```\s*```/g, "");

  // Normalize whitespace
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");

  return cleaned.trim();
}

// Infer category from file path
function inferCategory(filePath: string): string {
  const pathLower = filePath.toLowerCase();

  if (pathLower.includes("component")) {
    return "components";
  }
  if (pathLower.includes("foundation") || pathLower.includes("token")) {
    return "foundations";
  }
  if (pathLower.includes("pattern")) {
    return "patterns";
  }
  if (pathLower.includes("getting-started") || pathLower.includes("guide")) {
    return "guides";
  }

  return "other";
}

function parseMdxFile(filePath: string, _basePath: string): ParsedDoc | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter, body } = extractFrontmatter(content);

    const title = frontmatter.title || extractTitle(body);
    const cleanedContent = cleanContent(body);
    const category = frontmatter.category || inferCategory(filePath);
    const keywords = extractKeywords(cleanedContent, title);

    return {
      title,
      content: cleanedContent,
      category,
      keywords,
    };
  } catch (error) {
    console.warn(`Warning: Could not parse ${filePath}:`, error);
    return null;
  }
}

function findMdxFiles(dir: string): string[] {
  const files: string[] = [];

  if (!existsSync(dir)) {
    return files;
  }

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findMdxFiles(fullPath));
    } else if (entry.endsWith(".mdx") || entry.endsWith(".md")) {
      files.push(fullPath);
    }
  }

  return files;
}

// Generate URL path from file path
function generateUrlPath(filePath: string, basePath: string): string {
  let urlPath = relative(basePath, filePath);

  // Remove file extension
  urlPath = urlPath.replace(/\.(mdx?|md)$/, "");

  // Convert to URL format
  urlPath = "/" + urlPath.replace(/\\/g, "/").toLowerCase();

  // Remove index from path
  urlPath = urlPath.replace(/\/index$/, "");

  return urlPath;
}

export async function parseDocumentation(docsPath: string): Promise<Documentation[]> {
  const docs: Documentation[] = [];

  const mdxFiles = findMdxFiles(docsPath);

  for (const file of mdxFiles) {
    const parsed = parseMdxFile(file, docsPath);

    if (parsed) {
      docs.push({
        title: parsed.title,
        path: generateUrlPath(file, docsPath),
        content: parsed.content,
        category: parsed.category,
        keywords: parsed.keywords,
      });
    }
  }

  return docs;
}
