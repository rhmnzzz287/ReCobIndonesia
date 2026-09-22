import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MetricValueProps {
  value: string;
  /** Satuan tampil; dikosongkan bila nilai sudah memuat satuan (mis. "Rp40.000"). */
  unit?: string;
  period: string;
  caption: string;
  tone?: "light" | "dark";
  className?: string;
}

/**
 * Angka tidak pernah tampil tanpa satuan, periode, dan sumber (PRD Bagian 7.1).
 *
 * Ukuran angka sengaja `metric-md`, bukan `metric-lg`: pada kartu selebar 368 px, nilai
 * terpanjang ("4,6 juta ton") butuh 368 px pada 72 px sehingga membungkus dua baris dan
 * membuat tinggi kartu dalam satu baris tidak rata. Angka 32 px menjaga satu baris.
 */
export function MetricValue({
  caption,
  className,
  period,
  tone = "light",
  unit,
  value,
}: MetricValueProps): ReactNode {
  return (
    <figure className={cn("flex h-full flex-col", className)}>
      <p
        className={cn(
          "type-metric-md",
          tone === "dark" ? "text-accent" : "text-primary-strong",
        )}
      >
        {value}
        {unit === undefined || unit.length === 0 ? null : (
          <span
            className={cn(
              "ml-xs type-body-sm",
              tone === "dark" ? "text-surface/80" : "text-text-secondary",
            )}
          >
            {unit}
          </span>
        )}
      </p>
      <figcaption
        className={cn(
          "mt-sm type-body-sm",
          tone === "dark" ? "text-surface/90" : "text-text",
        )}
      >
        {caption}
      </figcaption>
      <p
        className={cn(
          "mt-auto pt-sm type-caption",
          tone === "dark" ? "text-surface/75" : "text-text-secondary",
        )}
      >
        {period}
      </p>
    </figure>
  );
}
