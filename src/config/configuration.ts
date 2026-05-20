export default () => ({
  port: parseInt(process.env.PORT || "3000", 10),
  auth: {
    token: process.env.AUTH_TOKEN || "change-me-in-production",
  },
  database: {
    path: process.env.DATABASE_PATH || "/app/data/mozaic.db",
  },
  mcp: {
    debug: process.env.MCP_DEBUG === "true",
    serverPath: process.env.MCP_SERVER_PATH || "/app/dist/index.js",
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || "https://v0.dev,https://*.v0.dev").split(","),
  },
});
