#!/usr/bin/env node
/**
 * export-design-tokens.mjs
 *
 * Menghasilkan apps/web/styles/theme.css dan apps/web/styles/tokens.json dari blok YAML
 * di Docs/DESIGN.md (ADR-005). Berkas hasil TIDAK boleh diedit tangan.
 *
 * Pemakaian:
 *   node scripts/export-design-tokens.mjs           # tulis berkas
 *   node scripts/export-design-tokens.mjs --check   # gagal bila berkas di repo berbeda
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DESIGN_PATH = join(ROOT, "Docs", "DESIGN.md");
const OUT_CSS = join(ROOT, "apps", "web", "styles", "theme.css");
const OUT_JSON = join(ROOT, "apps", "web", "styles", "tokens.json");
const CHECK = process.argv.includes("--check");

const FONT_STACKS = {
  Rubik: 'var(--font-rubik), "Rubik", ui-sans-serif, system-ui, sans-serif',
  "Plus Jakarta Sans":
    'var(--font-plus-jakarta), "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
  "IBM Plex Mono": 'var(--font-plex-mono), "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
};

function readDesignTokens() {
  const text = readFileSync(DESIGN_PATH, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/u.exec(text);
  if (match === null) {
    throw new Error(`Blok YAML tidak ditemukan di ${DESIGN_PATH}`);
  }
  return parseYaml(match[1]);
}

function buildCss(tokens) {
  const lines = [
    "/* BERKAS INI DIHASILKAN dari Docs/DESIGN.md oleh scripts/export-design-tokens.mjs. */",
    "/* Jangan diedit tangan: ubah Docs/DESIGN.md lalu jalankan `npm run check:tokens`. */",
    "",
    "@theme {",
  ];

  for (const [name, value] of Object.entries(tokens.colors)) {
    lines.push(`  --color-${name}: ${String(value).toLowerCase()};`);
  }

  for (const [name, token] of Object.entries(tokens.typography)) {
    const stack = FONT_STACKS[token.fontFamily];
    if (stack === undefined) {
      throw new Error(`Keluarga font tidak dikenal pada token ${name}: ${token.fontFamily}`);
    }
    lines.push(`  --font-${name}: ${stack};`);
    lines.push(`  --text-${name}: ${token.fontSize};`);
    lines.push(`  --font-weight-${name}: ${token.fontWeight};`);
    lines.push(`  --leading-${name}: ${token.lineHeight};`);
    if (token.letterSpacing !== undefined) {
      lines.push(`  --tracking-${name}: ${token.letterSpacing};`);
    }
  }

  for (const [name, value] of Object.entries(tokens.rounded)) {
    lines.push(`  --radius-${name}: ${value};`);
  }

  for (const [name, value] of Object.entries(tokens.spacing)) {
    lines.push(`  --spacing-${name}: ${value};`);
  }

  lines.push("}", "");
  lines.push("/* Kelas komposit: satu kelas membawa satu gaya ketik utuh. */");
  lines.push("@layer components {");

  for (const [name, token] of Object.entries(tokens.typography)) {
    lines.push(`  .type-${name} {`);
    lines.push(`    font-family: var(--font-${name});`);
    lines.push(`    font-size: var(--text-${name});`);
    lines.push(`    font-weight: var(--font-weight-${name});`);
    lines.push(`    line-height: var(--leading-${name});`);
    if (token.letterSpacing !== undefined) {
      lines.push(`    letter-spacing: var(--tracking-${name});`);
    }
    if (name.startsWith("metric-")) {
      lines.push('    font-feature-settings: "tnum";');
    }
    lines.push("  }");
  }

  lines.push("}", "");
  return lines.join("\n");
}

function buildJson(tokens) {
  const flat = {
    colors: Object.fromEntries(
      Object.entries(tokens.colors).map(([k, v]) => [k, String(v).toLowerCase()]),
    ),
    typography: Object.fromEntries(
      Object.entries(tokens.typography).map(([name, token]) => [
        name,
        {
          fontFamily: FONT_STACKS[token.fontFamily],
          fontSize: token.fontSize,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing ?? null,
        },
      ]),
    ),
    rounded: tokens.rounded,
    spacing: tokens.spacing,
  };
  return `${JSON.stringify(flat, null, 2)}\n`;
}

function writeOrCheck(path, content) {
  if (!CHECK) {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content, "utf8");
    process.stdout.write(`ditulis: ${path}\n`);
    return true;
  }
  let current = null;
  try {
    current = readFileSync(path, "utf8");
  } catch {
    current = null;
  }
  if (current !== content) {
    process.stderr.write(
      `check-tokens: GAGAL. ${path} berbeda dari hasil ekspor Docs/DESIGN.md.\n` +
        "Jalankan: node scripts/export-design-tokens.mjs lalu commit hasilnya.\n",
    );
    return false;
  }
  return true;
}

const tokens = readDesignTokens();
const okCss = writeOrCheck(OUT_CSS, buildCss(tokens));
const okJson = writeOrCheck(OUT_JSON, buildJson(tokens));

if (CHECK) {
  process.stdout.write(okCss && okJson ? "check-tokens: bersih.\n" : "");
  process.exit(okCss && okJson ? 0 : 1);
}
