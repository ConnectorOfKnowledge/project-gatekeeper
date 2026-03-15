/**
 * fix-ticketdeck.mjs
 *
 * npm 11 symlinks file: dependencies, which breaks Turbopack on Windows
 * because it tries to resolve TypeScript source files through the symlink.
 *
 * This script runs as a postinstall hook. It detects if node_modules/ticketdeck
 * is a symlink, removes it, rebuilds ticketdeck, and copies the built output
 * (dist + package.json) so Turbopack only sees compiled JS.
 */

import { existsSync, lstatSync, rmSync, mkdirSync, cpSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { execSync } from "child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const nmTicketDeck = join(projectRoot, "node_modules", "ticketdeck");
const ticketDeckSrc = resolve(projectRoot, "..", "ticketdeck");

// If ticketdeck source doesn't exist, skip silently (CI/deployment)
if (!existsSync(ticketDeckSrc)) {
  console.log("[fix-ticketdeck] ticketdeck source not found, skipping");
  process.exit(0);
}

// Check if it's a symlink
let isSymlink = false;
try {
  isSymlink = lstatSync(nmTicketDeck).isSymbolicLink();
} catch {
  // Doesn't exist yet, we'll create it
}

if (!isSymlink && existsSync(nmTicketDeck)) {
  // Already a real directory -- check if dist exists
  if (existsSync(join(nmTicketDeck, "dist", "index.js"))) {
    console.log("[fix-ticketdeck] already a proper copy, skipping");
    process.exit(0);
  }
}

console.log("[fix-ticketdeck] rebuilding ticketdeck...");
try {
  execSync("npm run build", { cwd: ticketDeckSrc, stdio: "inherit" });
} catch (e) {
  console.error("[fix-ticketdeck] build failed:", e.message);
  process.exit(1);
}

// Remove symlink or existing directory
if (existsSync(nmTicketDeck) || isSymlink) {
  console.log("[fix-ticketdeck] removing symlink/old copy...");
  rmSync(nmTicketDeck, { recursive: true, force: true });
}

// Create fresh directory and copy dist + package.json
console.log("[fix-ticketdeck] copying built output...");
mkdirSync(nmTicketDeck, { recursive: true });
cpSync(join(ticketDeckSrc, "dist"), join(nmTicketDeck, "dist"), { recursive: true });
cpSync(join(ticketDeckSrc, "package.json"), join(nmTicketDeck, "package.json"));

// Copy ticketdeck's own dependencies if they exist
const tdNodeModules = join(ticketDeckSrc, "node_modules");
if (existsSync(tdNodeModules)) {
  cpSync(tdNodeModules, join(nmTicketDeck, "node_modules"), { recursive: true });
}

console.log("[fix-ticketdeck] done -- ticketdeck installed as compiled JS");
