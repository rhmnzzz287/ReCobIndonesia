import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricPanel } from "@/components/blocks/metric-panel";
import { Footer } from "@/components/sections/footer";
import { copy } from "@/content/copy";
import { demoMetrics } from "@/lib/data/demo-data";

describe("MetricPanel", () => {
  it("menampilkan setiap label metrik, periode, dan label sumbernya", () => {
    const { container } = render(<MetricPanel metrics={demoMetrics} />);

    for (const metric of demoMetrics) {
      expect(screen.getByText(metric.label)).toBeTruthy();
      // `periodLabel` tidak unik antar metrik ("per ekor" dipakai dua kali).
      expect(screen.getAllByText(metric.periodLabel).length).toBeGreaterThan(0);
      for (const reference of metric.references) {
        expect(screen.getByText(reference.citationLabel)).toBeTruthy();
      }
    }

    // Satu kartu per metrik; kartu wajib setinggi wadah agar barisnya rata.
    expect(container.querySelectorAll("li.h-full")).toHaveLength(
      demoMetrics.length,
    );
  });

  it("tidak mencetak nama satuan mentah sebagai elemen tersendiri", () => {
    const { container } = render(<MetricPanel metrics={demoMetrics} />);

    // Nilai sudah memuat satuannya ("Rp40.000", "4,6 juta ton"), jadi nama enum satuan
    // tidak boleh berdiri sebagai elemen. Diperiksa per elemen, bukan seluruh teks kartu:
    // kata "liter" tetap sah muncul di dalam kalimat catatan asumsi.
    const rawUnits = new Set([
      "rupiah",
      "liter",
      "count",
      "percent",
      "ton",
      "kg",
    ]);
    const offenders = [...container.querySelectorAll("*")].filter((element) => {
      const own = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => (node.textContent ?? "").trim())
        .join("");
      return rawUnits.has(own);
    });

    expect(offenders).toHaveLength(0);
  });

  it("menautkan sumber yang punya URL dan membiarkan yang tidak", () => {
    const { container } = render(<MetricPanel metrics={demoMetrics} />);
    const links = container.querySelectorAll("a");

    // Hanya metrik BPS yang punya citationUrl pada data demo.
    expect(links).toHaveLength(1);
    expect(links[0]?.getAttribute("href")).toBe("https://www.bps.go.id");
    expect(links[0]?.getAttribute("rel")).toContain("noopener");
  });
});

describe("Footer", () => {
  it("menampilkan merek, tiga judul kolom, dan seluruh tautan legal", async () => {
    render(await Footer());

    expect(screen.getByText(copy.footer.brand)).toBeTruthy();
    for (const title of [
      copy.footer.productTitle,
      copy.footer.companyTitle,
      copy.footer.contactTitle,
      copy.footer.legalTitle,
    ]) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
    for (const link of copy.footer.legalLinks) {
      expect(screen.getByText(link)).toBeTruthy();
    }
  });

  it("memuat alamat, status NPP, dan hak cipta di bilah bawah", async () => {
    render(await Footer());

    expect(screen.getByText(copy.footer.address)).toBeTruthy();
    expect(screen.getByText(copy.footer.nppStatus)).toBeTruthy();
    expect(screen.getByText(copy.footer.copyright)).toBeTruthy();
  });
});
