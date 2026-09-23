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
