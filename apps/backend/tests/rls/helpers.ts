import { Client } from "pg";

/**
 * Tes RLS berbicara langsung ke Postgres. Tanpa Docker, tidak ada basis data lokal dari
 * Supabase CLI, jadi tes ini menuntut `SUPABASE_DB_URL` yang benar-benar dapat dijangkau
 * (project hosted atau cluster Postgres lokal — lihat `scripts/dev-db/README.md`).
 */
export function databaseUrl(): string {
  const url = process.env.SUPABASE_DB_URL;
  if (url === undefined || url.length === 0) {
    throw new Error("SUPABASE_DB_URL belum diisi; tes RLS memerlukan basis data nyata.");
  }
  return url;
}

export async function connect(): Promise<Client> {
  const client = new Client({ connectionString: databaseUrl(), connectionTimeoutMillis: 8000 });
  await client.connect();
  return client;
}

/** Menjalankan blok dengan peran tertentu, lalu selalu kembali ke peran semula. */
export async function asRole<T>(client: Client, role: string, fn: () => Promise<T>): Promise<T> {
  await client.query(`set role ${role}`);
  try {
    return await fn();
  } finally {
    await client.query("reset role");
  }
}

export type Hasil = { ok: true } | { ok: false; code: string };

/** Menjalankan kueri dan melaporkan galat sebagai nilai, bukan lemparan. */
export async function attempt(client: Client, sql: string, params: unknown[] = []): Promise<Hasil> {
  try {
    await client.query(sql, params);
    return { ok: true };
  } catch (err) {
    const code = (err as { code?: string }).code ?? "TANPA_KODE";
    return { ok: false, code };
  }
}
