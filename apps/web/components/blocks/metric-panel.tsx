import type { ReactNode } from "react";
import { MetricValue } from "@/components/ui/metric";
import type { DemoMetric } from "@/lib/data/demo-data";
import { formatMetricValue } from "@/lib/utils/format";

export interface MetricPanelProps {
  metrics: ReadonlyArray<DemoMetric>;
}

/**
 * Setiap metrik wajib tampil bersama periode dan caption sumbernya (PRD Bagian 8).
 * Panel menolak metrik tanpa referensi — lapis pertahanan kedua setelah tipe
 * `DemoMetric.references` yang tidak dapat kosong dan constraint trigger di basis data.
 */
export function MetricPanel({ metrics }: MetricPanelProps): ReactNode {
  return (
    <ul className="grid gap-lg md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => (
        <li key={metric.code}>
          <MetricValue
            caption={metric.references.map((reference) => reference.citationLabel).join("; ")}
            period={metric.periodLabel}
            tone="dark"
            unit={metric.unit}
            value={formatMetricValue(metric.valueNumeric, metric.unit)}
          />
          <p className="mt-xs type-body-sm text-surface/85">{metric.label}</p>
          {metric.references.some((reference) => reference.assumptionNote.length > 0) ? (
            <p className="mt-2xs type-caption text-surface/70">
              {metric.references
                .map((reference) => reference.assumptionNote)
                .filter((note) => note.length > 0)
                .join(" ")}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
