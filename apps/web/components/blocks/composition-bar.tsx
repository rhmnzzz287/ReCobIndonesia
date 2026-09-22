import type { ReactNode } from "react";
import type { DemoIngredient } from "@/lib/data/demo-data";

export interface CompositionBarProps {
  ingredients: ReadonlyArray<DemoIngredient>;
}

/** Batang komposisi proporsional; nilai selalu tampil sebagai teks, bukan hanya warna. */
export function CompositionBar({ ingredients }: CompositionBarProps): ReactNode {
  const total = ingredients.reduce(
    (sum, item) => sum + (item.shareMinPct + item.shareMaxPct) / 2,
    0,
  );

  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-pill border border-border">
        {ingredients.map((item, index) => {
          const share = (item.shareMinPct + item.shareMaxPct) / 2;
          const width = total > 0 ? (share / total) * 100 : 0;
          return (
            <span
              aria-hidden="true"
              className={index % 2 === 0 ? "bg-primary" : "bg-accent"}
              key={item.name}
              style={{ width: `${width.toFixed(2)}%` }}
            />
          );
        })}
      </div>
      <dl className="mt-md grid gap-xs sm:grid-cols-2">
        {ingredients.map((item, index) => (
          <div className="flex items-center gap-xs" key={item.name}>
            <span
              aria-hidden="true"
              className={`h-3 w-3 shrink-0 rounded-xs ${index % 2 === 0 ? "bg-primary" : "bg-accent"}`}
            />
            <dt className="type-body-sm text-text">{item.name}</dt>
            <dd className="type-mono-data text-text-secondary">
              {item.shareMinPct}–{item.shareMaxPct}%
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
