import { readFileSync } from "fs";

// Single source of truth: package.json (one level above both src/ and dist/)
export const VERSION: string = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf-8")
).version;
