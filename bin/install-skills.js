#!/usr/bin/env node

// Kept for backward compatibility: `mozaic-skills [uninstall]` maps to
// `adeo-mozaic-install-tools skills` / `adeo-mozaic-install-tools remove skills`.
const [first, ...rest] = process.argv.slice(2);
const command =
  first === "uninstall" || first === "uninstall-skills"
    ? ["remove", "skills", ...rest]
    : ["skills", ...(first && first !== "install" && first !== "install-skills" ? [first] : []), ...rest];
process.argv = [...process.argv.slice(0, 2), ...command];
await import("./install.js");
