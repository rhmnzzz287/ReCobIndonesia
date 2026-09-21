import { describe, expect, it } from "vitest";
import { FUNNEL_EVENTS } from "@recobid/shared/constants/funnel-events";
import { REGION_CODES } from "@recobid/shared/constants/regions";
import { trackEventInput } from "@recobid/shared/contracts/events";
import { submitLeadInput } from "@recobid/shared/contracts/lead";

const valid = {
  fullName: "Tarno Sujarwo",
  phoneWa: "081234567890",
  cattleCount: 8,
  regionCode: "jabar" as const,
  source: "tiktok" as const,
  idempotencyKey: "abcdefghijklmnop",
};

describe("submitLeadInput", () => {
  it("menerima masukan minimum yang sah", () => {
    const parsed = submitLeadInput.parse(valid);
    expect(parsed.fullName).toBe("Tarno Sujarwo");
    expect(parsed.utm).toEqual({});
    expect(parsed.kudSlug).toBeUndefined();
  });

  it("memangkas spasi pada nama dan pesan", () => {
    const parsed = submitLeadInput.parse({ ...valid, fullName: "  Tarno  ", message: "  halo  " });
    expect(parsed.fullName).toBe("Tarno");
    expect(parsed.message).toBe("halo");
  });

  it.each([
    ["081234567890", true],
    ["+6281234567890", true],
    ["6281234567890", true],
    ["+62 812 3456 7890", false],
    ["08123", false],
    ["021234567890", false],
    ["0812345678901234567", false],
  ])("memvalidasi nomor WhatsApp %s -> %s", (phoneWa, ok) => {
    const result = submitLeadInput.safeParse({ ...valid, phoneWa });
    expect(result.success).toBe(ok);
  });

  it("menolak jumlah ternak di luar batas", () => {
    expect(submitLeadInput.safeParse({ ...valid, cattleCount: 0 }).success).toBe(false);
    expect(submitLeadInput.safeParse({ ...valid, cattleCount: 10_001 }).success).toBe(false);
  });

  it("menolak wilayah yang tidak dikenal", () => {
    expect(submitLeadInput.safeParse({ ...valid, regionCode: "bali" }).success).toBe(false);
  });

  it("menolak kunci idempotensi yang terlalu pendek", () => {
    expect(submitLeadInput.safeParse({ ...valid, idempotencyKey: "pendek" }).success).toBe(false);
  });

  it("menolak properti tak dikenal secara ketat", () => {
    expect(submitLeadInput.safeParse({ ...valid, rahasia: "x" }).success).toBe(false);
  });
});

describe("trackEventInput", () => {
  it("menerima nama event funnel yang dikenal", () => {
    expect(trackEventInput.safeParse({ eventName: "cta_click", path: "/" }).success).toBe(true);
  });

  it("menolak nama event di luar daftar", () => {
    expect(trackEventInput.safeParse({ eventName: "buy_now", path: "/" }).success).toBe(false);
  });

  it("membatasi panjang metadata string", () => {
    expect(
      trackEventInput.safeParse({ eventName: "cta_click", path: "/", placement: "x".repeat(65) })
        .success,
    ).toBe(false);
  });
});

describe("konstanta", () => {
  it("memuat 8 nama event funnel", () => {
    expect(FUNNEL_EVENTS).toHaveLength(8);
    expect(FUNNEL_EVENTS).toContain("sample_form_submit");
  });

  it("memuat 3 kode wilayah", () => {
    expect(REGION_CODES).toEqual(["jabar", "jateng", "jatim"]);
  });
});
