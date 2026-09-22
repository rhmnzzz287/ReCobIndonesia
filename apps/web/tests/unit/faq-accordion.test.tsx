import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FaqAccordion } from "@/components/blocks/faq-accordion";
import { copy } from "@/content/copy";

/**
 * Regresi: versi lama memaksa `node.open` di dalam callback ref setiap kali `useState`
 * berubah, sehingga atribut `open` yang baru disetel peramban langsung ditimpa kembali
 * dan hanya item pertama yang bisa dibuka. Tes ini menutup celah itu: setiap item harus
 * dapat dibuka, dan yang sedang terbuka tidak boleh tertutup sendiri.
 */
describe("FaqAccordion", () => {
  it("menampilkan setiap pertanyaan dan jawabannya", () => {
    render(<FaqAccordion items={copy.faq.items} />);
    for (const item of copy.faq.items) {
      expect(screen.getByText(item.question)).toBeTruthy();
      expect(screen.getByText(item.answer)).toBeTruthy();
    }
  });

  it("tidak mengunci atribut open lewat prop terkendali", () => {
    const { container } = render(<FaqAccordion items={copy.faq.items} />);
    for (const details of container.querySelectorAll("details")) {
      // `open` tidak boleh dirender sebagai atribut: kalau ada, React mengendalikan
      // keadaan buka/tutup dan klik peramban tidak akan berpengaruh.
      expect(details.hasAttribute("open")).toBe(false);
    }
  });

  it("memutar ikon lewat varian group-open, bukan state React", () => {
    const { container } = render(<FaqAccordion items={copy.faq.items} />);
    for (const details of container.querySelectorAll("details")) {
      expect(details.className).toContain("group");
      const icon = details.querySelector("svg");
      expect(icon?.getAttribute("class")).toContain("group-open:rotate-180");
    }
  });

  it("membuka item mana pun yang diaktifkan, bukan hanya item pertama", () => {
    const { container } = render(<FaqAccordion items={copy.faq.items} />);
    const all = [...container.querySelectorAll("details")];
    const [first, second] = all;
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first === undefined || second === undefined) return;

    // Item kedua dibuka lewat klik pada <summary>; peramban menangani atribut open.
    const summary = second.querySelector("summary");
    expect(summary).not.toBeNull();
    if (summary === null) return;
    fireEvent.click(summary);

    expect(second.hasAttribute("open")).toBe(true);
    expect(first.hasAttribute("open")).toBe(false);
  });
});
