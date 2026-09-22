const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const IDR_PLAIN = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });

const WIB_DATE_TIME = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

/** "Rp160.000" */
export function formatIdr(value: number): string {
  return IDR.format(value).replace(/\s/gu, "");
}

/** "160.000" tanpa simbol mata uang */
export function formatNumberId(value: number): string {
  return IDR_PLAIN.format(value);
}

/** "22 September 2026 pukul 14.05 WIB" */
export function formatDateWib(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Tanggal tidak valid: ${iso}`);
  }
  return `${WIB_DATE_TIME.format(date)} WIB`;
}

/** Satuan metrik yang dikenal, selaras dengan enum `metric_unit` di basis data. */
export type MetricUnit = "ton" | "kg" | "rupiah" | "liter" | "count" | "percent";

/**
 * Nilai metrik untuk tampilan. Pemformatan angka tidak boleh ditulis di dalam komponen
 * (Task 11), sehingga seluruh varian satuan ditangani di sini.
 */
export function formatMetricValue(value: number, unit: MetricUnit): string {
  switch (unit) {
    case "rupiah":
      return formatIdr(value);
    case "percent":
      return `${formatNumberId(value)}%`;
    case "liter":
      return `${formatNumberId(value)} L`;
    case "kg":
      return `${formatNumberId(value)} kg`;
    case "ton":
      // Nilai besar dipadatkan agar tidak membanjiri kartu metrik: 4.600.000 -> "4,6 juta".
      if (value >= 1_000_000) {
        return `${(value / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} juta ton`;
      }
      return `${formatNumberId(value)} ton`;
    case "count":
      return formatNumberId(value);
  }
}
