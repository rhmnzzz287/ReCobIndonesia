/**
 * Tautan WhatsApp.
 *
 * Nomor resmi belum ada, dan nomor yang belum ada tidak boleh dikarang (PRD Bagian 8). Fungsi ini
 * karena itu mengembalikan `null` saat `NEXT_PUBLIC_WHATSAPP_NUMBER` kosong, supaya pemanggil
 * menyembunyikan tombolnya alih-alih menautkan ke nomor palsu.
 *
 * Sebelumnya nomor contoh `6281200000000` tertulis langsung di `components/sections/cta.tsx`.
 */

export interface WhatsappOptions {
  /** Pesan yang sudah terisi otomatis di aplikasi WhatsApp. */
  text?: string;
}

export function whatsappHref(
  number: string | null,
  options: WhatsappOptions = {},
): string | null {
  if (number === null) return null;

  const digits = number.replace(/\D/gu, "");
  if (digits.length === 0) return null;

  const base = `https://wa.me/${digits}`;
  const text = options.text?.trim();
  return text === undefined || text.length === 0
    ? base
    : `${base}?text=${encodeURIComponent(text)}`;
}
