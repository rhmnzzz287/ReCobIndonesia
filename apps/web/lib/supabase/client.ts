import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@recobid/shared/db/types";
import { env } from "@/lib/env";

let cached: SupabaseClient<Database> | null = null;

/** Klien peramban memakai kunci anon; RLS adalah gerbang sebenarnya. */
export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (env.supabaseUrl === null || env.supabaseAnonKey === null) {
    throw new Error("Kredensial Supabase belum diisi; aktifkan DEMO_MODE untuk pengembangan lokal.");
  }
  if (cached === null) {
    cached = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
