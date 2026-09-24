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
const { getPrimaryProduct, getProducts, groupProductsByCategory } = await import(
  "@/lib/data/products"
);
const { demoProduct } = await import("@/lib/data/demo-data");

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

  it("getProducts mengembalikan katalog retail aktif", async () => {
    const products = await getProducts();

    expect(products).toHaveLength(1);
    expect(products[0]?.category).toBe("Sapi Perah");
    expect(products[0]?.imagePath).toBe("/img/produk/karung-50kg.webp");
  });

  it("groupProductsByCategory mengelompokkan kartu per kategori", () => {
    const products = [
      { ...demoProduct, slug: "sapi-perah-1", category: "Sapi Perah" },
      { ...demoProduct, slug: "penggemukan-1", category: "Sapi Penggemukan" },
      { ...demoProduct, slug: "sapi-perah-2", category: "Sapi Perah" },
    ];

    expect(
      groupProductsByCategory(products).map((group) => [group.category, group.products.length]),
    ).toEqual([
      ["Sapi Perah", 2],
      ["Sapi Penggemukan", 1],
    ]);
  });
});
