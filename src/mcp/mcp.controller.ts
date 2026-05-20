import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { McpService } from "./mcp.service.js";
import { AuthGuard } from "../auth/auth.guard.js";

interface McpRequest {
  jsonrpc?: string;
  method?: string;
  params?: unknown;
  id?: string | number;
}

interface ToolCallRequest {
  name: string;
  arguments?: Record<string, unknown>;
}

@ApiTags("MCP")
@Controller()
export class McpController {
  constructor(private readonly mcpService: McpService) {}

  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "mozaic-mcp-server",
      version: "2.4.0",
    };
  }

  @Post("mcp")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Main MCP JSON-RPC endpoint" })
  async handleMcpRequest(@Body() body: McpRequest) {
    // Handle JSON-RPC requests
    if (body.jsonrpc === "2.0") {
      return this.mcpService.handleJsonRpcRequest(body);
    }

    // Handle standard MCP protocol messages
    return this.mcpService.handleMcpRequest(body);
  }

  @Get("mcp/info")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get MCP server information" })
  async getServerInfo() {
    return this.mcpService.getServerInfo();
  }

  @Post("mcp/list-tools")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "List available MCP tools" })
  async listTools() {
    return this.mcpService.listTools();
  }

  @Post("mcp/call-tool")
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Call a specific MCP tool" })
  async callTool(@Body() body: ToolCallRequest) {
    return this.mcpService.callTool(body.name, body.arguments);
  }
}
