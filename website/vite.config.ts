import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Use "/" for local dev, "/adeo-mozaic-mcp/" for production (GitHub Pages)
  base: mode === "production" ? "/adeo-mozaic-mcp/" : "/",
  build: {
    outDir: "dist",
  },
  assetsInclude: ["**/*.md", "**/*.db"],
}));
