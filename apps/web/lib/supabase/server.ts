import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@recobid/shared/db/types";
import { env } from "@/lib/env";

/**
 * Klien sisi server (Server Component / Server Action).
 *
 * Memakai kunci anon: tidak ada kunci istimewa di aplikasi web (spec ADR-011). Setiap permintaan
 * dibatasi waktu agar satu basis data yang lambat tidak menahan render.
 */
export function createServerSupabaseClient(): SupabaseClient<Database> {
  if (env.supabaseUrl === null || env.supabaseAnonKey === null) {
    throw new Error("Kredensial Supabase belum diisi; aktifkan DEMO_MODE untuk pengembangan lokal.");
  }
  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(5_000) }),
    },
  });
}
