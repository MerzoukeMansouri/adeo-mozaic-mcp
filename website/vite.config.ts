import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use "/" for local dev, "/mozaic-mcp-server/" for production (GitHub Pages)
  base: mode === "production" ? "/mozaic-mcp-server/" : "/",
  build: {
    outDir: "dist",
  },
  assetsInclude: ["**/*.md", "**/*.db"],
}));
