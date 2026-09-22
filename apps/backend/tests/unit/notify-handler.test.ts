import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { computeSignature } from "../../supabase/functions/notify-lead/signature";

/**
 * Uji handler Edge Function di Node dengan menyediakan global `Deno` tiruan.
 *
 * Mengapa begini: `supabase functions serve` menuntut Docker (tidak tersedia di mesin ini)
 * dan Deno tidak terpasang. Yang diuji di sini adalah logika permintaan/balasan sungguhan
 * dari `index.ts` — verifikasi tanda tangan, urutan pemeriksaan, bentuk balasan, dan
 * ketahanan kanal — bukan salinannya.
 */

const SECRET = "rahasia-uji-minimal-32-karakter-panjang";

interface Handler {
  (request: Request): Promise<Response>;
}

let handler: Handler | null = null;
let envValues: Record<string, string> = {};
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  envValues = { NOTIFY_HOOK_SECRET: SECRET };
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  // Global `Deno` tiruan: hanya dua API yang dipakai index.ts.
  vi.stubGlobal("Deno", {
    env: { get: (name: string) => envValues[name] },
    serve: (fn: Handler) => {
      handler = fn;
    },
  });

  vi.resetModules();
  await import("../../supabase/functions/notify-lead/index.ts");
});

afterEach(() => {
  vi.unstubAllGlobals();
  handler = null;
});

async function panggil(
  body: string,
  signature: string | null,
  method = "POST",
): Promise<Response> {
  if (handler === null) throw new Error("handler belum terdaftar oleh Deno.serve");
  const headers = new Headers({ "content-type": "application/json" });
  if (signature !== null) headers.set("x-recbob-signature", signature);
  // GET/HEAD tidak boleh berbadan; badan hanya disertakan untuk metode lain.
  const init: RequestInit =
    method === "GET" || method === "HEAD" ? { method, headers } : { method, headers, body };
  return handler(new Request("https://contoh.supabase.co/functions/v1/notify-lead", init));
}

const BODY = JSON.stringify({
  leadId: "11111111-1111-1111-1111-111111111111",
  regionCode: "jabar",
});

describe("Edge Function notify-lead", () => {
  it("menolak metode selain POST dengan 405", async () => {
    const response = await panggil("", null, "GET");
    expect(response.status).toBe(405);
  });

  it("menjawab 503 bila NOTIFY_HOOK_SECRET belum diisi", async () => {
    envValues = {};
    vi.resetModules();
    handler = null;
    await import("../../supabase/functions/notify-lead/index.ts");

    const response = await panggil(BODY, null);
    expect(response.status).toBe(503);
  });

  it("menolak tanda tangan salah dengan 401 tanpa memanggil kanal apa pun", async () => {
    const response = await panggil(BODY, "0".repeat(64));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "unauthorized" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("menolak tanda tangan yang hilang dengan 401", async () => {
    const response = await panggil(BODY, null);
    expect(response.status).toBe(401);
  });

  it("menerima tanda tangan benar dan menjawab 202 walau tidak ada kanal terkonfigurasi", async () => {
    const signature = await computeSignature(BODY, SECRET);
    const response = await panggil(BODY, signature);

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, channels: [] });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("mengirim surel ketika kanal surel terkonfigurasi", async () => {
    envValues = {
      NOTIFY_HOOK_SECRET: SECRET,
      RESEND_API_KEY: "kunci-resend-uji",
      NOTIFY_EMAIL_FROM: "notifikasi@recob.id",
      NOTIFY_EMAIL_TO: "tim@recob.id",
    };
    vi.resetModules();
    handler = null;
    await import("../../supabase/functions/notify-lead/index.ts");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    const signature = await computeSignature(BODY, SECRET);
    const response = await panggil(BODY, signature);

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, channels: ["email"] });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer kunci-resend-uji");
  });

  it("mengirim WhatsApp ketika gateway terkonfigurasi, dengan token", async () => {
    envValues = {
      NOTIFY_HOOK_SECRET: SECRET,
      NOTIFY_WA_GATEWAY_URL: "https://wa.contoh.id/kirim",
      NOTIFY_WA_GATEWAY_TOKEN: "token-gateway-uji",
    };
    vi.resetModules();
    handler = null;
    await import("../../supabase/functions/notify-lead/index.ts");
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    const signature = await computeSignature(BODY, SECRET);
    const response = await panggil(BODY, signature);

    await expect(response.json()).resolves.toEqual({ ok: true, channels: ["whatsapp"] });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://wa.contoh.id/kirim");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer token-gateway-uji");
  });

  it("tetap 202 ketika kanal gagal: notifikasi bersifat best-effort", async () => {
    envValues = {
      NOTIFY_HOOK_SECRET: SECRET,
      NOTIFY_WA_GATEWAY_URL: "https://wa.contoh.id/kirim",
    };
    vi.resetModules();
    handler = null;
    await import("../../supabase/functions/notify-lead/index.ts");
    fetchMock.mockRejectedValue(new Error("gateway mati"));

    const signature = await computeSignature(BODY, SECRET);
    const response = await panggil(BODY, signature);

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({ ok: true, channels: [] });
  });

  it("menolak JSON rusak dengan 400 setelah tanda tangan sah", async () => {
    const signature = await computeSignature("{bukan json", SECRET);
    const response = await panggil("{bukan json", signature);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_json" });
  });

  it("menolak payload tanpa leadId dengan 400", async () => {
    const body = JSON.stringify({ regionCode: "jabar" });
    const signature = await computeSignature(body, SECRET);
    const response = await panggil(body, signature);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "invalid_payload" });
  });

  it("menolak badan yang diubah setelah ditandatangani", async () => {
    const signature = await computeSignature(BODY, SECRET);
    const diubah = JSON.stringify({
      leadId: "99999999-9999-9999-9999-999999999999",
      regionCode: "jabar",
    });

    const response = await panggil(diubah, signature);
    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
