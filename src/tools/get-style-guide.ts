import type Database from "better-sqlite3";
import { getStyleGuideBySlug, getStyleGuideImage } from "../db/queries.js";

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

  const image = getStyleGuideImage(db, guide.slug);
  content.push(
    image
      ? { type: "image", data: image.toString("base64"), mimeType: "image/png" }
      : { type: "text", text: JSON.stringify({ error: "Screenshot missing from database" }) }
  );

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
        description: 'The style guide slug (e.g. "project-detail", "sales-mode-modal")',
      },
    },
    required: ["slug"],
  },
};
