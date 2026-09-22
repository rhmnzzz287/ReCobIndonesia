/**
 * Mesin hitung penghematan pakan.
 *
 * Berfungsi sebagai satu-satunya tempat aritmetika biaya pakan dihitung, sehingga tabel
 * "Aritmetika Penghematan" (statis) dan kalkulator interaktif tidak pernah berbeda angka.
 * Uji silang di `tests/unit/feed-cost.test.ts` mengunci kecocokan itu.
 *
 * Harga ReCob.id adalah jangkar tetap: pengunjung hanya mengubah asumsi miliknya sendiri
 * (jumlah ternak, harga konsentrat pembanding, asupan harian). Itu inti kredibilitasnya.
 */

export const PERIOD_DAYS = 30;

export interface FeedCostInput {
  /** Harga jangkar ReCob.id per karung; dibaca dari data produk, bukan ditulis di komponen. */
  anchorPriceIdr: number;
  packWeightKg: number;
  cattleCount: number;
  /** Harga konsentrat pembanding per karung 50 kg. */
  comparePricePerSackIdr: number;
  intakeKgPerCowPerDay: number;
}

export interface FeedCostResult {
  cattleCount: number;
  periodDays: number;
  intakeKgPerCowPerDay: number;
  /** Konsumsi konsentrat per ekor per bulan, dalam kilogram. */
  kgPerCowMonth: number;
  recobPricePerKg: number;
  comparePricePerKg: number;
  recobCostPerCowMonth: number;
  compareCostPerCowMonth: number;
  savingPerCowMonth: number;
  recobCostMonthly: number;
  compareCostMonthly: number;
  savingMonthly: number;
  savingYearly: number;
  /** Persentase penghematan; negatif bila pembanding lebih murah. */
  savingPct: number;
  hasSaving: boolean;
}

function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Mengembalikan `null` bila masukan tidak masuk akal, sehingga pemanggil wajib menampilkan
 * keadaan kosong alih-alih angka palsu. Tidak ada pembulatan diam-diam pada masukan.
 */
export function calculateFeedSavings(input: FeedCostInput): FeedCostResult | null {
  const { anchorPriceIdr, cattleCount, comparePricePerSackIdr, intakeKgPerCowPerDay, packWeightKg } =
    input;

  if (
    !isPositiveFinite(anchorPriceIdr) ||
    !isPositiveFinite(packWeightKg) ||
    !isPositiveFinite(comparePricePerSackIdr) ||
    !isPositiveFinite(intakeKgPerCowPerDay) ||
    !isPositiveFinite(cattleCount)
  ) {
    return null;
  }

  const kgPerCowMonth = intakeKgPerCowPerDay * PERIOD_DAYS;
  const recobPricePerKg = anchorPriceIdr / packWeightKg;
  const comparePricePerKg = comparePricePerSackIdr / packWeightKg;

  const recobCostPerCowMonth = Math.round(recobPricePerKg * kgPerCowMonth);
  const compareCostPerCowMonth = Math.round(comparePricePerKg * kgPerCowMonth);
  const savingPerCowMonth = compareCostPerCowMonth - recobCostPerCowMonth;

  const recobCostMonthly = recobCostPerCowMonth * cattleCount;
  const compareCostMonthly = compareCostPerCowMonth * cattleCount;
  const savingMonthly = compareCostMonthly - recobCostMonthly;

  return {
    cattleCount,
    periodDays: PERIOD_DAYS,
    intakeKgPerCowPerDay,
    kgPerCowMonth,
    recobPricePerKg,
    comparePricePerKg,
    recobCostPerCowMonth,
    compareCostPerCowMonth,
    savingPerCowMonth,
    recobCostMonthly,
    compareCostMonthly,
    savingMonthly,
    savingYearly: savingMonthly * 12,
    savingPct:
      compareCostPerCowMonth === 0 ? 0 : (savingPerCowMonth / compareCostPerCowMonth) * 100,
    hasSaving: savingPerCowMonth > 0,
  };
}
