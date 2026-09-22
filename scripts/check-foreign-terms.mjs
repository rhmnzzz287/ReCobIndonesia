#!/usr/bin/env node
/**
 * check-foreign-terms.mjs
 *
 * Gerbang bahasa ReCob.id: naskah yang TAMPIL ke pengunjung wajib berbahasa Indonesia,
 * dan nama merek/situs pihak ketiga dilarang muncul di kode yang dikirim ke peramban.
 *
 * Latar belakang: istilah dagang asing yang lolos ke UI (mis. "Harga loco gudang KUD mitra")
 * terbaca oleh pengunjung dan juri sebagai nama pihak lain, bukan sebagai istilah teknis.
 * Aturan merek: teks yang dilihat pengguna memakai padanan Indonesia.
 *
 * Komentar kode dikecualikan: catatan alasan desain boleh menyebut rujukan visual, karena
 * komentar tidak pernah dirender. Yang diperiksa adalah string literal dan teks JSX.
 *
 * Pemakaian:
 *   node scripts/check-foreign-terms.mjs [rootDir]
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? process.cwd());

/** Berkas yang isinya naskah tampil (satu string pun berpotensi muncul di layar). */
const DISPLAY_FILES = [
  "apps/web/content/copy",
  "apps/web/lib/data/demo-data.ts",
  "apps/backend/supabase/seed",
];

/**
 * Baris kode program yang memakai kata serupa sebagai kata kunci bahasa (mis. `do update set`
 * pada SQL). Bukan naskah yang dibaca pengunjung, jadi dikecualikan dari daftar istilah.
 */
const CODE_KEYWORD_LINES = [
  /\bdo\s+update\s+set\b/iu,
  /\bon\s+conflict\b/iu,
  /\bupdate\s+\w+\s+set\b/iu,
  /\bimport\b.*\bfrom\b/u,
];

/** Seluruh berkas kode front-end: nama merek pihak ketiga dilarang di sini. */
const CODE_ROOTS = ["apps/web/app", "apps/web/components", "apps/web/content", "apps/web/lib"];

const SKIPPED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "coverage",
  ".turbo",
  "test-results",
  "playwright-report",
]);

const SCANNED_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql"]);

/**
 * Istilah asing yang sudah terbukti bocor ke layar. Setiap entri wajib punya padanan
 * Indonesia di naskah; daftar ini tumbuh setiap kali ada temuan baru.
 */
const FOREIGN_TERMS = [
  { term: "loco", padanan: "di gudang / di pos penampungan" },
  { term: "moisture", padanan: "kadar air" },
  { term: "moisture content", padanan: "kadar air" },
  { term: "monitoring", padanan: "pemantauan" },
  { term: "drop-point", padanan: "pengantaran / titik antar" },
  { term: "inner seal", padanan: "berlapis plastik kedap udara" },
  { term: "template", padanan: "lembar / contoh" },
  { term: "batch", padanan: "bets" },
  { term: "netto", padanan: "neto" },
  { term: "supply chain", padanan: "rantai pasok" },
  { term: "cash flow", padanan: "arus kas" },
  { term: "dashboard", padanan: "dasbor" },
  { term: "update", padanan: "pembaruan" },
  { term: "download", padanan: "unduh" },
  { term: "upload", padanan: "unggah" },
];

/**
 * Nama merek/situs pihak ketiga. Dilarang di kode yang dikirim ke peramban: kalau muncul,
 * pengunjung melihat nama pihak lain di produk ReCob.id.
 */
const THIRD_PARTY_BRANDS = ["locol", "nufeed", "stitch"];

/**
 * Buang komentar agar catatan alasan desain tidak dianggap temuan.
 * Menghormati string literal sederhana supaya `//` di dalam URL tidak memotong kode.
 */
function stripComments(source) {
  let out = "";
  let state = "code";
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    const next = source[i + 1];
    if (state === "code") {
      if (char === "/" && next === "/") {
        state = "line";
        i += 1;
        continue;
      }
      if (char === "/" && next === "*") {
        state = "block";
        i += 1;
        continue;
      }
      if (char === '"' || char === "'" || char === "`") {
        state = char;
      }
      out += char;
      continue;
    }
    if (state === "line") {
      if (char === "\n") {
        state = "code";
        out += char;
      }
      continue;
    }
    if (state === "block") {
      if (char === "*" && next === "/") {
        state = "code";
        i += 1;
      } else if (char === "\n") {
        out += char;
      }
      continue;
    }
    // Di dalam string: hormati escape, jangan potong.
    if (char === "\\") {
      out += char + (next ?? "");
      i += 1;
      continue;
    }
    if (char === state) state = "code";
    out += char;
  }
  return out;
}

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
      if (SKIPPED_DIRS.has(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile() && SCANNED_EXT.has(extname(entry.name))) {
      yield full;
    }
  }
}

function isDisplayFile(relativePath) {
  return DISPLAY_FILES.some(
    (prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`),
  );
}

// `-` tidak perlu di-escape di luar kelas karakter; meng-escape-nya justru membuat regex
// tidak sah pada mode `u`.
const wordRe = (term) =>
  new RegExp(
    `(?<![\\p{L}])${term.replace(/[/\\^$*+?.()|[\]{}]/gu, "\\$&")}(?![\\p{L}])`,
    "iu",
  );

const findings = [];
let scanned = 0;
const seenFiles = new Set();

for (const root of [...new Set([...DISPLAY_FILES, ...CODE_ROOTS])]) {
  for (const file of walk(join(ROOT, root))) {
    const relativePath = relative(ROOT, file).split("\\").join("/");
    // `apps/web/content` dan `apps/web/content/copy` sama-sama akar, sehingga berkas yang sama
    // dapat terkunjungi dua kali dan melaporkan temuan ganda.
    if (seenFiles.has(relativePath)) continue;
    seenFiles.add(relativePath);
    const stat = statSync(file);
    if (stat.size > 2_000_000) continue;
    scanned += 1;
    const lines = stripComments(readFileSync(file, "utf8")).split(/\r?\n/u);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const isCodeKeywordLine = CODE_KEYWORD_LINES.some((re) => re.test(line));
      if (isDisplayFile(relativePath) && !isCodeKeywordLine) {
        for (const { term, padanan } of FOREIGN_TERMS) {
          if (wordRe(term).test(line)) {
            findings.push({
              path: relativePath,
              line: index + 1,
              label: `istilah asing "${term}"`,
              hint: `pakai "${padanan}"`,
            });
            break;
          }
        }
      }
      for (const brand of THIRD_PARTY_BRANDS) {
        if (wordRe(brand).test(line)) {
          findings.push({
            path: relativePath,
            line: index + 1,
            label: `nama pihak ketiga "${brand}"`,
            hint: "hapus dari kode; rujukan visual cukup di Docs/DESIGN.md",
          });
          break;
        }
      }
    }
  }
}

if (findings.length === 0) {
  process.stdout.write(
    `check-foreign-terms: bersih. ${scanned} berkas dipindai, 0 temuan.\n`,
  );
  process.exit(0);
}

process.stderr.write(
  `check-foreign-terms: GAGAL. ${findings.length} temuan pada ${scanned} berkas yang dipindai.\n` +
    "Naskah yang tampil wajib berbahasa Indonesia; nama pihak ketiga dilarang di kode.\n\n",
);
for (const finding of findings) {
  process.stderr.write(
    `  ${finding.path}:${finding.line}  ${finding.label} — ${finding.hint}\n`,
  );
}
process.exit(1);
