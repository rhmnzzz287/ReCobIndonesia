import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SavingsCalculator } from "@/components/blocks/savings-calculator";
import { copy } from "@/content/copy";

const PROPS = { anchorPriceIdr: 160000, comparePriceIdr: 200000, packWeightKg: 50 };

function renderCalculator(): void {
  render(<SavingsCalculator {...PROPS} />);
}

describe("kalkulator penghematan", () => {
  it("menampilkan judul asumsi dan hasil", () => {
    renderCalculator();
    expect(screen.getByText(copy.calculator.inputsTitle)).toBeTruthy();
    expect(screen.getByText(copy.calculator.resultTitle)).toBeTruthy();
  });

  it("menampilkan hasil awal untuk 8 ekor pada harga pembanding Rp200.000", () => {
    renderCalculator();
    // 8 ekor, 120 kg/ekor/bulan: Rp3.840.000 vs Rp4.800.000 -> hemat Rp768.000.
    expect(screen.getByText("Rp768.000")).toBeTruthy();
  });

  it("menghitung ulang saat jumlah ternak diubah", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.cattleLabel, "iu")), {
      target: { value: "10" },
    });
    expect(screen.getByText("Rp960.000")).toBeTruthy();
  });

  it("menghitung ulang saat harga pembanding diubah ke batas bawah pasar", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.comparePriceLabel, "iu")), {
      target: { value: "180000" },
    });
    // 8 ekor, selisih Rp400/kg x 120 kg = Rp48.000/ekor -> Rp384.000 (sama dengan baris
    // tabel "Kelompok Peternak Mandiri (8 Ekor)" pada batas bawah harga pembanding).
    expect(screen.getByText("Rp384.000")).toBeTruthy();
  });

  it("menyatakan apa adanya ketika pembanding lebih murah", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.comparePriceLabel, "iu")), {
      target: { value: "150000" },
    });
    expect(screen.getByText(copy.calculator.noSavingTitle)).toBeTruthy();
  });

  it("menampilkan keadaan belum lengkap saat asumsi dikosongkan", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.cattleLabel, "iu")), {
      target: { value: "" },
    });
    expect(screen.getByText(copy.calculator.invalidTitle)).toBeTruthy();
  });

  it("menampilkan harga jangkar yang tidak dapat diubah", () => {
    renderCalculator();
    expect(screen.getByText(copy.calculator.anchorTitle)).toBeTruthy();
    expect(screen.getByText("Rp160.000")).toBeTruthy();
    expect(screen.getByText("Rp3.200")).toBeTruthy();
  });

  it("menandai harga pakan pabrik di luar rentang wajar", () => {
    renderCalculator();
    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.comparePriceLabel, "iu")), {
      target: { value: "123" },
    });
    expect(screen.getByText(copy.calculator.errors.compareRange)).toBeTruthy();
  });

  it("tidak pernah menampilkan persentase meledak dari masukan yang salah", () => {
    renderCalculator();
    const field = screen.getByLabelText(new RegExp(copy.calculator.comparePriceLabel, "iu"));

    fireEvent.change(field, { target: { value: "1" } });
    expect(screen.getByText(copy.calculator.invalidTitle)).toBeTruthy();
    // Dulu masukan Rp1 menghasilkan "-19.199.900%": angka itu harus mustahil muncul sekarang.
    expect(screen.queryByText(/-19\.199\.900%/u)).toBeNull();
    expect(screen.queryByText(/-130\.069%/u)).toBeNull();
  });

  it("menandai jumlah sapi dan asupan harian di luar rentang", () => {
    renderCalculator();

    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.cattleLabel, "iu")), {
      target: { value: "99999" },
    });
    expect(screen.getByText(copy.calculator.errors.cattleRange)).toBeTruthy();

    fireEvent.change(screen.getByLabelText(new RegExp(copy.calculator.intakeLabel, "iu")), {
      target: { value: "40" },
    });
    expect(screen.getByText(copy.calculator.errors.intakeRange)).toBeTruthy();
  });

  it("menyediakan tautan ke formulir sampel", () => {
    renderCalculator();
    const link = screen.getByRole("link", { name: copy.cta.sampleLabel });
    expect(link.getAttribute("href")).toBe("/kontak#form-sampel");
  });

  it("memakai satu skala ukuran untuk keempat nilai hasil", () => {
    renderCalculator();
    const values = Array.from(document.querySelectorAll("dl dd"));
    expect(values).toHaveLength(4);
    // Nilai terpanjang ("Rp16.128.000") dulu memakai type-metric-md (40 px) sehingga membungkus
    // dua baris dan mendorong kartu total turun dari barisnya. Semua nilai kini seukuran.
    for (const value of values) {
      expect(value.classList.contains("type-h3")).toBe(true);
      expect(value.classList.contains("type-metric-md")).toBe(false);
    }
    // Kartu total dibedakan lewat bobot dan warna, bukan ukuran.
    expect(values[0]?.classList.contains("font-bold")).toBe(true);
    expect(values[0]?.classList.contains("text-primary-strong")).toBe(true);
    expect(values[1]?.classList.contains("font-bold")).toBe(false);
  });
});
