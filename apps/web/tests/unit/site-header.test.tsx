import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "@/components/blocks/site-header";
import { copy } from "@/content/copy";

function renderHeader(): void {
  render(<SiteHeader faqLabel={copy.faq.eyebrow} nav={copy.nav} />);
}

describe("SiteHeader", () => {
  it("menampilkan merek, tautan seksi, dan ajakan sampel", () => {
    renderHeader();
    expect(screen.getByText(copy.nav.brand)).toBeTruthy();
    for (const label of [
      copy.nav.product,
      copy.nav.impact,
      copy.nav.partnership,
      copy.nav.education,
      copy.faq.eyebrow,
    ]) {
      expect(
        screen.getAllByRole("link", { name: label }).length,
      ).toBeGreaterThan(0);
    }
    expect(
      screen.getAllByRole("link", { name: copy.nav.sampleCta }).length,
    ).toBeGreaterThan(0);
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
});
