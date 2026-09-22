import { describe, expect, it } from "vitest";

/**
 * Mode demo diuji di berkas terpisah karena `lib/env.ts` membaca `process.env` saat modul
 * dimuat: mengubah DEMO_MODE di dalam berkas yang sama tidak akan berpengaruh pada modul
 * yang sudah tercache.
 */
process.env.DEMO_MODE = "true";
process.env.NEXT_PUBLIC_SUPABASE_URL = "";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";

const { submitLead } = await import("@/lib/data/leads");

describe("jalur tulis lead dalam mode demo", () => {
  it("menolak tanpa menyentuh jaringan", async () => {
    const hasil = await submitLead({
      fullName: "Tarno Sujarwo",
      phoneWa: "081234567890",
      cattleCount: 8,
      regionCode: "jabar",
      kudSlug: "kpbs-pangalengan",
      source: "other",
      utm: {},
      idempotencyKey: "kunci-uji-demo-000001",
    });

    expect(hasil).toEqual({ status: "error", code: "unavailable" });
  });
});
