import { env } from "@/lib/env";

/**
 * Pembatas laju dalam memori.
 *
 * Batas ini per instans dan bukan jaminan global di Vercel; gerbang sebenarnya adalah indeks
 * unik nomor WA dan kunci idempotensi di basis data (spec ADR-017). Gunanya menahan banjir
 * permintaan dari satu IP sebelum menyentuh basis data.
 */

/** Batas keras jumlah kunci agar memori tidak tumbuh tanpa batas. */
const MAX_KEYS = 10_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  now?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/** Mengecilkan peta saat melewati batas: buang entri kedaluwarsa, lalu entri tertua. */
function evict(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  while (buckets.size > MAX_KEYS) {
    const oldest = buckets.keys().next();
    if (oldest.done === true) break;
    buckets.delete(oldest.value);
  }
}
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? env.rateLimitWindowMs;
  const max = options.max ?? env.rateLimitMax;
  const now = options.now ?? Date.now();

  const bucket = buckets.get(key);
  if (bucket === undefined || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    // Setelah penyisipan, bukan sebelumnya: memeriksa sebelum insert membiarkan ukuran
    // mencapai MAX_KEYS + 1.
    if (buckets.size > MAX_KEYS) evict(now);
    return { allowed: true, remaining: Math.max(0, max - 1) };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: Math.max(0, max - bucket.count) };
}

/** Khusus pengujian. */
export function __resetRateLimitStore(): void {
  buckets.clear();
}

/** Khusus pengujian dan pemantauan: jumlah kunci yang tersimpan. */
export function rateLimitStoreSize(): number {
  return buckets.size;
}
