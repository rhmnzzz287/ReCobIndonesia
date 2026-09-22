import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({
  env: {
    siteUrl: "http://localhost:3000",
    supabaseUrl: null,
    supabaseAnonKey: null,
    demoMode: true,
    rateLimitWindowMs: 600_000,
    rateLimitMax: 5,
    notifyHookUrl: null,
    notifyHookSecret: null,
  },
}));

const { getRegions } = await import("@/lib/data/regions");
const { getPrimaryProduct } = await import("@/lib/data/products");
const { getPublicMetrics } = await import("@/lib/data/impact");
const { demoMetrics, demoProduct } = await import("@/lib/data/demo-data");

describe("mode demo (tanpa Supabase)", () => {
  it("getRegions mengembalikan tiga wilayah dari bundel", async () => {
    const regions = await getRegions();
    expect(regions.map((region) => region.code)).toEqual(["jabar", "jateng", "jatim"]);
  });

  it("getPrimaryProduct mengembalikan produk 50 kg beserta bahannya", async () => {
    const { product, ingredients } = await getPrimaryProduct();
    expect(product.slug).toBe(demoProduct.slug);
    expect(product.priceIdr).toBe(160000);
    expect(ingredients).toHaveLength(3);
    expect(ingredients[0]?.shareMinPct).toBe(50);
  });

  it("getPublicMetrics hanya mengembalikan metrik bersumber", async () => {
    const metrics = await getPublicMetrics();
    expect(metrics).toHaveLength(demoMetrics.length);
    expect(metrics.every((metric) => metric.references.length > 0)).toBe(true);
  });
});
