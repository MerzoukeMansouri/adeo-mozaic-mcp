import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { McpModule } from "./mcp/mcp.module.js";
import { AuthModule } from "./auth/auth.module.js";
import configuration from "./config/configuration.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: [".env", ".env.local"],
    }),
    AuthModule,
    McpModule,
  ],
})
export class AppModule {}
