#!/usr/bin/env node
/**
 * check-no-emoji.mjs
 *
 * Aturan merek ReCob.id (PRD Bagian 8 butir 7): tidak ada emoji di UI, teks,
 * label, ikon, maupun konten. Ikon wajib memakai lucide-react.
 *
 * Skrip ini memindai berkas sumber proyek dan gagal (exit 1) bila menemukan
 * karakter emoji. Dijalankan di CI dan sebagai bagian dari `npm run lint`.
 *
 * Pemakaian:
 *   node scripts/check-no-emoji.mjs [rootDir]
 *
 * Konfigurasi lewat variabel lingkungan:
 *   NO_EMOJI_EXTRA_IGNORE="content/seed,public"   # daftar tambahan, dipisah koma
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? process.cwd());

/** Direktori yang tidak dipindai (dependensi, hasil build, aset biner). */
const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".vercel",
  ".turbo",
  "node_modules",
  "dist",
  "build",
  "coverage",
  "playwright-report",
  "test-results",
  "public",
  ...String(process.env.NO_EMOJI_EXTRA_IGNORE ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
]);

/** Ekstensi yang dipindai: kode, gaya, dan konten yang tampil ke pengguna. */
const SCANNED_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".md",
  ".mdx",
  ".json",
  ".html",
  ".svg",
  ".yml",
  ".yaml",
]);

/**
 * Rentang emoji yang diperiksa.
 *
 * Catatan keterbatasan: blok Misc Technical (U+2300-U+23FF) dan tanda seperti
 * U+2122/U+00A9 sengaja TIDAK diperiksa karena sering muncul sebagai karakter
 * non-emoji yang sah (mis. simbol teknis, merek dagang).
 */
const EMOJI_PATTERNS = [
  { label: "variation-selector-16", re: /\uFE0F/u },
  { label: "zero-width-joiner-sekuens", re: /\u200D[\u2600-\u27BF\u{1F000}-\u{1FAFF}]/u },
  { label: "simbol-misc-dingbats", re: /[\u2600-\u27BF]/u },
  { label: "panah-dekoratif-2B", re: /[\u2B00-\u2BFF]/u },
  { label: "pictographs", re: /[\u{1F000}-\u{1FAFF}]/u },
  { label: "regional-indicator-bendera", re: /[\u{1F1E6}-\u{1F1FF}]/u },
  { label: "keycap", re: /[0-9#*]\uFE0F?\u20E3/u },
];

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
    } else if (entry.isFile()) {
      if (SCANNED_EXTENSIONS.has(extname(entry.name))) yield full;
    }
  }
}

function codePointLabel(char) {
  const cp = char.codePointAt(0);
  return `U+${cp.toString(16).toUpperCase().padStart(4, "0")}`;
}

const findings = [];
let scanned = 0;

for (const file of walk(ROOT)) {
  const stat = statSync(file);
  if (stat.size > 2_000_000) continue; // lindungi dari berkas besar tak terduga
  scanned += 1;

  const text = readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/u);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const { label, re } of EMOJI_PATTERNS) {
      const match = re.exec(line);
      if (!match) continue;
      const char = [...match[0]][0];
      findings.push({
        file: relative(ROOT, file),
        line: lineIndex + 1,
        column: match.index + 1,
        kind: label,
        char,
        codePoint: codePointLabel(char),
      });
      break; // satu temuan per baris sudah cukup untuk menunjuk lokasi
    }
  }
}

if (findings.length === 0) {
  process.stdout.write(
    `check-no-emoji: bersih. ${scanned} berkas dipindai, 0 emoji ditemukan.\n`,
  );
  process.exit(0);
}

process.stderr.write(
  `check-no-emoji: GAGAL. ${findings.length} emoji ditemukan pada ${scanned} berkas yang dipindai.\n` +
    "Ganti dengan ikon lucide-react (PRD Bagian 8 butir 7).\n\n",
);

for (const f of findings) {
  process.stderr.write(
    `  ${f.file}:${f.line}:${f.column}  ${f.kind}  '${f.char}'  ${f.codePoint}\n`,
  );
}

process.exit(1);
