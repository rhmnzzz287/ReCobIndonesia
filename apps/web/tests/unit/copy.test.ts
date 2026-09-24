import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";

const EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/u;

function collectStrings(value: unknown, path = "copy"): Array<{ path: string; text: string }> {
  if (typeof value === "string") return [{ path, text: value }];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectStrings(item, `${path}[${index}]`));
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => collectStrings(item, `${path}.${key}`));
  }
  return [];
}

const strings = collectStrings(copy);

describe("lapisan konten", () => {
  it("memuat naskah setiap bagian dan setiap halaman", () => {
    for (const section of [
      "hero",
      "solution",
      "product",
      "costCompare",
      "calculator",
      "partnership",
      "validation",
      "education",
      "faq",
      "cta",
      "footer",
      "nav",
      "meta",
      "pages",
      "contact",
    ]) {
      expect(copy).toHaveProperty(section);
    }
  });

  it("menyediakan naskah untuk lima halaman sekunder", () => {
    for (const key of ["produk", "kalkulator", "mitra", "edukasi", "kontak"] as const) {
      expect(copy.pages[key].title.length).toBeGreaterThan(3);
      expect(copy.pages[key].intro.length).toBeGreaterThan(20);
    }
  });

  it("memakai bahasa sederhana pada label yang dulu teknis", () => {
    expect(copy.costCompare.title).toBe("Perbandingan Harga Pakan");
    expect(copy.calculator.title).toBe("Hitung Penghematan Anda");
    expect(copy.calculator.inputsTitle).toBe("Angka yang Bisa Anda Ubah");
    expect(copy.calculator.comparePriceLabel).toBe("Harga Pakan Pabrik");
    expect(copy.product.transitionTitle).toBe("Cara Ganti Pakan (7 Hari)");
  });

  it("menyediakan label dan blok CTA konversi yang konsisten", () => {
    expect(copy.cta.preorderLabel).toBe("Preorder Sekarang");
    expect(copy.cta.sampleLabel).toBe("Klaim Sampel Gratis");
    expect(copy.nav.primaryCta).toBe("Preorder Sekarang");
    expect(copy.cta.compact.title.length).toBeGreaterThan(3);
  });

  it("tidak lagi menyimpan naskah metrik dampak", () => {
    // Bagian "Metrik Dampak & Skala Misi Berkelanjutan" dihapus atas keputusan pemilik produk;
    // sisa naskahnya tidak boleh hidup kembali tanpa sengaja.
    expect("impact" in copy).toBe(false);
    expect("impact" in copy.nav).toBe(false);
  });

  it("tidak memuat emoji", () => {
    for (const { path, text } of strings) {
      expect(EMOJI.test(text), `${path} memuat emoji`).toBe(false);
    }
  });

  it("tidak lagi menyimpan blok beranda yang sudah dihapus", () => {
    expect("productSummary" in copy).toBe(false);
    expect("toolLinks" in copy).toBe(false);
    expect("problem" in copy).toBe(false);
  });

  it("tidak memuat penanda TODO atau placeholder implementasi", () => {
    // Batas kata penting: tanpa itu "metodologi" cocok dengan TODO.
    for (const { path, text } of strings) {
      expect(/\b(TODO|TBD|FIXME|lorem)\b/iu.test(text), `${path} memuat penanda terlarang`).toBe(
        false,
      );
    }
  });

  it("tidak memuat string kosong", () => {
    for (const { path, text } of strings) {
      expect(text.trim().length, `${path} masih kosong`).toBeGreaterThan(0);
    }
  });

  it("memuat minimal enam pertanyaan FAQ beserta jawabannya", () => {
    expect(copy.faq.items.length).toBeGreaterThanOrEqual(6);
    for (const item of copy.faq.items) {
      expect(item.question.length).toBeGreaterThan(10);
      expect(item.answer.length).toBeGreaterThan(40);
    }
  });

  it("menandai klaim kenaikan produksi susu sebagai klaim berbasis kajian", () => {
    expect(copy.validation.claimNotice).toMatch(/klaim berbasis kajian/iu);
    expect(copy.validation.claimNotice).toMatch(/validasi lapangan/iu);
  });

  it("menyatakan status NPP apa adanya", () => {
    expect(copy.validation.nppStatus).toMatch(/dalam proses pendaftaran/iu);
  });

  it("menyatakan kontak resmi belum final", () => {
    expect(copy.footer.contactNotice).toMatch(/menyusul sebelum rilis publik/iu);
  });

  it("menyebut tiga wilayah operasi", () => {
    const joined = strings.map((item) => item.text).join(" ");
    for (const city of ["Bandung", "Boyolali", "Pasuruan"]) {
      expect(joined).toContain(city);
    }
  });

  it("memuat empat KUD target", () => {
    const joined = strings.map((item) => item.text).join(" ");
    for (const kud of ["KPBS Pangalengan", "KUD Mojosongo", "KUD Cepogo", "KUD Setia Kawan"]) {
      expect(joined).toContain(kud);
    }
  });
});
