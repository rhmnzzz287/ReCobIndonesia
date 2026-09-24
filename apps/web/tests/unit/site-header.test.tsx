import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/blocks/site-header";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { copy } from "@/content/copy";

function renderHeader(): void {
  render(<SiteHeader />);
}

describe("SiteHeader", () => {
  it("menampilkan merek, tautan halaman, dan ajakan sampel", () => {
    renderHeader();
    expect(screen.getByText(copy.nav.brand)).toBeTruthy();
    for (const label of [
      copy.nav.product,
      copy.nav.calculator,
      copy.nav.partnership,
      copy.nav.education,
      copy.nav.contact,
    ]) {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    }
    expect(screen.getAllByRole("link", { name: copy.nav.primaryCta }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: copy.nav.sampleCta }).length).toBeGreaterThan(0);
  });

  it("menampilkan dua ajakan konversi pada bilah lengket", () => {
    render(<StickyCta />);

    for (const label of [copy.cta.preorderLabel, copy.cta.sampleLabel]) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links).toHaveLength(1);
      expect(links[0]?.getAttribute("href")).toBe("/kontak#form-sampel");
    }
  });

  it("menautkan setiap halaman sekunder lewat rute, bukan anchor", () => {
    renderHeader();
    for (const href of ["/produk", "/kalkulator", "/mitra", "/edukasi", "/kontak"]) {
      expect(document.querySelectorAll(`a[href="${href}"]`).length).toBeGreaterThan(0);
    }
    // Ajakan sampel harus menunjuk ke formulir di halaman kontak.
    expect(document.querySelectorAll('a[href="/kontak#form-sampel"]').length).toBeGreaterThan(0);
  });

  it("menampilkan dua ajakan konversi dengan tujuan form sampel", () => {
    renderHeader();

    fireEvent.click(screen.getByRole("button", { name: copy.nav.menuLabel }));

    for (const label of [copy.nav.primaryCta, copy.nav.sampleCta]) {
      const links = screen.getAllByRole("link", { name: label });
      expect(links.length).toBeGreaterThan(0);
      for (const link of links) {
        expect(link.getAttribute("href")).toBe("/kontak#form-sampel");
      }
    }
  });

  it("menu seluler tertutup secara bawaan dan terbuka lewat tombol", () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: copy.nav.menuLabel });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(document.querySelector("#menu-utama")?.className).toContain(
      "hidden",
    );

    fireEvent.click(toggle);

    const opened = screen.getByRole("button", { name: copy.nav.closeLabel });
    expect(opened.getAttribute("aria-expanded")).toBe("true");
    expect(document.querySelector("#menu-utama")?.className).toContain("block");
  });

  it("menutup menu seluler setelah tautan dipilih", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("button", { name: copy.nav.menuLabel }));

    const menu = document.querySelector("#menu-utama");
    const link = menu?.querySelector("a");
    expect(link).not.toBeNull();
    fireEvent.click(link as Element);

    expect(
      screen.getByRole("button", { name: copy.nav.menuLabel }),
    ).toBeTruthy();
    expect(document.querySelector("#menu-utama")?.className).toContain(
      "hidden",
    );
  });

  /**
   * Pulau mengambang: bar pembungkus transparan dan hanya pulau beralas `surface` yang terlihat,
   * jadi isi halaman tidak pernah membayangi tautan. Tinggi pulau tetap di segala posisi gulir.
   */
  it("menyusun pulau mengambang beralas surface", () => {
    renderHeader();
    const header = document.querySelector("header");
    expect(header?.className).toContain("fixed");

    const island = header?.querySelector("header > div");
    expect(island?.className).toContain("bg-surface");
    expect(island?.className).toContain("rounded-sm");
    expect(island?.className).toContain("shadow-");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 640 });
    fireEvent.scroll(window);
    expect(island?.className).toContain("bg-surface");
  });
});
