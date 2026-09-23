import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "pg";

/**
 * Uji end-to-end jalur tulis terhadap Postgres nyata.
 *
 * Mengapa ada stub PostgREST: tanpa Docker, PostgREST tidak tersedia, sedangkan supabase-js
 * berbicara lewat HTTP. Stub menerjemahkan `POST /rest/v1/rpc/<fn>` menjadi kueri Postgres
 * sungguhan, sehingga yang diuji tetap basis data nyata — bukan mock fungsi.
 *
 * Yang dibuktikan di sini dan tidak dapat dibuktikan mock:
 *   1. supabase-js mengirim nama argumen p_* yang persis sama dengan tanda tangan fungsi
 *   2. RPC benar-benar menulis baris ke basis data, termasuk kud_id dari slug
 *   3. idempotensi dan dedupe nomor WA bekerja lintas HTTP
 *   4. peran `anon` dihormati: GRANT dan RLS benar-benar dievaluasi
 *
 * Dijalankan dengan:
 *   SUPABASE_DB_URL=... npm run test:e2e --workspace @recobid/backend
 */

const DB_URL = process.env.SUPABASE_DB_URL;
const KUNCI = "e2e-kontrak-000000000001";
const NOMOR = "081900001234";

let db: Client;
let server: Server;

beforeAll(async () => {
  if (DB_URL === undefined || DB_URL.length === 0) {
    throw new Error("SUPABASE_DB_URL belum diisi; tes ini memerlukan basis data nyata.");
  }
  db = new Client({ connectionString: DB_URL, connectionTimeoutMillis: 8000 });
  await db.connect();
  await db.query("delete from lead where phone_wa like '0819000012%'");

  // Stub PostgREST: satu-satunya bagian yang meniru, dan hanya protokolnya.
  server = createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
      body += String(chunk);
    });
    req.on("end", async () => {
      const match = /^\/rest\/v1\/rpc\/([a-z_]+)$/u.exec(req.url ?? "");
      if (match === null || req.method !== "POST") {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ message: "not found" }));
        return;
      }
      const fn = match[1];
      const args = JSON.parse(body) as Record<string, unknown>;
      const names = Object.keys(args);
      // PostgREST memanggil fungsi dengan ARGUMEN BERNAMA (`p_x => $1`), bukan posisi.
      // Memakai posisi menghasilkan 42703 "column p_full_name does not exist".
      const named = names.map((n, i) => `${n} => $${i + 1}`).join(", ");
      const sql = `select * from ${fn}(${named})`;
      try {
        // Peran anon ditiru: GRANT dan RLS dievaluasi seperti dari klien sungguhan.
        await db.query("begin");
        await db.query("set local role anon");
        const result = await db.query(sql, names.map((n) => args[n]));
        await db.query("commit");
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(result.rows));
      } catch (error) {
        await db.query("rollback").catch(() => undefined);
        const e = error as { code?: string; message: string };
        // Galat basis data nyata diteruskan ke konsol agar kegagalan tidak tersamar
        // sebagai "error" tanpa sebab yang terlihat.
        console.error(`[stub] ${fn} GAGAL: ${e.code ?? "XX000"} ${e.message}`);
        res.writeHead(400, { "content-type": "application/json" });
        res.end(JSON.stringify({ code: e.code ?? "XX000", message: e.message }));
      }
    });
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("stub gagal listen");

  process.env.NEXT_PUBLIC_SUPABASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "kunci-anon-uji-e2e";
  process.env.DEMO_MODE = "false";
});

afterAll(async () => {
  await db.query("delete from lead where phone_wa like '0819000012%'");
  await db.end();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

/** Modul dimuat setelah env diarahkan, karena `lib/env` dibaca saat modul dimuat. */
async function muat() {
  return import("@/lib/data/leads");
}

const masukan = {
  fullName: "Uji E2E Kontrak",
  phoneWa: NOMOR,
  cattleCount: 5,
  regionCode: "jabar" as const,
  kudSlug: "kpbs-pangalengan",
  message: "Uji jalur tulis end-to-end",
  source: "other" as const,
  utm: { source: "tiktok", medium: "organic" },
  idempotencyKey: KUNCI,
};

describe("jalur tulis lead end-to-end terhadap Postgres nyata", () => {
  it("kiriman pertama menulis baris lengkap, termasuk kud_id dari slug", async () => {
    const { submitLead } = await muat();
    const hasil = await submitLead(masukan);

    expect(hasil.status).toBe("created");

    const baris = await db.query(
      `select full_name, phone_wa, cattle_count, utm_source, utm_medium,
              kud_id is not null as ada_kud, status, is_demo
       from lead where idempotency_key = $1`,
      [KUNCI],
    );
    expect(baris.rows).toHaveLength(1);
    expect(baris.rows[0]).toMatchObject({
      full_name: "Uji E2E Kontrak",
      phone_wa: NOMOR,
      cattle_count: 5,
      utm_source: "tiktok",
      utm_medium: "organic",
      ada_kud: true,
      status: "new",
      is_demo: false,
    });
  });

  it("kiriman kedua dengan kunci sama bersifat idempoten", async () => {
    const { submitLead } = await muat();
    const pertama = await submitLead(masukan);
    const kedua = await submitLead(masukan);

    expect(pertama.status).toBe("duplicate");
    expect(kedua.status).toBe("duplicate");
    if (pertama.status !== "duplicate" || kedua.status !== "duplicate") return;
    expect(kedua.leadId).toBe(pertama.leadId);

    const jumlah = await db.query(
      "select count(*)::int as n from lead where idempotency_key = $1",
      [KUNCI],
    );
    expect(jumlah.rows[0].n).toBe(1);
  });

  it("nomor sama dengan kunci berbeda tetap dedupe ke baris yang sama", async () => {
    const { submitLead } = await muat();
    const hasil = await submitLead({ ...masukan, idempotencyKey: "e2e-kontrak-000000000003" });

    expect(hasil.status).toBe("duplicate");

    const jumlah = await db.query(
      "select count(*)::int as n from lead where phone_wa = $1 and deleted_at is null",
      [NOMOR],
    );
    expect(jumlah.rows[0].n).toBe(1);
  });

  it("wilayah tidak dikenal ditolak sebagai region_unknown", async () => {
    const { submitLead } = await muat();
    const hasil = await submitLead({
      ...masukan,
      phoneWa: "081900001235",
      regionCode: "bali" as typeof masukan.regionCode,
      idempotencyKey: "e2e-kontrak-000000000002",
    });

    expect(hasil).toEqual({ status: "error", code: "region_unknown" });
  });

  it("RPC mencatat jejak funnel ke lead_event", async () => {
    const { submitLead } = await muat();
    const hasil = await submitLead(masukan);
    if (hasil.status === "error") throw new Error(`kiriman gagal: ${hasil.code}`);

    const jejak = await db.query(
      `select metadata from lead_event
       where lead_id = $1 and event_name = 'sample_form_submit' order by id`,
      [hasil.leadId],
    );
    // Satu event per percobaan: baris baru, lalu tiap duplikat.
    expect(jejak.rows.length).toBeGreaterThanOrEqual(2);
    expect(jejak.rows[0]?.metadata).toEqual({ duplicate: false });
    expect(jejak.rows[1]?.metadata).toEqual({ duplicate: true });
  });
});
