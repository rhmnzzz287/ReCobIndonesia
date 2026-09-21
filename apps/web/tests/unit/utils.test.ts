import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils/cn";
import { formatDateWib, formatIdr, formatNumberId } from "@/lib/utils/format";

describe("cn", () => {
  it("menggabungkan kelas dan membuang konflik Tailwind", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-ink", false, undefined, "mt-2")).toBe("text-ink mt-2");
  });
});

describe("format", () => {
  it("memformat rupiah tanpa spasi", () => {
    expect(formatIdr(160000)).toBe("Rp160.000");
    expect(formatIdr(200000)).toBe("Rp200.000");
  });

  it("memformat angka polos", () => {
    expect(formatNumberId(1234567)).toBe("1.234.567");
  });

  it("memformat tanggal dalam WIB", () => {
    expect(formatDateWib("2026-09-22T07:05:00.000Z")).toContain("22 September 2026");
    expect(formatDateWib("2026-09-22T07:05:00.000Z")).toContain("WIB");
  });

  it("menolak tanggal tidak valid", () => {
    expect(() => formatDateWib("bukan-tanggal")).toThrow(/Tanggal tidak valid/u);
  });
});
