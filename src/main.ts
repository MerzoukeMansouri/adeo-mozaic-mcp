import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import configuration from "./config/configuration.js";
import { VERSION } from "./version.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // CORS_ORIGINS (comma-separated); "*" in an entry is a wildcard, e.g. https://*.v0.dev
  const origins = configuration().cors.origins.map((origin) =>
    origin.includes("*")
      ? new RegExp(`^${origin.trim().replace(/\./g, "\\.").replace(/\*/g, "[a-z0-9-]+")}$`)
      : origin.trim()
  );
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle("Mozaic MCP Server")
    .setDescription("Model Context Protocol server for Mozaic Design System")
    .setVersion(VERSION)
    .addBearerAuth()
    .addTag("MCP", "Model Context Protocol endpoints")
    .addTag("Health", "Health check endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // Graceful shutdown
  app.enableShutdownHooks();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Mozaic MCP Server is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api`);
  console.log(`🔌 MCP endpoint: http://localhost:${port}/mcp`);
  console.log(`❤️  Health check: http://localhost:${port}/health`);
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
