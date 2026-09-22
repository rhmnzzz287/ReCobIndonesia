#!/usr/bin/env node
/**
 * seed.mjs — menjalankan supabase/seed/pitch.sql terhadap basis data.
 * Menolak berjalan bila APP_ENV=production, kecuali argumen --force diberikan.
 */

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SEED = join(BACKEND, "supabase", "seed", "pitch.sql");
const forced = process.argv.includes("--force");

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  try {
    const text = readFileSync(join(BACKEND, ".env"), "utf8");
    for (const rawLine of text.split(/\r?\n/u)) {
      const line = rawLine.trim();
      if (line.length === 0 || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq !== -1 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

if (readEnv("APP_ENV") === "production" && !forced) {
  process.stderr.write(
    "seed: DITOLAK. APP_ENV=production. Jalankan dengan --force bila memang disengaja.\n",
  );
  process.exit(1);
}

const dbUrl = readEnv("SUPABASE_DB_URL");
if (dbUrl === undefined || dbUrl.length === 0) {
  process.stderr.write("seed: GAGAL. SUPABASE_DB_URL belum diisi di apps/backend/.env\n");
  process.exit(1);
}

const { Client } = await import("pg");
const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 8000 });
await client.connect();
try {
  await client.query(readFileSync(SEED, "utf8"));
  const counts = await client.query(
    `select
       (select count(*)::int from region)      as regions,
       (select count(*)::int from kud)         as kuds,
       (select count(*)::int from product)     as products,
       (select count(*)::int from product_ingredient) as ingredients,
       (select count(*)::int from impact_metric) as metrics,
       (select count(*)::int from lead where is_demo) as demo_leads`,
  );
  process.stdout.write(`seed: selesai ${JSON.stringify(counts.rows[0])}\n`);
} finally {
  await client.end();
}
