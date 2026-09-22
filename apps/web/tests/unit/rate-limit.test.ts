import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetRateLimitStore,
  checkRateLimit,
  rateLimitStoreSize,
} from "@/lib/rate-limit";

beforeEach(() => {
  __resetRateLimitStore();
});

describe("checkRateLimit", () => {
  it("mengizinkan sampai batas lalu menolak", () => {
    for (let i = 0; i < 5; i += 1) {
      expect(checkRateLimit("ip-1", { windowMs: 60_000, max: 5 }).allowed).toBe(true);
    }
    const blocked = checkRateLimit("ip-1", { windowMs: 60_000, max: 5 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("memisahkan penghitung antar kunci", () => {
    checkRateLimit("ip-2", { windowMs: 60_000, max: 1 });
    expect(checkRateLimit("ip-3", { windowMs: 60_000, max: 1 }).allowed).toBe(true);
  });

  it("menghitung ulang setelah jendela lewat", () => {
    const start = 1_000_000;
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start }).allowed).toBe(true);
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start + 500 }).allowed).toBe(false);
    expect(checkRateLimit("ip-4", { windowMs: 1_000, max: 1, now: start + 1_001 }).allowed).toBe(true);
  });

  it("membatasi ukuran penyimpanan sehingga memori tidak tumbuh tanpa batas", () => {
    for (let i = 0; i < 20_000; i += 1) {
      checkRateLimit(`ip-massal-${i}`, { windowMs: 60_000, max: 5, now: 2_000_000 });
    }
    expect(rateLimitStoreSize()).toBeLessThanOrEqual(10_000);
  });
});
