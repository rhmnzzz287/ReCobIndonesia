#!/usr/bin/env node
/**
 * gen-types.mjs
 *
 * Menghasilkan tipe basis data dari project tertaut ke packages/shared/src/db/database.types.ts,
 * lalu menulis ulang packages/shared/src/db/types.ts sebagai re-ekspor bertipe.
 * Berkas hasil TIDAK boleh diedit tangan (Docs/SCHEMA.md §8).
 */

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");
const GENERATED = join(ROOT, "packages", "shared", "src", "db", "database.types.ts");
const SHIM = join(ROOT, "packages", "shared", "src", "db", "types.ts");

mkdirSync(dirname(GENERATED), { recursive: true });

const args = ["--yes", "supabase@latest", "gen", "types", "typescript", "--linked", "--schema", "public"];
const emitted = execFileSync("npx", args, {
  cwd: BACKEND,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});

const banner = "/* BERKAS INI DIHASILKAN oleh `npm run db:gen-types`. Jangan diedit tangan. */\n";
writeFileSync(GENERATED, banner + emitted, "utf8");

const shim = [
  "/**",
  " * Tipe basis data ReCob.id — re-ekspor dari berkas hasil generate.",
  " * Perubahan manual pada tipe adalah pelanggaran review (Docs/SCHEMA.md §8).",
  " */",
  'export type { Database, Json } from "./database.types";',
  'export { Constants } from "./database.types";',
  "",
].join("\n");
writeFileSync(SHIM, shim, "utf8");

const check = readFileSync(GENERATED, "utf8");
if (!check.includes("export type Database")) {
  throw new Error("Hasil generate tidak memuat `export type Database` — periksa keluaran CLI.");
}
process.stdout.write(`ditulis: ${GENERATED}\nditulis: ${SHIM}\n`);
