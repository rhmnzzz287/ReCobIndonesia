import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { Hero } from "@/components/sections/hero";
import { ProductHero } from "@/components/sections/product-hero";

describe("seksi beranda bagian atas", () => {
  it("hero menampilkan judul, dua ajakan, dan pembanding harga", async () => {
    render(await Hero());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(copy.hero.title);
    for (const label of [copy.cta.preorderLabel, copy.cta.sampleLabel]) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe("/kontak#form-sampel");
    }
    expect(screen.getByText(copy.hero.priceAnchorValue)).toBeTruthy();
  });
});

/**
 * Panggung pembuka `/produk` menggantikan seksi produk beranda yang lama
 * (`components/sections/product.tsx`, kini dihapus): judulnya harus tetap satu H1 dan angka yang
 * dianimasikan harus sudah berisi nilai akhir sebelum skrip mengambil alih.
 */
describe("panggung produk", () => {
  it("memuat judul, pengantar, dan empat angka beserta satuannya", () => {
    render(<ProductHero />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      copy.productStory.heroTitle,
    );
    for (const figure of copy.productStory.figures) {
      expect(screen.getByText(figure.label)).toBeTruthy();
    }
    expect(screen.getByText("50 kg")).toBeTruthy();
    expect(screen.getByText("< 12%")).toBeTruthy();
  });

  it("menawarkan preorder dan sampel lewat form yang sama", () => {
    render(<ProductHero />);

    for (const label of [copy.cta.preorderLabel, copy.cta.sampleLabel]) {
      const link = screen.getByRole("link", { name: label });
      expect(link.getAttribute("href")).toBe("/kontak#form-sampel");
    }
  });
});
