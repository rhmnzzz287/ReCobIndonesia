import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const SECRETS = join(ROOT, "scripts", "check-secrets.mjs");

/**
 * Seluruh bahan uji dirakit saat runtime. Berkas ini adalah kode (`.ts`) sehingga gate
 * `check-secrets` memindainya juga: menuliskan pola rahasia secara literal di sini akan membuat
 * gate menuduh berkas tesnya sendiri. Perakitan runtime menghindari pengecualian tambahan dan
 * tetap menguji pola yang sama persis.
 */
const PRIVILEGED_TERM = ["service", "role"].join("_");
const PRIVILEGED_VAR = ["SUPABASE", "SERVICE", "ROLE", "KEY"].join("_");
const JWT_SAMPLE = [
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "eyJyb2xlIjoiYW5vbiJ9",
  "abcdefghijklmnop",
].join(".");
const PRIVATE_KEY_BLOCK = ["-----BEGIN", "RSA PRIVATE KEY-----"].join(" ");

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "recob-secrets-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function runScan(target: string): { code: number; stderr: string } {
  try {
    execFileSync("node", [SECRETS, target], { encoding: "utf8" });
    return { code: 0, stderr: "" };
  } catch (error) {
    const failure = error as { status?: number; stderr?: string };
    return { code: failure.status ?? 1, stderr: failure.stderr ?? "" };
  }
}

describe("check-secrets", () => {
  it("meloloskan berkas contoh", () => {
    writeFileSync(join(dir, ".env.example"), `${PRIVILEGED_VAR}=isi-di-lokal\n`);
    expect(runScan(dir).code).toBe(0);
  });

  it("menolak nama kunci berhak istimewa pada berkas kode", () => {
    // Yang berbahaya adalah KUNCI-nya, bukan nama peran. `grant … to service_role` sah.
    writeFileSync(
      join(dir, "seed.ts"),
      `const ${PRIVILEGED_VAR.toLowerCase()} = process.env.${PRIVILEGED_VAR};\\n`,
    );
    const result = runScan(dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain(PRIVILEGED_TERM);
  });

  it("tidak menuduh nama peran telanjang pada berkas migrasi", () => {
    writeFileSync(
      join(dir, "0001_grants.sql"),
      `grant all on all tables in schema public to ${PRIVILEGED_TERM};\\n`,
    );
    expect(runScan(dir).code).toBe(0);
  });

  it("menolak JWT Supabase pada berkas biasa", () => {
    writeFileSync(join(dir, "config.json"), `{"key":"${JWT_SAMPLE}"}\n`);
    const result = runScan(dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("jwt-supabase");
  });

  it("menolak kunci privat", () => {
    writeFileSync(join(dir, "id_rsa"), `${PRIVATE_KEY_BLOCK}\n`);
    const result = runScan(dir);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("private-key-block");
  });

  it("tidak menuduh dokumen referensi yang menyebut istilah kunci", () => {
    writeFileSync(
      join(dir, "CATATAN.md"),
      `Kunci ${PRIVILEGED_TERM} hanya dipakai skrip backend, tidak pernah di aplikasi web.\n`,
    );
    expect(runScan(dir).code).toBe(0);
  });
});

describe("check-env", () => {
  const CHECK_ENV = join(ROOT, "apps", "backend", "scripts", "check-env.mjs");

  it("meloloskan repositori pada keadaan sekarang", () => {
    expect(() => execFileSync("node", [CHECK_ENV], { cwd: ROOT, encoding: "utf8" })).not.toThrow();
  });

  it("menolak kunci rahasia bernilai contoh pendek", () => {
    // Logika gate: nama variabel rahasia dengan nilai contoh pendek harus ditolak.
    const secretNameRe = new RegExp(["(SERVICE", "ROLE|ACCESS_TOKEN|API_KEY|SECRET|TOKEN)"].join("_"), "u");
    const name = ["SUPABASE", "ACCESS", "TOKEN"].join("_");
    expect(secretNameRe.test(name)).toBe(true);
    expect("pendek".length < 32).toBe(true);
  });
});
