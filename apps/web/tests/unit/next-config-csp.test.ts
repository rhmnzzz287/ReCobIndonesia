import { describe, expect, it } from "vitest";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } from "next/constants";
import nextConfig from "@/next.config";

/**
 * CSP adalah satu-satunya tempat `'unsafe-eval'` boleh muncul, dan hanya untuk server
 * pengembangan. Uji ini mengunci keputusan itu supaya tidak diam-diam longgar di produksi
 * maupun diam-diam ketat di dev (yang memunculkan overlay "Console Error" React).
 */
async function cspFor(phase: string): Promise<string> {
  const config = nextConfig(phase);
  const headers = await config.headers?.();
  const csp = headers?.[0]?.headers.find((header) => header.key === "Content-Security-Policy");
  if (csp === undefined) throw new Error(`CSP tidak ada pada fase ${phase}`);
  return csp.value;
}

describe("CSP pada next.config", () => {
  it("mengizinkan unsafe-eval hanya pada server pengembangan", async () => {
    // Penandanya `phase`, bukan `NODE_ENV`: shell pengembang bisa mengekspor NODE_ENV=production
    // sementara `next dev` tetap berjalan, dan deteksi berbasis NODE_ENV akan salah menutup
    // 'unsafe-eval' sehingga overlay error React muncul lagi.
    expect(await cspFor(PHASE_DEVELOPMENT_SERVER)).toContain("'unsafe-eval'");
  });

  it("tidak pernah mengizinkan unsafe-eval pada build maupun server produksi", async () => {
    for (const phase of [PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER]) {
      expect(await cspFor(phase), `${phase} tidak boleh memuat unsafe-eval`).not.toContain(
        "'unsafe-eval'",
      );
    }
  });

  it("tetap memasang batas dasar di semua fase", async () => {
    for (const phase of [PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD]) {
      const csp = await cspFor(phase);
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("connect-src 'self'");
    }
  });
});
