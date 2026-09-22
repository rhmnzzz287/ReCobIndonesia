#!/usr/bin/env node
/**
 * fn-secrets.mjs
 *
 * Menyalin rahasia notifikasi dari apps/backend/.env ke secrets Edge Function.
 * Nilai rahasia TIDAK pernah dicetak ke keluaran — hanya namanya.
 *
 * Pemakaian:
 *   node scripts/fn-secrets.mjs
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BACKEND = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ENV_PATH = join(BACKEND, ".env");

const NAMES = [
  "NOTIFY_HOOK_SECRET",
  "RESEND_API_KEY",
  "NOTIFY_EMAIL_FROM",
  "NOTIFY_EMAIL_TO",
  "NOTIFY_WA_GATEWAY_URL",
  "NOTIFY_WA_GATEWAY_TOKEN",
];

function readEnvFile(path) {
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    process.stderr.write(`fn-secrets: GAGAL. ${path} tidak ditemukan.\n`);
    process.exit(1);
  }
  const map = new Map();
  for (const rawLine of text.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    map.set(line.slice(0, eq).trim(), line.slice(eq + 1).trim());
  }
  return map;
}

const values = readEnvFile(ENV_PATH);
const terisi = NAMES.filter((name) => (values.get(name) ?? "").length > 0);

if (terisi.length === 0) {
  process.stdout.write(
    "fn-secrets: tidak ada rahasia notifikasi yang terisi di .env; langkah ini dilewati.\n",
  );
  process.exit(0);
}

const hookSecret = values.get("NOTIFY_HOOK_SECRET") ?? "";
if (hookSecret.length > 0 && hookSecret.length < 32) {
  process.stderr.write(
    `fn-secrets: GAGAL. NOTIFY_HOOK_SECRET hanya ${hookSecret.length} karakter; minimal 32.\n`,
  );
  process.exit(1);
}

for (const name of terisi) {
  try {
    // Nilai diteruskan sebagai argumen, bukan lewat shell, sehingga tidak muncul di riwayat.
    execFileSync("npx", ["--yes", "supabase@latest", "secrets", "set", `${name}=${values.get(name)}`], {
      cwd: BACKEND,
      stdio: ["ignore", "ignore", "inherit"],
    });
  } catch {
    process.stderr.write(`fn-secrets: GAGAL menyimpan ${name}.\n`);
    process.exit(1);
  }
}

process.stdout.write(`fn-secrets: tersimpan (${terisi.length}): ${terisi.join(", ")}\n`);
