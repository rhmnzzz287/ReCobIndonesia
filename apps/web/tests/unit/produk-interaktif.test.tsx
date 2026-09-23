import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IngredientTabs } from "@/components/blocks/ingredient-tabs";
import { CountUp } from "@/components/blocks/count-up";

/**
 * Dua perilaku yang tidak terlihat dari markup statis: tab bahan yang benar-benar berganti isi, dan
 * angka yang harus tetap benar sebelum JavaScript mengambil alih animasinya.
 */
describe("IngredientTabs", () => {
  const items = [
    { name: "Bahan A", functionLabel: "Fungsi A", shareLabel: "50–55%" },
    { name: "Bahan B", functionLabel: "Fungsi B", shareLabel: "35–40%" },
  ];

  it("menandai tab pertama sebagai terpilih dan menampilkan fungsinya", () => {
    render(<IngredientTabs items={items} label="Pilih bahan" shareLabel="Porsi:" />);
    const tabs = screen.getAllByRole("tab");

    expect(tabs).toHaveLength(2);
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByTestId("panel-bahan").textContent).toContain("Fungsi A");
  });

  it("mengganti isi panel saat tab lain dipilih", () => {
    render(<IngredientTabs items={items} label="Pilih bahan" shareLabel="Porsi:" />);
    const tabs = screen.getAllByRole("tab");

    fireEvent.click(tabs[1] as HTMLElement);

    // Inti perbaikannya: versi chip sebelumnya tidak mengubah isi apa pun, sehingga kliknya tidak
    // punya akibat yang bisa dilihat pengunjung.
    const panel = screen.getByTestId("panel-bahan").textContent ?? "";
    expect(panel).toContain("Fungsi B");
    expect(panel).not.toContain("Fungsi A");
    expect(tabs[1]?.getAttribute("aria-selected")).toBe("true");
    expect(tabs[0]?.getAttribute("aria-selected")).toBe("false");
  });
});

describe("CountUp", () => {
  it("merender angka akhir, bukan nol, saat animasi belum berjalan", () => {
    // jsdom tidak punya IntersectionObserver, jadi cabang animasi tidak dijalankan sama sekali —
    // persis keadaan tanpa JavaScript, dan angka yang terbaca harus sudah nilai akhirnya.
    render(<CountUp prefix="< " suffix="%" value={12} />);

    expect(screen.getByText("< 12%")).toBeTruthy();
  });
});
