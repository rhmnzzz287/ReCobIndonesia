import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Client } from "pg";
import { asRole, attempt, connect } from "./helpers";

/**
 * Uji RLS dan RPC terhadap basis data nyata (Docs/SCHEMA.md §6.4).
 *
 * Tes ini TIDAK memakai mock: seluruh pernyataan dijalankan oleh Postgres, sehingga policy,
 * grant, dan trigger benar-benar dievaluasi. Dijalankan dengan:
 *   SUPABASE_DB_URL=... npm run test:rls --workspace @recobid/backend
 */

let db: Client;
const KUNCI = "rls-uji-000000000001";
const NOMOR = "081900000001";

beforeAll(async () => {
  db = await connect();
  await db.query(
    `insert into region (code, name, province) values ('jabar', 'Jawa Barat', 'Jawa Barat')
     on conflict (code) do nothing`,
  );
});

afterAll(async () => {
  if (db === undefined) return;
  // Bersihkan seluruh jejak uji ini agar tes dapat dijalankan berulang: nomor WA memiliki
  // indeks unik parsial, jadi sisa baris akan menggagalkan eksekusi berikutnya.
  await db.query("delete from lead where phone_wa like '0819000000%'");
  await db.query("delete from region where code = 'bali'");
  await db.end();
});

describe("hak akses tingkat tabel (grant)", () => {
  it("anon dapat membaca katalog publik", async () => {
    for (const tabel of ["region", "kud", "product", "product_ingredient", "impact_metric"]) {
      const hasil = await asRole(db, "anon", () => attempt(db, `select count(*) from ${tabel}`));
      expect(hasil, `anon seharusnya dapat membaca ${tabel}`).toEqual({ ok: true });
    }
  });

  it("anon tidak dapat membaca lead maupun lead_event", async () => {
    const lead = await asRole(db, "anon", () => attempt(db, "select count(*) from lead"));
    expect(lead.ok).toBe(false);
    if (!lead.ok) expect(lead.code).toBe("42501");

    const event = await asRole(db, "anon", () => attempt(db, "select count(*) from lead_event"));
    expect(event.ok).toBe(false);
  });

  it("anon tidak dapat menulis ke katalog", async () => {
    const hasil = await asRole(db, "anon", () =>
      attempt(db, `insert into region (code, name, province) values ('bali', 'Bali', 'Bali')`),
    );
    expect(hasil.ok).toBe(false);
  });

  it("anon dapat menyisipkan lead tetapi tidak dapat menandainya demo", async () => {
    const sah = await asRole(db, "anon", () =>
      attempt(
        db,
        `insert into lead (full_name, phone_wa, cattle_count, region_id, source,
            idempotency_key, consented_at)
         values ('Uji RLS', '081900000009', 2,
            (select id from region where code = 'jabar'), 'other', 'rls-uji-000000000009', now())`,
      ),
    );
    expect(sah).toEqual({ ok: true });

    const demo = await asRole(db, "anon", () =>
      attempt(
        db,
        `insert into lead (full_name, phone_wa, cattle_count, region_id, source,
            idempotency_key, consented_at, is_demo)
         values ('Uji Demo', '081900000008', 2,
            (select id from region where code = 'jabar'), 'other', 'rls-uji-000000000008', now(), true)`,
      ),
    );
    expect(demo.ok).toBe(false);
  });
});

describe("RPC submit_sample_lead", () => {
  it("idempoten: pemanggilan kedua dengan kunci sama tidak membuat baris baru", async () => {
    const pertama = await db.query(
      `select * from submit_sample_lead('Uji RPC', $1, 4, 'jabar', null, null, 'tiktok',
         '{}'::jsonb, $2)`,
      [NOMOR, KUNCI],
    );
    expect(pertama.rows[0].created).toBe(true);

    const kedua = await db.query(
      `select * from submit_sample_lead('Uji RPC', $1, 4, 'jabar', null, null, 'tiktok',
         '{}'::jsonb, $2)`,
      [NOMOR, KUNCI],
    );
    expect(kedua.rows[0].created).toBe(false);
    expect(kedua.rows[0].lead_id).toBe(pertama.rows[0].lead_id);

    const jumlah = await db.query("select count(*)::int as n from lead where idempotency_key = $1", [
      KUNCI,
    ]);
    expect(jumlah.rows[0].n).toBe(1);
  });

  it("menolak wilayah yang tidak dikenal dengan errcode 22023", async () => {
    const hasil = await attempt(
      db,
      `select * from submit_sample_lead('Uji X', '081900000007', 1, 'bali', null, null, 'other',
         '{}'::jsonb, 'rls-uji-000000000007')`,
    );
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.code).toBe("22023");
  });

  it("mencatat jejak funnel ke lead_event", async () => {
    const jejak = await db.query(
      `select count(*)::int as n from lead_event e
       join lead l on l.id = e.lead_id
       where l.idempotency_key = $1 and e.event_name = 'sample_form_submit'`,
      [KUNCI],
    );
    expect(jejak.rows[0].n).toBeGreaterThanOrEqual(1);
  });
});

describe("aturan integritas", () => {
  it("metrik publik tanpa referensi ditolak oleh constraint trigger", async () => {
    const hasil = await attempt(
      db,
      `insert into impact_metric (code, label, value_numeric, unit, period, is_public)
       values ('uji_rls_tanpa_ref', 'Uji', 1, 'ton', 'yearly', true)`,
    );
    expect(hasil.ok).toBe(false);
  });

  it("nomor WhatsApp berformat salah ditolak oleh check constraint", async () => {
    const hasil = await attempt(
      db,
      `insert into lead (full_name, phone_wa, cattle_count, region_id, source,
          idempotency_key, consented_at)
       values ('Uji Format', '12345', 1,
          (select id from region where code = 'jabar'), 'other', 'rls-uji-000000000006', now())`,
    );
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.code).toBe("23514");
  });
});
