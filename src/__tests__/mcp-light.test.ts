import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { resolve } from "path";
import type { ConfigService } from "@nestjs/config";
import { McpLightController } from "../mcp/mcp-light.controller.js";

const config = { get: () => resolve(process.cwd(), "data/mozaic.db") } as unknown as ConfigService;
const light = new McpLightController(config);

describe("MCP Light style guides", () => {
  it("lists the style guide tools", () => {
    const names = light.listTools().tools.map((t) => t.name);
    expect(names).toEqual(expect.arrayContaining(["list_style_guides", "get_style_guide"]));
  });

  it("filters style guides by category", () => {
    const { content } = light.callTool({
      name: "list_style_guides",
      arguments: { category: "data-table" },
    });
    const data = JSON.parse(content[0].text!);
    expect(data.resultCount).toBeGreaterThan(0);
  });

  it("returns a style guide with its screenshot over JSON-RPC", () => {
    const response = light.handleJsonRpc({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name: "get_style_guide", arguments: { slug: "sales-mode-modal" } },
    }) as { result: { content: Array<{ type: string; mimeType?: string }> } };
    expect(response.result.content).toContainEqual(
      expect.objectContaining({ type: "image", mimeType: "image/png" })
    );
  });
});
