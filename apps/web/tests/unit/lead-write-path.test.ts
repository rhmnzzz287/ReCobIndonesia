import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * Uji kontrak jalur tulis terhadap stub PostgREST.
 *
 * Mengapa bukan mock fungsi: yang diuji di sini adalah bentuk permintaan yang benar-benar
 * dikirim supabase-js (`POST /rest/v1/rpc/submit_sample_lead` dengan nama argumen p_*),
 * bukan pemanggilan fungsi internal. Mock fungsi tidak akan menangkap salah nama argumen
 * atau salah bentuk body — justru itu yang sering rusak diam-diam.
 *
 * Tanpa Docker dan tanpa project Supabase, PostgREST nyata tidak tersedia; stub ini
 * meniru bentuk protokolnya. Verifikasi terhadap Postgres nyata ada di tests/rls/.
 */

interface Rekaman {
  url: string;
  method: string;
  body: string;
  headers: Record<string, string | string[] | undefined>;
}

let server: Server;
let baseUrl = "";
let rekaman: Rekaman[] = [];
let balasan: { status: number; body: unknown } = { status: 200, body: [] };

beforeAll(async () => {
  server = createServer((req: IncomingMessage, res: ServerResponse) => {
    let body = "";
    req.on("data", (chunk) => {
      body += String(chunk);
    });
    req.on("end", () => {
      rekaman.push({
        url: req.url ?? "",
        method: req.method ?? "",
        body,
        headers: req.headers,
      });
      res.writeHead(balasan.status, { "content-type": "application/json" });
      res.end(JSON.stringify(balasan.body));
    });
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("server uji tidak memperoleh port");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error === undefined ? resolve() : reject(error)));
  });
});

/** Modul diimpor setelah env diarahkan ke stub, karena `env` dibaca saat modul dimuat. */
async function muatSubmitLead(notifyUrl: string | null = null) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = baseUrl;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "kunci-anon-uji-stub";
  process.env.DEMO_MODE = "false";
  if (notifyUrl !== null) {
    process.env.NOTIFY_HOOK_URL = notifyUrl;
    process.env.NOTIFY_HOOK_SECRET = "rahasia-uji-yang-panjang-sekali-32";
  }
  return import("@/lib/data/leads");
}

const masukan = {
  fullName: "Tarno Sujarwo",
  phoneWa: "081234567890",
  cattleCount: 8,
  regionCode: "jabar" as const,
  kudSlug: "kpbs-pangalengan",
  message: "Ingin uji 2 karung",
  source: "other" as const,
  utm: { source: "tiktok" },
  idempotencyKey: "kunci-uji-kontrak-0001",
};

describe("jalur tulis lead terhadap stub PostgREST", () => {
  it("mengirim RPC dengan seluruh nama argumen p_* yang benar", async () => {
    rekaman = [];
    balasan = { status: 200, body: [{ lead_id: "11111111-1111-1111-1111-111111111111", created: true }] };

    const { submitLead } = await muatSubmitLead();
    const hasil = await submitLead(masukan);

    expect(hasil).toEqual({ status: "created", leadId: "11111111-1111-1111-1111-111111111111" });
    expect(rekaman).toHaveLength(1);

    const kiriman = rekaman[0];
    expect(kiriman?.method).toBe("POST");
    expect(kiriman?.url).toBe("/rest/v1/rpc/submit_sample_lead");

    const body = JSON.parse(kiriman?.body ?? "{}") as Record<string, unknown>;
    // Nama argumen harus persis sama dengan tanda tangan fungsi Postgres; salah satu
    // saja berbeda akan ditolak PostgREST dengan "function not found".
    expect(Object.keys(body).sort()).toEqual(
      [
        "p_cattle_count",
        "p_full_name",
        "p_idempotency_key",
        "p_kud_slug",
        "p_message",
        "p_phone_wa",
        "p_region_code",
        "p_source",
        "p_utm",
      ].sort(),
    );
    expect(body.p_full_name).toBe("Tarno Sujarwo");
    expect(body.p_cattle_count).toBe(8);
    expect(body.p_region_code).toBe("jabar");
    expect(body.p_utm).toEqual({ source: "tiktok" });
  });

  it("menghilangkan argumen RPC opsional saat nilainya kosong", async () => {
    rekaman = [];
    balasan = { status: 200, body: [{ lead_id: "33333333-3333-3333-3333-333333333333", created: true }] };

    const { submitLead } = await muatSubmitLead();
    await submitLead({ ...masukan, kudSlug: undefined, message: undefined });

    const body = JSON.parse(rekaman[0]?.body ?? "{}") as Record<string, unknown>;
    expect(body).not.toHaveProperty("p_kud_slug");
    expect(body).not.toHaveProperty("p_message");
  });

  it("menerjemahkan respons created=false menjadi duplicate", async () => {
    rekaman = [];
    balasan = { status: 200, body: [{ lead_id: "22222222-2222-2222-2222-222222222222", created: false }] };

    const { submitLead } = await muatSubmitLead();
    const hasil = await submitLead(masukan);

    expect(hasil).toEqual({ status: "duplicate", leadId: "22222222-2222-2222-2222-222222222222" });
  });

  it("menerjemahkan errcode 22023 Postgres menjadi region_unknown", async () => {
    rekaman = [];
    balasan = {
      status: 400,
      body: { code: "22023", message: "wilayah bali tidak dikenal", details: null, hint: null },
    };

    const { submitLead } = await muatSubmitLead();
    const hasil = await submitLead(masukan);

    expect(hasil).toEqual({ status: "error", code: "region_unknown" });
  });

  it("menerjemahkan galat lain menjadi unavailable, bukan lemparan", async () => {
    rekaman = [];
    balasan = { status: 500, body: { code: "XX000", message: "internal", details: null, hint: null } };

    const { submitLead } = await muatSubmitLead();
    const hasil = await submitLead(masukan);

    expect(hasil).toEqual({ status: "error", code: "unavailable" });
  });

  it("mode demo tidak pernah menyentuh jaringan", async () => {
    // `env` dibaca saat modul dimuat, sehingga DEMO_MODE harus disetel sebelum impor.
    // Impor ulang di dalam satu berkas akan mengembalikan modul yang sudah tercache;
    // karena itu kasus ini diuji di berkas terpisah (lead-write-path-demo.test.ts).
    expect(true).toBe(true);
  });
});
