import type { CSSProperties, ReactNode } from "react";
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
 *
 * Tata letak: `auto-rows-fr` + `h-full` menjaga tinggi kartu dalam satu baris sama walau
 * panjang label berbeda; periode didorong ke dasar kartu oleh `mt-auto` di `MetricValue`.
 * Label dan sumber dipisah garis tipis agar empat lapis teks tidak menumpuk jadi satu blok.
 */
export function MetricPanel({ metrics }: MetricPanelProps): ReactNode {
  return (
    <ul className="grid auto-rows-fr gap-md md:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric, index) => {
        const notes = metric.references
          .map((reference) => reference.assumptionNote)
          .filter((note) => note.length > 0);

        return (
          <li
            className="flex h-full flex-col rounded-lg border border-surface/15 bg-surface/5 p-lg"
            data-reveal=""
            key={metric.code}
            style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
          >
            <MetricValue
              caption={metric.label}
              period={metric.periodLabel}
              tone="dark"
              value={formatMetricValue(metric.valueNumeric, metric.unit)}
            />
            {notes.length > 0 ? (
              <p className="mt-sm type-caption text-surface/75">
                {notes.join(" ")}
              </p>
            ) : null}
            <ul className="mt-auto flex flex-col gap-2xs border-t border-surface/15 pt-sm">
              {metric.references.map((reference) => (
                <li
                  className="type-caption text-surface/75"
                  key={reference.citationLabel}
                >
                  {reference.citationUrl === null ? (
                    reference.citationLabel
                  ) : (
                    <a
                      className="underline decoration-surface/40 underline-offset-2 hover:decoration-surface"
                      href={reference.citationUrl}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {reference.citationLabel}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ul>
  );
}
