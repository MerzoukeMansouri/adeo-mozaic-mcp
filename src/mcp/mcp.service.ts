import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

interface McpMessage {
  id?: string | number;
  method?: string;
  result?: unknown;
  error?: {
    message?: string;
  };
}

interface McpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

interface McpServerInfo {
  capabilities?: Record<string, unknown>;
}

interface McpRequest {
  jsonrpc?: string;
  method?: string;
  params?: unknown;
  id?: string | number;
  type?: string;
}

@Injectable()
export class McpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(McpService.name);
  private mcpProcess: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string | number, PendingRequest>();
  private eventEmitter = new EventEmitter();
  private serverInfo: McpServerInfo | null = null;
  private tools: McpTool[] = [];

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.startMcpServer();
    await this.initializeServerInfo();
  }

  async onModuleDestroy() {
    this.stopMcpServer();
  }

  private async startMcpServer() {
    const serverPath = this.configService.get<string>("mcp.serverPath", "/app/dist/index.js");
    const databasePath = this.configService.get<string>("database.path");

    this.logger.log(`Starting MCP server from ${serverPath}`);

    // Spawn the MCP server process
    this.mcpProcess = spawn("node", [serverPath], {
      env: {
        ...process.env,
        DATABASE_PATH: databasePath,
        MCP_MODE: "stdio",
      },
      stdio: ["pipe", "pipe", "pipe"],
    });

    // Handle stdout (MCP responses)
    this.mcpProcess.stdout?.on("data", (data) => {
      try {
        const lines = data.toString().split("\n").filter(Boolean);
        for (const line of lines) {
          const message = JSON.parse(line);
          this.handleMcpMessage(message);
        }
      } catch (error) {
        this.logger.error("Failed to parse MCP message:", error);
      }
    });

    // Handle stderr (logging)
    this.mcpProcess.stderr?.on("data", (data) => {
      if (this.configService.get<boolean>("mcp.debug")) {
        this.logger.debug(`MCP Server: ${data.toString()}`);
      }
    });

    // Handle process exit
    this.mcpProcess.on("exit", (code) => {
      this.logger.warn(`MCP server exited with code ${code}`);
      this.mcpProcess = null;

      // Reject all pending requests
      for (const [, { reject }] of this.pendingRequests) {
        reject(new Error("MCP server process exited"));
      }
      this.pendingRequests.clear();
    });

    // Wait for server to be ready
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        this.logger.error("MCP server startup timeout");
        resolve();
      }, 5000);

      this.eventEmitter.once("ready", () => {
        clearTimeout(timeout);
        this.logger.log("MCP server is ready");
        resolve();
      });
    });
  }

  private stopMcpServer() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
  }

  private handleMcpMessage(message: McpMessage) {
    // Check if this is a response to a pending request
    if (message.id !== undefined && this.pendingRequests.has(message.id)) {
      const pendingRequest = this.pendingRequests.get(message.id);
      if (pendingRequest) {
        const { resolve } = pendingRequest;
        this.pendingRequests.delete(message.id);
        resolve(message);
      }
      return;
    }

    // Check if this is a notification
    if (message.method && !message.id) {
      this.handleNotification(message);
      return;
    }

    // Handle other message types
    if (message.method === "initialize" && message.result) {
      this.eventEmitter.emit("ready");
    }
  }

  private handleNotification(message: McpMessage) {
    this.logger.debug(`Received notification: ${message.method}`);
    // Handle specific notifications if needed
  }

  private async sendRequest(method: string, params?: unknown): Promise<McpMessage> {
    if (!this.mcpProcess || !this.mcpProcess.stdin) {
      throw new Error("MCP server is not running");
    }

    const id = ++this.requestId;
    const request = {
      jsonrpc: "2.0",
      id,
      method,
      params: params || {},
    };

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });

      // Send request to MCP server
      if (this.mcpProcess?.stdin) {
        this.mcpProcess.stdin.write(JSON.stringify(request) + "\n");
      }

      // Set timeout
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`Request timeout: ${method}`));
        }
      }, 30000); // 30 second timeout
    });
  }

  private async initializeServerInfo() {
    try {
      // Initialize connection
      const initResponse = await this.sendRequest("initialize", {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "mozaic-mcp-nestjs",
          version: "2.4.0",
        },
      });

      this.serverInfo = initResponse.result as McpServerInfo;

      // Get list of tools
      const toolsResponse = await this.sendRequest("tools/list");
      this.tools = (toolsResponse.result as { tools?: McpTool[] })?.tools || [];

      this.logger.log(`Loaded ${this.tools.length} MCP tools`);
    } catch (error) {
      this.logger.error("Failed to initialize MCP server info:", error);
    }
  }

  async handleJsonRpcRequest(request: McpRequest): Promise<unknown> {
    try {
      // Forward the request to the MCP server
      const response = await this.sendRequest(request.method || "", request.params);

      return {
        jsonrpc: "2.0",
        id: request.id,
        result: response.result,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Internal error";
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: errorMessage,
        },
      };
    }
  }

  async handleMcpRequest(request: McpRequest): Promise<unknown> {
    // Handle direct MCP protocol messages
    return this.sendRequest(request.method || request.type || "", request.params || request);
  }

  async getServerInfo(): Promise<unknown> {
    return {
      info: this.serverInfo,
      tools: this.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
      capabilities: this.serverInfo?.capabilities || {},
    };
  }

  async listTools(): Promise<unknown> {
    return {
      tools: this.tools,
    };
  }

  async callTool(name: string, args?: Record<string, unknown>): Promise<unknown> {
    const tool = this.tools.find((t) => t.name === name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    const response = await this.sendRequest("tools/call", {
      name,
      arguments: args || {},
    });

    if (response.error) {
      throw new Error(response.error.message || "Tool execution failed");
    }

    return response.result;
  }
}
