#!/usr/bin/env node
/**
 * export-demo-data.mjs
 *
 * Membaca basis data lalu menulis apps/web/lib/data/demo-data.ts. Bundel ini membuat beranda
 * tetap utuh saat jaringan venue pitching buruk (spec ADR-020).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = resolve(BACKEND, "..", "..");
const OUT = join(ROOT, "apps", "web", "lib", "data", "demo-data.ts");

function readEnv(name) {
  if (process.env[name] !== undefined && process.env[name] !== "") return process.env[name];
  const text = readFileSync(join(BACKEND, ".env"), "utf8");
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq !== -1 && line.slice(0, eq).trim() === name) return line.slice(eq + 1).trim();
  }
  throw new Error(`${name} tidak ditemukan`);
}

/** Serialisasi nilai ke literal TypeScript dengan indentasi dua spasi. */
function ts(value) {
  return JSON.stringify(value, null, 2);
}

const { Client } = await import("pg");
const client = new Client({
  connectionString: readEnv("SUPABASE_DB_URL"),
  connectionTimeoutMillis: 8000,
});
await client.connect();

const regions = (await client.query("select code, name from region order by code")).rows;
const products = (
  await client.query(
    `select slug, name, description, unit, pack_weight_kg, price_idr, compare_price_idr, protein_pct
     from product where is_active order by is_bulk, slug limit 1`,
  )
).rows;
const ingredients = (
  await client.query(
    `select name, share_min_pct, share_max_pct, function_label, sort_order
     from product_ingredient where product_id = (select id from product where slug = $1)
     order by sort_order`,
    [products[0].slug],
  )
).rows;
const metrics = (
  await client.query(
    `select m.code, m.label, m.value_numeric, m.unit, m.period, m.period_label,
            coalesce(json_agg(json_build_object(
              'citationLabel', r.citation_label,
              'citationUrl', r.citation_url,
              'assumptionNote', r.assumption_note)) filter (where r.id is not null), '[]') as refs
     from impact_metric m
     left join impact_metric_reference r on r.metric_id = m.id
     where m.is_public
     group by m.id
     order by m.sort_order`,
  )
).rows;
const kudSlugs = (await client.query("select slug from kud order by slug")).rows.map((r) => r.slug);
await client.end();

if (products.length === 0) {
  throw new Error("Tidak ada produk aktif. Jalankan seed terlebih dahulu (npm run db:seed).");
}

const file = `/**
 * BERKAS INI DIHASILKAN oleh \`npm run demo:export\` di apps/backend.
 * Sumber: basis data tertaut. Jangan diedit tangan.
 * Wajib dihasilkan ulang sebelum demo pitching (spec ADR-020).
 */

import type { RegionCode } from "@recobid/shared/constants/regions";

export interface DemoProduct {
  slug: string;
  name: string;
  description: string;
  unit: "karung";
  packWeightKg: number;
  priceIdr: number;
  comparePriceIdr: number | null;
  proteinPct: number | null;
}

export interface DemoIngredient {
  name: string;
  shareMinPct: number;
  shareMaxPct: number;
  functionLabel: string;
  sortOrder: number;
}

export interface DemoMetricReference {
  citationLabel: string;
  citationUrl: string | null;
  assumptionNote: string;
}

export interface DemoMetric {
  code: string;
  label: string;
  valueNumeric: number;
  unit: "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";
  period: "daily" | "weekly" | "monthly" | "yearly" | "cumulative";
  periodLabel: string;
  isDemo: true;
  references: ReadonlyArray<DemoMetricReference>;
}

export interface DemoMetricWithoutReference {
  code: string;
  label: string;
  isPublic: false;
  withheldReason: string;
}

export const demoRegions: ReadonlyArray<{ code: RegionCode; name: string }> = ${ts(
  regions.map((r) => ({ code: r.code, name: r.name })),
)};

export const demoProduct: DemoProduct = ${ts({
  slug: products[0].slug,
  name: products[0].name,
  description: products[0].description,
  unit: products[0].unit,
  packWeightKg: Number(products[0].pack_weight_kg),
  priceIdr: Number(products[0].price_idr),
  comparePriceIdr:
    products[0].compare_price_idr === null ? null : Number(products[0].compare_price_idr),
  proteinPct: products[0].protein_pct === null ? null : Number(products[0].protein_pct),
})};

export const demoIngredients: ReadonlyArray<DemoIngredient> = ${ts(
  ingredients.map((i) => ({
    name: i.name,
    shareMinPct: Number(i.share_min_pct),
    shareMaxPct: Number(i.share_max_pct),
    functionLabel: i.function_label,
    sortOrder: i.sort_order,
  })),
)};

export const demoMetrics: ReadonlyArray<DemoMetric> = ${ts(
  metrics.map((m) => ({
    code: m.code,
    label: m.label,
    valueNumeric: Number(m.value_numeric),
    unit: m.unit,
    period: m.period,
    periodLabel: m.period_label,
    isDemo: true,
    references: m.refs,
  })),
)};

/**
 * Metrik yang sengaja ditahan: tanpa sumber yang dapat dikutip, tidak ditampilkan di UI
 * (PRD Bagian 7.1). Dipisahkan dari demoMetrics agar tidak mungkin lolos ke tampilan.
 */
export const demoMetricsWithoutReference: ReadonlyArray<DemoMetricWithoutReference> = ${ts([
  {
    code: "emission_avoided",
    label: "Emisi pembakaran terbuka yang dihindari",
    isPublic: false,
    withheldReason:
      "Belum ada koefisien emisi resmi yang dapat dikutip. Metrik tanpa sumber tidak ditampilkan (PRD Bagian 7.1).",
  },
])};

export const demoKudSlugs: readonly string[] = ${ts(kudSlugs)};
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, file, "utf8");
process.stdout.write(`ditulis: ${OUT}\n`);
