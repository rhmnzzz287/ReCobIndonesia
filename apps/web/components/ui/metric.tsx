import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface MetricValueProps {
  value: string;
  unit: string;
  period: string;
  caption: string;
  tone?: "light" | "dark";
  className?: string;
}

/** Angka tidak pernah tampil tanpa satuan, periode, dan sumber (PRD Bagian 7.1). */
export function MetricValue({
  caption,
  className,
  period,
  tone = "light",
  unit,
  value,
}: MetricValueProps): ReactNode {
  return (
    <figure className={cn("flex flex-col gap-xs", className)}>
      <div className="flex items-baseline gap-xs">
        <span
          className={cn("type-metric-lg", tone === "dark" ? "text-accent" : "text-primary-strong")}
        >
          {value}
        </span>
        <span
          className={cn(
            "type-body-sm",
            tone === "dark" ? "text-surface/80" : "text-text-secondary",
          )}
        >
          {unit}
        </span>
      </div>
      <figcaption
        className={cn(
          "flex flex-col gap-2xs type-caption",
          tone === "dark" ? "text-surface/80" : "text-text-secondary",
        )}
      >
        <span className="type-label-md">{period}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
