import { demoMetrics, type DemoMetric } from "@/lib/data/demo-data";
import { env } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function fromDemo(): ReadonlyArray<DemoMetric> {
  // demoMetrics sudah hanya memuat metrik bersumber (Task 7 memisahkannya ke larik sendiri).
  return demoMetrics;
}

/**
 * Hanya metrik publik yang bersumber. Aturan yang sama ditegakkan basis data lewat constraint
 * trigger (Docs/SCHEMA.md §3.6): metrik is_public tanpa referensi ditolak.
 */
export async function getPublicMetrics(): Promise<ReadonlyArray<DemoMetric>> {
  if (env.demoMode) return fromDemo();

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("impact_metric")
      .select(
        "code, label, value_numeric, unit, period, period_label, impact_metric_reference(citation_label, citation_url, assumption_note)",
      )
      .eq("is_public", true)
      .order("sort_order", { ascending: true });

    if (error !== null || data === null) {
      throw new Error(error?.message ?? "respons kosong");
    }

    const metrics: DemoMetric[] = data
      .map((row) => ({
        code: row.code,
        label: row.label,
        valueNumeric: Number(row.value_numeric),
        unit: row.unit,
        period: row.period,
        periodLabel: row.period_label ?? "",
        isDemo: true as const,
        references: row.impact_metric_reference.map((reference) => ({
          citationLabel: reference.citation_label,
          citationUrl: reference.citation_url,
          assumptionNote: reference.assumption_note,
        })),
      }))
      .filter((metric) => metric.references.length > 0);

    return metrics.length > 0 ? metrics : fromDemo();
  } catch {
    return fromDemo();
  }
}
