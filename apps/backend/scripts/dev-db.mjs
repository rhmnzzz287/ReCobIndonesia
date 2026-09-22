#!/usr/bin/env node
/**
 * dev-db.mjs
 *
 * Menjalankan Postgres lokal untuk tes RLS — tanpa Docker dan tanpa menyentuh project Supabase.
 * Tes di `tests/rls` menuntut basis data nyata; mock tidak dapat menguji policy.
 *
 * Pemakaian:
 *   npm run dev-db --workspace @recobid/backend     # jalankan; biarkan terminal ini terbuka
 *   npm run dev-db:reset --workspace @recobid/backend
 *
 * Setelah berjalan, tes dijalankan di terminal lain:
 *   SUPABASE_DB_URL=postgresql://recob:recob@127.0.0.1:55432/postgres npm run test:rls
 *
 * Mengapa data dir ada di luar repo:
 * Postgres menolak direktori data dengan izin lebih longgar dari 0750. Repositori ini dapat
 * berada di volume yang tidak mendukung izin Unix (mis. NTFS lewat fuseblk), sehingga `chmod`
 * tidak berpengaruh dan `initdb` gagal dengan "has invalid permissions". Data dir karena itu
 * diletakkan di cache pengguna, bukan di dalam repo.
 *
 * Catatan: memakai port 55432 agar tidak bentrok dengan Postgres sistem.
 * Basis data ini memuat stub `auth.jwt()` dan `auth.role()` karena Supabase menyediakannya,
 * bukan Postgres polos; stub hanya untuk pengujian lokal, tidak pernah dipakai di produksi.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const MIGRATIONS = join(BACKEND, "supabase", "migrations");
const DIR = join(homedir(), ".cache", "recobid-dev-db");
const PORT = 55432;
const DB_URL = `postgresql://recob:recob@127.0.0.1:${PORT}/postgres`;

const aksi = process.argv[2] ?? "start";

const STUB_AUTH = `
  do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin; end if;
  end $$;
  create schema if not exists auth;
  create or replace function auth.jwt() returns jsonb language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb);
  $$;
  create or replace function auth.role() returns text language sql stable as $$
    select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', 'anon');
  $$;
`;

if (aksi === "reset") {
  if (existsSync(DIR)) rmSync(DIR, { recursive: true, force: true });
  process.stdout.write(`dev-db: data lama dibuang (${DIR}).\n`);
}

// Izin 0700 diperlukan initdb; mkdir dengan mode eksplisit agar tidak bergantung umask.
mkdirSync(DIR, { recursive: true, mode: 0o700 });

const { Client } = await import("pg");
const { default: EmbeddedPostgres } = await import("embedded-postgres");

const pg = new EmbeddedPostgres({
  databaseDir: DIR, user: "recob", password: "recob", port: PORT, persistent: true,
});
if (!existsSync(join(DIR, "PG_VERSION"))) await pg.initialise();
await pg.start();

const client = new Client({ connectionString: DB_URL, connectionTimeoutMillis: 10_000 });
await client.connect();
await client.query(STUB_AUTH);
process.stdout.write("dev-db: stub auth siap (anon, authenticated, service_role).\n");

const files = readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort();
let diterapkan = 0;
for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS, file), "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("commit");
    diterapkan += 1;
  } catch (err) {
    await client.query("rollback");
    // Pemakaian berulang: objek yang sudah ada bukan kesalahan.
    if (!/already exists|duplicate key/i.test(err.message)) {
      process.stderr.write(`dev-db: GAGAL pada ${file}\n  ${err.message}\n`);
      await client.end();
      await pg.stop();
      process.exit(1);
    }
  }
}
await client.end();
process.stdout.write(`dev-db: ${diterapkan}/${files.length} migrasi diterapkan.\n`);
process.stdout.write(`dev-db: siap. Tekan Ctrl+C untuk berhenti.\n  SUPABASE_DB_URL=${DB_URL}\n`);

// Postgres hidup selama proses ini hidup, sehingga tes di terminal lain dapat memakainya.
const berhenti = async () => {
  try {
    await pg.stop();
  } catch {
    /* proses sudah berhenti */
  }
  process.exit(0);
};
process.on("SIGINT", berhenti);
process.on("SIGTERM", berhenti);
setInterval(() => {}, 1 << 30);
