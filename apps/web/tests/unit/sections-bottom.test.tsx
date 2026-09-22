import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import { Contact } from "@/components/sections/contact";
import { Education } from "@/components/sections/education";
import { Footer } from "@/components/sections/footer";
import { Partnership } from "@/components/sections/partnership";
import { Validation } from "@/components/sections/validation";

describe("seksi beranda bagian bawah", () => {
  it("seksi kemitraan menampilkan langkah dan daftar KUD dari konten", async () => {
    render(await Partnership());
    for (const step of copy.partnership.steps) {
      expect(screen.getByText(step.title)).toBeTruthy();
    }
    for (const name of copy.partnership.kudNames) {
      expect(screen.getByText(name)).toBeTruthy();
    }
  });

  it("seksi kendali mutu menampilkan setiap kartu mutu", async () => {
    render(await Validation());
    for (const item of copy.validation.qcItems) {
      expect(screen.getByText(item.title)).toBeTruthy();
    }
  });

  it("seksi edukasi menampilkan setiap kartu", async () => {
    render(await Education());
    for (const item of copy.education.items) {
      expect(screen.getByText(item.title)).toBeTruthy();
    }
  });

  it("footer memuat catatan kontak belum final", async () => {
    render(await Footer());
    expect(screen.getByText(copy.footer.contactNotice)).toBeTruthy();
  });
});

describe("seksi kontak", () => {
  it("memberi kedua kolom kerangka yang sama supaya kartunya sejajar", () => {
    const { container } = render(<Contact />);
    const columns = Array.from(container.querySelectorAll("#kanal .grid > div"));

    expect(columns).toHaveLength(2);
    for (const column of columns) {
      // Judul, pengantar, kartu — jumlah dan urutan yang sama di kedua kolom. Kolom kiri dulu
      // tidak punya pengantar dan kolom kanan menambah catatan penutup, sehingga tepi atas kartu
      // berselisih 42 px dan tinggi kartunya 165 px vs 93 px.
      const [heading, intro, card] = Array.from(column.children);
      expect(heading?.tagName).toBe("H2");
      expect(intro?.tagName).toBe("P");
      expect(column.children).toHaveLength(3);
      expect(column.classList.contains("flex")).toBe(true);
      expect(card?.classList.contains("flex-1")).toBe(true);
    }

    // Catatan kontak berlaku untuk kedua kolom, jadi ia berdiri di luar grid.
    const note = container.querySelector("#kanal .grid + div");
    expect(note?.textContent).toBe(copy.footer.contactNotice);
  });
});
