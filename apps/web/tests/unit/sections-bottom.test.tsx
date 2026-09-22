import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
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

  it("seksi kendali mutu menyatakan status NPP dan catatan klaim", async () => {
    render(await Validation());
    expect(screen.getByText(copy.validation.nppStatus)).toBeTruthy();
    expect(screen.getByText(copy.validation.claimNotice)).toBeTruthy();
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
