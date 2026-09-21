#!/usr/bin/env node
/**
 * check-secrets.mjs
 *
 * Menolak commit yang memuat kredensial. Memindai berkas yang dilacak git dan berkas baru yang
 * belum diabaikan, kecuali berkas contoh (`.env.example`, `*.example`).
 *
 * Pemakaian:
 *   node scripts/check-secrets.mjs [rootDir]
 *
 * Kebijakan pola (ADR-012, diputuskan pemilik produk):
 * - Berkas di `Docs/` dan seluruh `*.md` adalah dokumentasi referensi, bukan kode: dokumen
 *   sengaja memuat contoh JWT, nama kunci, dan blok kunci privat sebagai bahan ajar. Berkas
 *   tersebut dilewati. Pemindaian dokumen tetap dilakukan pada V10 verifikasi penutup lewat
 *   `git grep` dengan pola kunci asli.
 * - `jwt-supabase`, `private-key-block`, dan pola kunci pihak ketiga menyala pada seluruh berkas
 *   kode/konfigurasi di luar dokumentasi: nilai berkunci yang tampil apa adanya adalah temuan nyata.
 * - `service_role` hanya menyala pada berkas kode/konfigurasi atau bila muncul sebagai penugasan
 *   bernilai; sebutan sebagai istilah tidak dianggap temuan.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] ?? process.cwd());
const MAX_BYTES = 2_000_000;

/** Ekstensi yang dianggap kode atau konfigurasi untuk pola `service_role`. */
const CODE_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".mjs",
  ".cjs",
  ".json",
  ".yml",
  ".yaml",
  ".sql",
  ".toml",
  ".sh",
]);

const PATTERNS = [
  {
    label: "jwt-supabase",
    re: /eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/u,
    scope: "any",
  },
  {
    label: "service_role",
    re: /service_role/iu,
    scope: "code-or-assigned",
  },
  {
    label: "supabase-pat",
    re: /sbp_[a-f0-9]{20,}/u,
    scope: "any",
  },
  {
    label: "resend-key",
    re: /re_[A-Za-z0-9]{16,}/u,
    scope: "any",
  },
  {
    label: "anthropic-key",
    re: /sk-ant-[A-Za-z0-9_-]{16,}/u,
    scope: "any",
  },
  {
    label: "openai-key",
    re: /sk-[A-Za-z0-9]{20,}/u,
    scope: "any",
  },
  {
    label: "aws-access-key",
    re: /AKIA[0-9A-Z]{16}/u,
    scope: "any",
  },
  {
    label: "private-key-block",
    re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/u,
    scope: "any",
  },
];

/** Penugasan bernilai: `NAME=value` atau `"name": "value"` dengan nilai bukan placeholder. */
const ASSIGNED_SECRET = /SERVICE_ROLE[A-Z_]*\s*[:=]\s*["']?[A-Za-z0-9_\-.]{8,}/iu;

function extensionOf(path) {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot === -1 ? "" : base.slice(dot).toLowerCase();
}

const SKIPPED_DIRS = new Set(["node_modules", ".git", ".next", "dist", "coverage", ".turbo"]);

function walkFilesystem(dir, prefix = "") {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIPPED_DIRS.has(entry.name)) continue;
      found.push(...walkFilesystem(join(dir, entry.name), `${prefix}${entry.name}/`));
      continue;
    }
    if (entry.isFile()) found.push(`${prefix}${entry.name}`);
  }
  return found;
}

/**
 * Daftar berkas calon: berkas yang dilacak git dan berkas baru yang belum diabaikan.
 * Di luar repositori git (mis. direktori sementara pada pengujian), seluruh berkas dipindai
 * dengan pengecualian direktori bervolume besar.
 */
function listCandidateFiles() {
  try {
    const output = execFileSync(
      "git",
      ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
      { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "pipe"] },
    );
    return output.split("\0").filter((entry) => entry.length > 0);
  } catch {
    return walkFilesystem(ROOT);
  }
}

function isExampleFile(path) {
  const base = path.split("/").pop() ?? path;
  return base.endsWith(".example") || base.includes(".env.example");
}

/**
 * Berkas gate ini sendiri memuat pola rahasia sebagai data (regex, label, komentar kebijakan).
 * Dikecualikan agar gate tidak menuduh dirinya sendiri; isinya tidak pernah memuat kredensial.
 */
function isScannerItself(path) {
  return path === "scripts/check-secrets.mjs";
}

/**
 * Dokumentasi referensi (`Docs/**`, `*.md`) bukan kode yang dijalankan atau di-deploy. Dokumen
 * sengaja memuat contoh JWT, nama variabel kunci, dan blok kunci privat sebagai bahan ajar.
 * Verifikasi penutup V10 memindai ulang dokumentasi dengan pola kunci asli.
 */
function isDocumentation(path) {
  return path.startsWith("Docs/") || path.toLowerCase().endsWith(".md");
}

function looksBinary(buffer) {
  return buffer.subarray(0, 4096).includes(0);
}

/** Pola `service_role` hanya berlaku pada kode/konfigurasi atau saat muncul sebagai penugasan. */
function appliesTo(pattern, relativePath, line) {
  if (pattern.scope === "any") return true;
  if (CODE_EXT.has(extensionOf(relativePath))) return true;
  return ASSIGNED_SECRET.test(line);
}

const findings = [];
let scanned = 0;

for (const relativePath of listCandidateFiles()) {
  if (isExampleFile(relativePath) || isScannerItself(relativePath) || isDocumentation(relativePath)) {
    continue;
  }
  const absolute = isAbsolute(relativePath) ? relativePath : join(ROOT, relativePath);
  let stat;
  try {
    stat = statSync(absolute);
  } catch {
    continue;
  }
  if (!stat.isFile() || stat.size > MAX_BYTES) continue;
  const buffer = readFileSync(absolute);
  if (looksBinary(buffer)) continue;
  scanned += 1;
  const lines = buffer.toString("utf8").split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const pattern of PATTERNS) {
      if (pattern.re.test(line) && appliesTo(pattern, relativePath, line)) {
        findings.push({ path: relativePath, line: index + 1, label: pattern.label });
        break;
      }
    }
  }
}

if (findings.length === 0) {
  process.stdout.write(`check-secrets: bersih. ${scanned} berkas dipindai.\n`);
  process.exit(0);
}

process.stderr.write(
  `check-secrets: GAGAL. ${findings.length} temuan pada ${scanned} berkas yang dipindai.\n` +
    "Pindahkan nilai ke .env lokal (diabaikan git) dan hapus dari berkas yang di-commit.\n\n",
);
for (const finding of findings) {
  process.stderr.write(`  ${finding.path}:${finding.line}  ${finding.label}\n`);
}
process.exit(1);
