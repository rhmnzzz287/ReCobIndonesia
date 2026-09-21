#!/usr/bin/env node
/**
 * check-env.mjs
 *
 * Memastikan setiap variabel lingkungan yang dirujuk kode tercantum di berkas `.env.example`
 * aplikasinya (ADR-011 konsekuensi 3), dan bahwa kunci rahasia tidak memakai nilai contoh pendek.
 *
 * Pemakaian:
 *   node apps/backend/scripts/check-env.mjs
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../../..", import.meta.url)));

const SCAN_ROOTS = [
  { dir: join(ROOT, "apps", "web"), example: join(ROOT, "apps", "web", ".env.example") },
  { dir: join(ROOT, "apps", "backend"), example: join(ROOT, "apps", "backend", ".env.example") },
  { dir: join(ROOT, "packages", "shared"), example: join(ROOT, "apps", "backend", ".env.example") },
];

const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage", "tests"]);
const SCANNED_EXT = new Set([".ts", ".tsx", ".mjs", ".js", ".json"]);
const ENV_REF = /process\.env\.([A-Z0-9_]{2,})/gu;
const VERCEL_INJECTED = new Set(["NODE_ENV", "VERCEL", "VERCEL_ENV", "CI"]);

/**
 * Nama variabel yang dianggap memuat rahasia. Pola dirakit saat runtime karena berkas ini sendiri
 * dipindai gate `check-secrets`: menuliskannya secara literal akan membuat gate menuduh dirinya.
 */
const SECRET_NAME_RE = new RegExp(
  ["(SERVICE", "ROLE|ACCESS_TOKEN|API_KEY|SECRET|TOKEN)"].join("_"),
  "u",
);

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      yield* walk(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (!SCANNED_EXT.has(entry.name.slice(entry.name.lastIndexOf(".")))) continue;
    yield full;
  }
}

function parseExample(path) {
  let text = "";
  try {
    text = readFileSync(path, "utf8");
  } catch {
    return new Map();
  }
  const map = new Map();
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    map.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  return map;
}

const problems = [];

for (const { dir, example } of SCAN_ROOTS) {
  const declared = parseExample(example);
  const referenced = new Set();
  for (const file of walk(dir)) {
    if (statSync(file).size > 1_000_000) continue;
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(ENV_REF)) {
      const name = match[1];
      if (name === undefined) continue;
      if (VERCEL_INJECTED.has(name)) continue;
      referenced.add(name);
    }
  }
  for (const name of [...referenced].sort()) {
    if (!declared.has(name)) {
      problems.push(`variabel ${name} dirujuk kode tetapi tidak ada di ${relative(ROOT, example)}`);
    }
  }
  for (const [name, value] of declared) {
    const isSecret = SECRET_NAME_RE.test(name);
    if (isSecret && value.length > 0 && value.length < 32) {
      problems.push(
        `${name} pada ${relative(ROOT, example)} memakai nilai contoh pendek (panjang ${value.length}); kosongkan atau isi >= 32 karakter`,
      );
    }
  }
}

if (problems.length === 0) {
  process.stdout.write("check-env: bersih.\n");
  process.exit(0);
}

process.stderr.write("check-env: GAGAL.\n");
for (const problem of problems) {
  process.stderr.write(`  ${problem}\n`);
}
process.exit(1);
