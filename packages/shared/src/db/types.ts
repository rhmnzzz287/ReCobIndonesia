/**
 * Tipe basis data ReCob.id.
 *
 * Re-ekspor dari berkas hasil generate. Perubahan manual pada tipe adalah pelanggaran review
 * (Docs/SCHEMA.md §8).
 *
 * `database.types.ts` dihasilkan oleh:
 *   - `npm run db:gen-types` (dari project Supabase tertaut; sumber kebenaran untuk rilis), atau
 *   - `npm run db:gen-types:local` (dari Postgres lokal, untuk pengembangan tanpa project tertaut).
 */

export type { Database, Json } from "./database.types";
