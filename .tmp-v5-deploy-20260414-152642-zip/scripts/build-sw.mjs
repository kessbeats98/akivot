#!/usr/bin/env node
// Build service worker: type-check then bundle src/workers/service-worker.ts → public/sw.js
import { execSync } from "node:child_process";
import { build } from "esbuild";

// Fail fast on type errors
execSync("npx tsc -p tsconfig.sw.json --noEmit", { stdio: "inherit" });

await build({
  entryPoints: ["src/workers/service-worker.ts"],
  outfile: "public/sw.js",
  bundle: true,
  platform: "browser",
  target: "es2017",
  format: "iife",
});

console.log("✓ public/sw.js built");
