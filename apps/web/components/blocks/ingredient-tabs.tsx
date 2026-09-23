"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface IngredientTabsProps {
  items: ReadonlyArray<{ name: string; functionLabel: string; shareLabel: string }>;
  label: string;
  shareLabel: string;
}

/**
 * Bahan sebagai tab: satu panel tampil penuh, sisanya hanya baris judul.
 *
 * Bentuk sebelumnya — chip di atas daftar yang sudah memuat semua keterangan — membuat kliknya
 * tidak mengubah apa pun yang berarti: seluruh teks sudah terbaca sebelum chip disentuh, jadi
 * interaksinya hanya hiasan. Di sini panel benar-benar berganti isi, dan chip-nya jadi berguna.
 *
 * Penanda `role="tablist"`/`role="tab"`/`aria-selected` dipakai supaya pembaca layar mengumumkan
 * "tab, terpilih" alih-alih tombol tanpa akibat yang jelas.
 */
export function IngredientTabs({
  items,
  label,
  shareLabel,
}: IngredientTabsProps): ReactNode {
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];

  if (current === undefined) return null;

  return (
    <div>
      <div aria-label={label} className="flex flex-col gap-xs" role="tablist">
        {items.map((item, index) => (
          <button
            aria-selected={index === active}
            className={cn(
              "flex min-h-12 items-center justify-between gap-md rounded-md px-md text-left transition-colors",
              index === active
                ? "bg-primary text-surface"
                : "border border-border bg-surface text-text hover:border-primary",
            )}
            key={item.name}
            onClick={() => {
              setActive(index);
            }}
            role="tab"
            type="button"
          >
            <span className="type-h3">{item.name}</span>
            <span
              className={cn(
                "type-mono-data",
                index === active ? "text-surface" : "text-primary",
              )}
            >
              {item.shareLabel}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-md rounded-md bg-surface p-lg" data-testid="panel-bahan" role="tabpanel">
        <p className="type-label-md uppercase text-primary">{current.name}</p>
        <p className="mt-xs type-body-md text-text">{current.functionLabel}</p>
        <p className="mt-sm type-mono-data text-text-secondary">
          {shareLabel} {current.shareLabel}
        </p>
      </div>
    </div>
  );
}
