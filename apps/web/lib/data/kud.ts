import { demoKudSlugs } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Nama KUD aktif. Kebijakan RLS hanya membuka baris berstatus `active` untuk anonim
 * (Docs/SCHEMA.md §3.7), jadi daftar ini memang kosong sebelum kemitraan berjalan.
 * Bila kosong, seksi kemitraan menampilkan `copy.partnership.kudNames` dari lapisan konten.
 */
export async function getActiveKudNames(): Promise<ReadonlyArray<string>> {
  if (env.demoMode) return [];

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("kud")
      .select("name, slug")
      .eq("status", "active")
      .order("name", { ascending: true });

    if (error !== null || data === null) return [];

    const known = new Set(demoKudSlugs);
    return data.filter((row) => known.has(row.slug)).map((row) => row.name);
  } catch {
    return [];
  }
}
