import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Step 1: Build frontend
console.log("Building frontend...");
execSync("npx vite build", { stdio: "inherit" });

// Step 2: Bundle API
console.log("Bundling API...");
execSync(
  "npx esbuild api/index.ts --platform=node --bundle --format=cjs --outfile=.vercel/output/functions/api.func/index.js --alias:@contracts=./contracts --alias:@db=./db",
  { stdio: "inherit" }
);

// Step 3: Write function config
const funcConfig = { runtime: "nodejs20.x", handler: "index.js", launcherType: "Nodejs" };
fs.writeFileSync(
  ".vercel/output/functions/api.func/.vc-config.json",
  JSON.stringify(funcConfig, null, 2)
);

// Step 4: Copy static files to .vercel/output/static
console.log("Copying static files...");
fs.cpSync("dist/public", ".vercel/output/static", { recursive: true });

// Step 5: Write output config
const outputConfig = {
  version: 3,
  routes: [
    { src: "/api/(.*)", dest: "/api" },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/index.html" }
  ]
};
fs.mkdirSync(".vercel/output", { recursive: true });
fs.writeFileSync(
  ".vercel/output/config.json",
  JSON.stringify(outputConfig, null, 2)
);

console.log("Vercel build complete!");
