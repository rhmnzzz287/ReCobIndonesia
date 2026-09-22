/**
 * Tanda tangan badan permintaan untuk Edge Function notify-lead.
 *
 * Dipakai bersama oleh fungsi (Deno) dan tes (Vitest/Node) karena keduanya menyediakan
 * Web Crypto yang sama. Tidak ada API Deno di berkas ini agar dapat diuji di Node.
 */

const encoder = new TextEncoder();

export async function computeSignature(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Perbandingan waktu-konstan: panjang berbeda langsung ditolak, lalu setiap karakter
 * dibandingkan tanpa keluar lebih awal sehingga waktu eksekusi tidak membocorkan posisi
 * ketidakcocokan pertama.
 */
export async function verifySignature(
  body: string,
  provided: string,
  secret: string,
): Promise<boolean> {
  const expected = await computeSignature(body, secret);
  if (expected.length !== provided.length) return false;

  let mismatch = 0;
  for (let index = 0; index < expected.length; index += 1) {
    mismatch |= expected.charCodeAt(index) ^ provided.charCodeAt(index);
  }
  return mismatch === 0;
}
