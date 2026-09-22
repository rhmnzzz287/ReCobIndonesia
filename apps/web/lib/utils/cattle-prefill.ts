/**
 * Jembatan jumlah ternak antara kalkulator dan formulir sampel.
 *
 * Nilai dibawa lewat `sessionStorage`, BUKAN query string atau hash: angka populasi kandang
 * adalah data pengunjung dan tidak boleh masuk URL, log akses, maupun analitik (PRD Bagian 9).
 *
 * Peristiwa `storage` bawaan hanya menyala di dokumen LAIN, sedangkan kedua komponen berada di
 * halaman yang sama; karena itu penulisan memancarkan peristiwa khusus dokumen ini.
 */

const CATTLE_COUNT_KEY = "recob:cattleCount";

/** Peristiwa khusus dokumen yang sama; didengarkan formulir, dipancarkan kalkulator. */
export const CATTLE_COUNT_EVENT = "recob:cattle-count";

/** Mengembalikan "" bila penyimpanan sesi diblokir atau belum ada nilai. */
export function readCattleCount(): string {
  try {
    return window.sessionStorage.getItem(CATTLE_COUNT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeCattleCount(value: string): void {
  try {
    window.sessionStorage.setItem(CATTLE_COUNT_KEY, value);
  } catch {
    // Penyimpanan sesi dapat diblokir; tautan tetap bekerja tanpa nilai terisi.
  }
  window.dispatchEvent(new Event(CATTLE_COUNT_EVENT));
}

export function subscribeCattleCount(onChange: () => void): () => void {
  window.addEventListener(CATTLE_COUNT_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CATTLE_COUNT_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
