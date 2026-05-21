import { Module } from "@nestjs/common";
import { McpController } from "./mcp.controller.js";
import { McpLightController } from "./mcp-light.controller.js";
import { McpService } from "./mcp.service.js";

@Module({
  controllers: [McpController, McpLightController],
  providers: [McpService],
  exports: [McpService],
})
export class McpModule {}
