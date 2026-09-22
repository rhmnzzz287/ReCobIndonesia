import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { calculateFeedSavings, type FeedCostInput } from "@/lib/utils/feed-cost";

/**
 * Jangkar simulasi: nilai produk yang sama dengan yang dipakai tabel biaya di beranda.
 * Uji silang di bawah menjaga kalkulator dan tabel statis tidak pernah berbeda angka.
 */
const ANCHOR = { anchorPriceIdr: 160000, packWeightKg: 50 };

function input(overrides: Partial<FeedCostInput> = {}): FeedCostInput {
  return {
    ...ANCHOR,
    cattleCount: 10,
    comparePricePerSackIdr: 200000,
    intakeKgPerCowPerDay: 4,
    ...overrides,
  };
}

describe("mesin hitung penghematan pakan", () => {
  it("menolak masukan yang tidak sah", () => {
    expect(calculateFeedSavings(input({ cattleCount: 0 }))).toBeNull();
    expect(calculateFeedSavings(input({ cattleCount: -3 }))).toBeNull();
    expect(calculateFeedSavings(input({ cattleCount: Number.NaN }))).toBeNull();
    expect(calculateFeedSavings(input({ comparePricePerSackIdr: 0 }))).toBeNull();
    expect(calculateFeedSavings(input({ intakeKgPerCowPerDay: 0 }))).toBeNull();
    expect(calculateFeedSavings(input({ packWeightKg: 0 }))).toBeNull();
    expect(calculateFeedSavings(input({ intakeKgPerCowPerDay: Number.POSITIVE_INFINITY }))).toBeNull();
  });

  it("menghitung biaya per ekor per bulan sesuai tabel biaya beranda", () => {
    const result = calculateFeedSavings(input());
    // Tabel: "Beban Konsumsi per Ekor (120 kg / Bln)" -> Rp384.000 vs Rp432.000-480.000.
    expect(result?.recobCostPerCowMonth).toBe(384000);
    expect(result?.compareCostPerCowMonth).toBe(480000);
    expect(result?.savingPerCowMonth).toBe(96000);
  });

  it("cocok dengan baris tabel 10 ekor", () => {
    const result = calculateFeedSavings(input({ cattleCount: 10 }));
    // Tabel: "Skala Kandang Menengah (10 Ekor)" -> Rp3.840.000 vs Rp4.320.000-4.800.000.
    expect(result?.recobCostMonthly).toBe(3840000);
    expect(result?.compareCostMonthly).toBe(4800000);
    expect(result?.savingMonthly).toBe(960000);
  });

  it("cocok dengan baris tabel 8 ekor dan batas bawah harga pembanding", () => {
    const result = calculateFeedSavings(
      input({ cattleCount: 8, comparePricePerSackIdr: 180000 }),
    );
    // Tabel: "Kelompok Peternak Mandiri (8 Ekor)" -> Rp3.072.000 vs Rp3.456.000-3.840.000.
    expect(result?.recobCostMonthly).toBe(3072000);
    expect(result?.compareCostMonthly).toBe(3456000);
    expect(result?.savingMonthly).toBe(384000);
  });

  it("menghasilkan angka yang sama dengan rentang yang diiklankan pada tabel", () => {
    // Rentang klaim 11%-20%: batas bawah Rp180.000 dan batas atas Rp200.000 per karung.
    const lower = calculateFeedSavings(input({ comparePricePerSackIdr: 180000 }));
    const upper = calculateFeedSavings(input({ comparePricePerSackIdr: 200000 }));
    expect(lower?.savingPerCowMonth).toBe(48000);
    expect(upper?.savingPerCowMonth).toBe(96000);
    expect(Math.round(lower?.savingPct ?? 0)).toBe(11);
    expect(Math.round(upper?.savingPct ?? 0)).toBe(20);
  });

  it("memisahkan harga ReCob.id sebagai jangkar yang tidak ikut berubah", () => {
    const a = calculateFeedSavings(input({ comparePricePerSackIdr: 180000 }));
    const b = calculateFeedSavings(input({ comparePricePerSackIdr: 200000 }));
    expect(a?.recobCostPerCowMonth).toBe(b?.recobCostPerCowMonth);
    expect(a?.recobPricePerKg).toBe(3200);
    expect(b?.recobPricePerKg).toBe(3200);
  });

  it("menyatakan ketiadaan penghematan, bukan memelintirnya menjadi nol", () => {
    const result = calculateFeedSavings(input({ comparePricePerSackIdr: 150000 }));
    expect(result).not.toBeNull();
    expect(result?.hasSaving).toBe(false);
    expect(result?.savingPerCowMonth).toBeLessThan(0);
  });

  it("menghitung hemat setahun dari dua belas bulan", () => {
    const result = calculateFeedSavings(input());
    expect(result?.savingYearly).toBe((result?.savingMonthly ?? 0) * 12);
  });

  it("memakai dua belas bulan tiga puluh hari sebagai periode", () => {
    const result = calculateFeedSavings(input({ intakeKgPerCowPerDay: 4 }));
    expect(result?.kgPerCowMonth).toBe(120);
    expect(result?.periodDays).toBe(30);
  });

  it("membulatkan rupiah ke bilangan bulat", () => {
    const result = calculateFeedSavings(input({ intakeKgPerCowPerDay: 4.3, cattleCount: 7 }));
    for (const value of [
      result?.recobCostPerCowMonth,
      result?.compareCostPerCowMonth,
      result?.savingPerCowMonth,
      result?.savingMonthly,
      result?.savingYearly,
    ]) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("memuat naskah kalkulator di lapisan konten", () => {
    expect(copy.calculator.title.length).toBeGreaterThan(10);
    expect(copy.calculator.cattleLabel.length).toBeGreaterThan(3);
    // Judul kolom masukan harus berbeda dari judul kartu hasil, agar hierarki h3 tidak duplikat.
    expect(copy.calculator.inputsTitle).not.toBe(copy.calculator.resultTitle);
  });
});
