import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    siteUrl: "http://localhost:3000",
    supabaseUrl: "https://contoh.supabase.co",
    supabaseAnonKey: "kunci-anon-uji",
    demoMode: false,
    rateLimitWindowMs: 600_000,
    rateLimitMax: 5,
    notifyHookUrl: null,
    notifyHookSecret: null,
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [{ code: "jabar" }], error: null }),
      }),
    }),
  }),
}));

const { GET } = await import("@/app/api/health/route");

describe("GET /api/health", () => {
  it("mengembalikan 200 dengan status ok saat basis data menjawab", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ db: "ok" });
  });
});
