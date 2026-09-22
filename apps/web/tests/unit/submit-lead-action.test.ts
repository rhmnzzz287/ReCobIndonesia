import { beforeEach, describe, expect, it, vi } from "vitest";

const submitLead = vi.fn();
const checkRateLimit = vi.fn();
const logInfo = vi.fn();
const logError = vi.fn();

vi.mock("@/lib/data/leads", () => ({ submitLead }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit }));
vi.mock("@/lib/logging", () => ({ logInfo, logError }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "203.0.113.7" }),
}));

const { submitLeadAction } = await import("@/app/actions/submit-lead");

const valid = {
  fullName: "Budi Santoso",
  phoneWa: "081234567890",
  cattleCount: 4,
  regionCode: "jabar" as const,
  source: "other" as const,
  utm: {},
  idempotencyKey: "0123456789abcdef",
  companyWebsite: "",
};

beforeEach(() => {
  vi.clearAllMocks();
  checkRateLimit.mockReturnValue({ allowed: true, remaining: 4 });
});

describe("submitLeadAction", () => {
  it("menolak input tidak valid sebelum menyentuh basis data", async () => {
    const result = await submitLeadAction({ ...valid, phoneWa: "123" });
    expect(result.status).toBe("invalid");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("membalas seperti sukses saat honeypot terisi tanpa menyentuh basis data", async () => {
    const result = await submitLeadAction({ ...valid, companyWebsite: "http://spam.example" });
    expect(result.status).toBe("created");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("menerima masukan sah meski honeypot ikut dikirim dalam keadaan kosong", async () => {
    // Regresi: honeypot di luar skema .strict(). Bila ikut divalidasi, SETIAP kiriman gagal.
    submitLead.mockResolvedValue({ status: "created", leadId: "11111111-1111-1111-1111-111111111111" });
    const result = await submitLeadAction({ ...valid, companyWebsite: "" });
    expect(result.status).toBe("created");
    expect(submitLead).toHaveBeenCalledOnce();
  });

  it("mengembalikan rate_limited tanpa memanggil basis data", async () => {
    checkRateLimit.mockReturnValue({ allowed: false, remaining: 0 });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("rate_limited");
    expect(submitLead).not.toHaveBeenCalled();
  });

  it("meneruskan lead yang sah dan melaporkan created", async () => {
    submitLead.mockResolvedValue({ status: "created", leadId: "11111111-1111-1111-1111-111111111111" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("created");
    expect(submitLead).toHaveBeenCalledWith(expect.objectContaining({ phoneWa: "081234567890" }));
    expect(logInfo).toHaveBeenCalled();
  });

  it("melaporkan duplicate sebagai sukses idempoten", async () => {
    submitLead.mockResolvedValue({ status: "duplicate", leadId: "11111111-1111-1111-1111-111111111111" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("duplicate");
  });

  it("melaporkan unavailable bila basis data tidak menjawab", async () => {
    submitLead.mockResolvedValue({ status: "error", code: "unavailable" });
    const result = await submitLeadAction(valid);
    expect(result.status).toBe("unavailable");
    expect(logError).toHaveBeenCalled();
  });
});
