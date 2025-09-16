#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const [, , command, targetDir, ...flags] = process.argv;

if (command !== "init") {
  console.error("Usage: npx twd-mock init <public-dir> [--save]");
  process.exit(1);
}

if (!targetDir) {
  console.error("❌ You must provide a target public dir");
  process.exit(1);
}

const save = flags.includes("--save");
const src = path.join(__dirname, "../dist/mock-sw.js");
const dest = path.resolve(process.cwd(), targetDir, "mock-sw.js");

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);

console.log(`✅ mock-sw.js copied to ${dest}`);
if (save) {
  console.log("💡 Remember to register it in your app:");
  console.log(`
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/mock-sw.js?v=1");
}
  `);
}