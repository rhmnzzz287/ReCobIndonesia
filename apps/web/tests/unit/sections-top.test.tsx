import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { Hero } from "@/components/sections/hero";
import { Product } from "@/components/sections/product";
import { demoProduct, demoIngredients } from "@/lib/data/demo-data";

describe("seksi beranda bagian atas", () => {
  it("hero menampilkan judul, dua ajakan, dan pembanding harga", async () => {
    render(await Hero());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.hero.title);
    expect(screen.getByRole("link", { name: copy.hero.ctaPrimary })).toBeTruthy();
    expect(screen.getByRole("link", { name: copy.hero.ctaSecondary })).toBeTruthy();
    expect(screen.getByText(copy.hero.priceAnchorValue)).toBeTruthy();
  });

  it("seksi produk menampilkan setiap bahan beserta rentang porsinya", async () => {
    render(await Product());
    for (const ingredient of demoIngredients) {
      expect(screen.getByText(ingredient.name)).toBeTruthy();
      expect(screen.getByText(`${ingredient.shareMinPct}–${ingredient.shareMaxPct}%`)).toBeTruthy();
    }
    expect(screen.getByText(demoProduct.name)).toBeTruthy();
  });
});
