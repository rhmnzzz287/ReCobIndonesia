import type { SubmitLeadInput } from "@recobid/shared/contracts/lead";
import type { Json } from "@recobid/shared/db/types";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type SubmitLeadResult =
  | { status: "created"; leadId: string }
  | { status: "duplicate"; leadId: string }
  | { status: "error"; code: "region_unknown" | "unavailable" };

interface RpcRow {
  lead_id: string;
  created: boolean;
}

/**
 * Membuang properti `undefined` agar objek memenuhi tipe `Json` basis data.
 * Nilai `undefined` tidak mungkin dikirim sebagai JSON; membuangnya di sini lebih jujur
 * daripada memaksa dengan `as`.
 */
function toJson(value: Record<string, string | undefined>): Json {
  const out: Record<string, string> = {};
  for (const [key, v] of Object.entries(value)) {
    if (v === undefined) continue;
    out[key] = v;
  }
  return out;
}

/**
 * Satu-satunya jalur tulis lead: kunci anon + RPC security definer yang idempoten
 * (Docs/SCHEMA.md §4). Idempotensi ganda: kunci idempotensi dari klien dan indeks unik
 * nomor WA di basis data.
 */
export async function submitLead(input: SubmitLeadInput): Promise<SubmitLeadResult> {
  if (env.demoMode) {
    return { status: "error", code: "unavailable" };
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("submit_sample_lead", {
      p_full_name: input.fullName,
      p_phone_wa: input.phoneWa,
      p_cattle_count: input.cattleCount,
      p_region_code: input.regionCode,
      p_kud_slug: input.kudSlug ?? null,
      p_message: input.message ?? null,
      p_source: input.source,
      p_utm: toJson(input.utm),
      p_idempotency_key: input.idempotencyKey,
    });

    if (error !== null) {
      if (error.code === "22023") return { status: "error", code: "region_unknown" };
      if (error.code === "23505") return { status: "duplicate", leadId: "" };
      return { status: "error", code: "unavailable" };
    }

    const row = (data as RpcRow[] | null)?.[0];
    if (row === undefined) return { status: "error", code: "unavailable" };

    return row.created
      ? { status: "created", leadId: row.lead_id }
      : { status: "duplicate", leadId: row.lead_id };
  } catch {
    return { status: "error", code: "unavailable" };
  }
}
