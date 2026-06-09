#!/usr/bin/env bun
// Pack the most recently exported PNGs into a named folder + zip.
// Workflow:
//   1. Click "Export All" in http://localhost:3333 → 7 PNGs land in ~/Downloads
//   2. Run: bun run pack [name]
//      → moves 01-hook.png ... 07-cta.png into ~/Downloads/<name>/
//      → zips into ~/Downloads/<name>.zip
//      → reveals in Finder

import { existsSync, mkdirSync, renameSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import { homedir } from "os";

const name = process.argv[2]?.trim() || `carousel-${Date.now()}`;
if (!/^[A-Za-z0-9._-]+$/.test(name)) {
  console.error(`Invalid name: "${name}". Use letters, numbers, dots, dashes, underscores only.`);
  process.exit(1);
}

const downloads = join(homedir(), "Downloads");
const out = join(downloads, name);
mkdirSync(out, { recursive: true });

// Find the 7 most recent slide PNGs in Downloads
// Allow optional " (N)" suffix for Chrome-renamed duplicates
const pattern = /^(0[1-9]-(hook|body|cta|image|emoji|number|list|stats|quote|checklist|process|comparison))(?: \(\d+\))?\.png$/;
const candidates = readdirSync(downloads)
  .map((f) => ({ raw: f, match: f.match(pattern) }))
  .filter((c): c is { raw: string; match: RegExpMatchArray } => c.match !== null)
  .map((c) => ({
    raw: c.raw,
    cleanName: `${c.match[1]}.png`,
    mtime: statSync(join(downloads, c.raw)).mtimeMs,
  }))
  .sort((a, b) => b.mtime - a.mtime);

if (candidates.length === 0) {
  console.error("No slide PNGs found in ~/Downloads.");
  console.error("Click Export All in http://localhost:3333 first, then re-run.");
  process.exit(1);
}

// Take only the latest batch (within 30 seconds of newest file).
// If duplicates of the same cleanName exist, keep only the newest.
const newest = candidates[0].mtime;
const seen = new Set<string>();
const batch = candidates
  .filter((c) => newest - c.mtime < 30_000)
  .filter((c) => {
    if (seen.has(c.cleanName)) return false;
    seen.add(c.cleanName);
    return true;
  });

console.log(`Found ${batch.length} fresh PNGs. Moving to ${out}\n`);
for (const c of batch) {
  const src = join(downloads, c.raw);
  const dst = join(out, c.cleanName);
  renameSync(src, dst);
  console.log(`  ${c.raw} → ${c.cleanName}`);
}

// Zip it (uses macOS `zip` — argv array, no shell interpolation)
const zipName = `${name}.zip`;
console.log(`\nZipping ${zipName}...`);
execFileSync("zip", ["-r", zipName, name], { cwd: downloads, stdio: "inherit" });

// Reveal in Finder
const zipPath = join(downloads, zipName);
execFileSync("open", ["-R", zipPath]);

console.log(`\nDone.`);
console.log(`  Folder: ${out}`);
console.log(`  Zip:    ${zipPath}`);
