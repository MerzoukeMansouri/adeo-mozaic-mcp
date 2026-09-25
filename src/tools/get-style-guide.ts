import type Database from "better-sqlite3";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { getStyleGuideBySlug } from "../db/queries.js";

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export interface GetStyleGuideInput {
  slug: string;
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; data: string; mimeType: string };

export function handleGetStyleGuide(
  db: Database.Database,
  input: GetStyleGuideInput
): { content: ContentBlock[] } {
  const { slug } = input;

  if (!slug || slug.trim().length === 0) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "Please provide a style guide slug",
              hint: "Use list_style_guides to find available slugs",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const guide = getStyleGuideBySlug(db, slug);

  if (!guide) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: `Style guide "${slug}" not found`,
              hint: "Use list_style_guides to find available slugs",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  const content: ContentBlock[] = [
    {
      type: "text",
      text: JSON.stringify(
        {
          slug: guide.slug,
          name: guide.name,
          category: guide.category,
          site: guide.site,
          description: guide.description,
          components: guide.components,
          imagePath: guide.imagePath,
        },
        null,
        2
      ),
    },
  ];

  try {
    const imageBuffer = readFileSync(join(PACKAGE_ROOT, guide.imagePath));
    content.push({
      type: "image",
      data: imageBuffer.toString("base64"),
      mimeType: "image/png",
    });
  } catch (error) {
    content.push({
      type: "text",
      text: JSON.stringify({ error: `Could not read screenshot: ${error}` }, null, 2),
    });
  }

  return { content };
}

// Tool definition for MCP
export const getStyleGuideTool = {
  name: "get_style_guide",
  description:
    "Get a specific Mozaic style guide pattern by slug: its description, source site, composed component slugs, and the actual screenshot image. Use list_style_guides first to find slugs.",
  inputSchema: {
    type: "object" as const,
    properties: {
      slug: {
        type: "string",
        description: 'The style guide slug (e.g. "master-detail", "sales-mode-modal")',
      },
    },
    required: ["slug"],
  },
};
