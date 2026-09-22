const DEFAULT_TIMEOUT_MS = 5_000;

/**
 * Pemanggilan jaringan keluar wajib memakai batas waktu: tanpa itu, satu layanan yang lambat
 * menahan seluruh permintaan (spec Bagian 8).
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
}
