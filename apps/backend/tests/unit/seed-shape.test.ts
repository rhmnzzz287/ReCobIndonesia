import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..", "..", "..");
const SEED = readFileSync(join(ROOT, "apps", "backend", "supabase", "seed", "pitch.sql"), "utf8");
const DEMO = readFileSync(join(ROOT, "apps", "web", "lib", "data", "demo-data.ts"), "utf8");

describe("seed/pitch.sql", () => {
  it("membungkus seluruh pernyataan dalam satu transaksi", () => {
    // Komentar pembuka wajar ada; yang diperiksa adalah pernyataan pertamanya.
    const tanpaKomentar = SEED.replace(/^--.*$/gmu, "").trim();
    expect(tanpaKomentar.startsWith("begin;")).toBe(true);
    expect(tanpaKomentar.endsWith("commit;")).toBe(true);
  });

  it("bersifat idempoten (memakai on conflict do update)", () => {
    expect(SEED).toMatch(/on conflict \(code\) do update/u);
    expect(SEED).toMatch(/on conflict \(slug\) do update/u);
  });

  it("menyisipkan tiga wilayah dan empat KUD target", () => {
    for (const code of ["jabar", "jateng", "jatim"]) expect(SEED).toContain(`'${code}'`);
    for (const slug of [
      "kpbs-pangalengan",
      "kud-mojosongo",
      "kud-cepogo",
      "kud-setia-kawan",
    ]) {
      expect(SEED).toContain(`'${slug}'`);
    }
    // Keempat KUD memakai status target yang sama pada satu SELECT dari klausa VALUES.
    expect(SEED).toContain("'target', v.farmer_count, v.daily_milk_l");
  });

  it("memuat produk ritel 50 kg seharga 160000 dengan pembanding 200000", () => {
    expect(SEED).toContain("'recob-pelet-50kg'");
    expect(SEED).toContain("160000");
    expect(SEED).toContain("200000");
  });

  it("memuat tiga bahan formulasi dengan rentang proporsi dokumen sumber", () => {
    expect(SEED).toContain("50.00, 55.00");
    expect(SEED).toContain("35.00, 40.00");
    expect(SEED).toMatch(/molase/iu);
  });

  it("tidak menyisipkan metrik emisi tanpa koefisien", () => {
    expect(SEED).not.toMatch(/emisi|emission/iu);
  });
});

describe("demo-data.ts", () => {
  it("menandai seluruh metrik sebagai isDemo dan menyertakan sumber", () => {
    expect(DEMO).toContain("isDemo: true");
    expect(DEMO).toContain("assumptionNote:");
    expect(DEMO).toContain("citationLabel:");
  });

  it("menyatakan metrik yang ditahan secara eksplisit", () => {
    expect(DEMO).toContain("isPublic: false");
    expect(DEMO).toContain("withheldReason:");
  });

  it("memuat slug KUD yang sama dengan seed", () => {
    for (const slug of ["kpbs-pangalengan", "kud-mojosongo", "kud-cepogo", "kud-setia-kawan"]) {
      expect(DEMO).toContain(slug);
    }
  });
});
