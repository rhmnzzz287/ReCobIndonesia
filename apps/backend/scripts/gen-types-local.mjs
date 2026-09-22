/**
 * gen-types-local.mjs
 *
 * Menghasilkan tipe TypeScript dari basis data Postgres lokal (scripts/dev-db.mjs) ke format
 * yang sama dengan `supabase gen types typescript`. Dipakai untuk mengembangkan dan menguji
 * tanpa project Supabase tertaut; hasil akhir tetap harus dihasilkan dari project nyata
 * sebelum rilis (Task 6 Step 6).
 *
 * Menulis ke packages/shared/src/db/database.types.ts.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");
const OUT = join(ROOT, "packages", "shared", "src", "db", "database.types.ts");

const DB_URL = process.env.SUPABASE_DB_URL ?? "postgresql://recob:recob@127.0.0.1:55432/postgres";

/** Nama tipe enum yang diketahui; diisi setelah kueri enum di bawah. */
const enumNames = new Set();

/** Memetakan tipe Postgres ke tipe TypeScript. */
function mapType(udt, nullable) {
  let base;
  if (enumNames.has(udt)) {
    base = `Database["public"]["Enums"]["${udt}"]`;
  } else {
    switch (udt) {
      case "uuid":
      case "text":
      case "citext":
      case "character varying":
        base = "string";
        break;
      // `information_schema.columns` memakai udt_name (int4), sedangkan
      // `pg_get_function_arguments` memakai nama SQL (integer).
      case "int2":
      case "int4":
      case "int8":
      case "smallint":
      case "integer":
      case "bigint":
        base = "number";
        break;
      case "numeric":
      case "real":
      case "double precision":
        base = "number";
        break;
      case "bool":
      case "boolean":
        base = "boolean";
        break;
      case "jsonb":
      case "json":
        base = "Json";
        break;
      case "timestamptz":
      case "timestamp":
      case "timestamp with time zone":
      case "date":
        base = "string";
        break;
      default:
        base = "string";
    }
  }
  return nullable ? `${base} | null` : base;
}

const client = new Client({ connectionString: DB_URL, connectionTimeoutMillis: 8000 });
await client.connect();

const tables = (
  await client.query(
    `select table_name from information_schema.tables
     where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name`,
  )
).rows.map((r) => r.table_name);

// Enum harus dibaca lebih dulu: mapType memakainya untuk memetakan kolom bertipe enum.
const enums = (
  await client.query(
    `select t.typname, array_agg(e.enumlabel order by e.enumsortorder) as labels
     from pg_type t join pg_enum e on e.enumtypid = t.oid
     join pg_namespace n on n.oid = t.typnamespace
     where n.nspname = 'public' group by t.typname order by t.typname`,
  )
).rows.map((row) => ({
  typname: row.typname,
  // `pg` mengembalikan array Postgres sebagai string literal (`{a,b}`), bukan array JS.
  labels: String(row.labels)
    .replace(/^\{|\}$/gu, "")
    .split(",")
    .map((label) => label.replace(/^"|"$/gu, "")),
}));
for (const e of enums) enumNames.add(e.typname);

const functions = (
  await client.query(
    `select p.proname, pg_get_function_arguments(p.oid) as args,
            pg_get_function_result(p.oid) as result
     from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname in ('submit_sample_lead')
     order by p.proname`,
  )
).rows;

const columns = {};
const relationships = {};
for (const table of tables) {
  const rows = (
    await client.query(
      `select column_name, udt_name, is_nullable, column_default
       from information_schema.columns
       where table_schema = 'public' and table_name = $1 order by ordinal_position`,
      [table],
    )
  ).rows;
  columns[table] = rows;

  // supabase-js memerlukan metadata kunci asing untuk menyelesaikan kueri bergabung
  // (mis. product(... product_ingredient(...)). Tanpa ini, hasil select bertipe error.
  const fks = (
    await client.query(
      `select con.conname,
              (select array_agg(a.attname order by u.ord)
                 from unnest(con.conkey) with ordinality as u(attnum, ord)
                 join pg_attribute a on a.attrelid = con.conrelid and a.attnum = u.attnum) as cols,
              (select array_agg(a.attname order by u.ord)
                 from unnest(con.confkey) with ordinality as u(attnum, ord)
                 join pg_attribute a on a.attrelid = con.confrelid and a.attnum = u.attnum) as ref_cols,
              ref.relname as ref_table
       from pg_constraint con
       join pg_class src on src.oid = con.conrelid
       join pg_namespace n on n.oid = src.relnamespace
       join pg_class ref on ref.oid = con.confrelid
       where con.contype = 'f' and n.nspname = 'public' and src.relname = $1
       order by con.conname`,
      [table],
    )
  ).rows;
  relationships[table] = fks.map((fk) => ({
    foreignKeyName: fk.conname,
    columns: String(fk.cols).replace(/^\{|\}$/gu, "").split(","),
    isOneToOne: false,
    referencedRelation: fk.ref_table,
    referencedColumns: String(fk.ref_cols).replace(/^\{|\}$/gu, "").split(","),
  }));
}
await client.end();

const pascal = (snake) =>
  snake
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

const parts = [];
parts.push("/* BERKAS INI DIHASILKAN. Jangan diedit tangan. */");
parts.push("");
parts.push("export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];");
parts.push("");
parts.push("export interface Database {");
parts.push("  public: {");
parts.push("    Tables: {");

for (const table of tables) {
  const cols = columns[table];
  parts.push(`      ${table}: {`);
  parts.push("        Row: {");
  for (const c of cols) {
    parts.push(`          ${c.column_name}: ${mapType(c.udt_name, c.is_nullable === "YES")};`);
  }
  parts.push("        };");
  parts.push("        Insert: {");
  for (const c of cols) {
    const optional = c.is_nullable === "YES" || c.column_default !== null;
    const t = mapType(c.udt_name, c.is_nullable === "YES");
    parts.push(`          ${c.column_name}${optional ? "?" : ""}: ${t};`);
  }
  parts.push("        };");
  parts.push("        Update: {");
  for (const c of cols) {
    parts.push(`          ${c.column_name}?: ${mapType(c.udt_name, c.is_nullable === "YES")};`);
  }
  parts.push("        };");
  parts.push("        Relationships: [");
  for (const rel of relationships[table]) {
    parts.push("          {");
    parts.push(`            foreignKeyName: "${rel.foreignKeyName}";`);
    parts.push(
      `            columns: [${rel.columns.map((c) => `"${c}"`).join(", ")}];`,
    );
    parts.push(`            isOneToOne: ${rel.isOneToOne};`);
    parts.push(`            referencedRelation: "${rel.referencedRelation}";`);
    parts.push(
      `            referencedColumns: [${rel.referencedColumns.map((c) => `"${c}"`).join(", ")}];`,
    );
    parts.push("          },");
  }
  parts.push("        ];");
  parts.push("      };");
}
parts.push("    };");

parts.push("    Views: Record<never, never>;");

parts.push("    Functions: {");
for (const fn of functions) {
  // Argumen Postgres -> bentuk objek supabase-js: "p_x text, p_y integer" -> { p_x: string; ... }
  // Argumen dengan DEFAULT dapat dihilangkan pemanggil, jadi ditandai opsional (`?`).
  const params = fn.args
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0)
    .map((a) => {
      const bagian = a.split(/\s+/u);
      const name = bagian[0];
      const type = bagian[1];
      const adaDefault = /default/iu.test(a);
      return `${name}${adaDefault ? "?" : ""}: ${mapType(type, false)} | null`;
    });
  parts.push(`      ${fn.proname}: {`);
  parts.push(`        Args: { ${params.join("; ")} };`);
  parts.push(`        Returns: { lead_id: string; created: boolean }[];`);
  parts.push("      };");
}
parts.push("    };");

parts.push("    Enums: {");
for (const e of enums) {
  const labels = e.labels.map((l) => `"${l}"`).join(" | ");
  parts.push(`      ${e.typname}: ${labels};`);
}
parts.push("    };");

parts.push("    CompositeTypes: Record<never, never>;");
parts.push("  };");
parts.push("}");

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${parts.join("\n")}\n`, "utf8");

process.stdout.write(`ditulis: ${OUT}\n`);
process.stdout.write(`  ${tables.length} tabel, ${enums.length} enum, ${functions.length} fungsi\n`);
