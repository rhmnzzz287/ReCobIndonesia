#!/usr/bin/env node
/**
 * preflight.mjs
 *
 * Memeriksa project Supabase yang tertaut SEBELUM migrasi dijalankan: tanpa Docker, setiap
 * `db push` menyentuh basis data nyata, jadi project harus kosong (lihat spec, risiko R-1).
 *
 * Pemakaian:
 *   node apps/backend/scripts/preflight.mjs
 */

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));

const ALLOWED_TABLES = new Set(["spatial_ref_sys", "schema_migrations", "migrations"]);

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  let text;
  try {
    text = readFileSync(join(BACKEND, ".env"), "utf8");
  } catch {
    return undefined;
  }
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    if (line.slice(0, eq).trim() !== name) continue;
    return line.slice(eq + 1).trim();
  }
  return undefined;
}

const dbUrl = readEnv("SUPABASE_DB_URL");
if (dbUrl === undefined || dbUrl.length === 0) {
  process.stderr.write("preflight: GAGAL. SUPABASE_DB_URL belum diisi di apps/backend/.env\n");
  process.exit(1);
}

const sql = "select table_schema || '.' || table_name as name from information_schema.tables " +
  "where table_schema = 'public' order by 1";

const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
await client.connect();
const result = await client.query(sql);
await client.end();

const unexpected = result.rows
  .map((row) => row.name)
  .filter((name) => {
    const suffix = String(name).split(".")[1] ?? "";
    return !ALLOWED_TABLES.has(suffix);
  });

if (unexpected.length > 0) {
  process.stderr.write(
    `preflight: GAGAL. Project sudah memuat ${unexpected.length} tabel di luar skema ReCobID:\n`,
  );
  for (const name of unexpected) process.stderr.write(`  - ${name}\n`);
  process.stderr.write(
    "Hentikan. Laporkan ke pemilik produk sebelum menjalankan migrasi apa pun (risiko R-1).\n",
  );
  process.exit(1);
}

process.stdout.write("preflight: bersih. Project kosong, migrasi boleh dijalankan.\n");
