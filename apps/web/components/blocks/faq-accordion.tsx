"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
}

/**
 * Akordeon berbasis <details>/<summary> agar isi tetap terbaca tanpa JavaScript.
 * Elemen dibiarkan tidak terkendali (uncontrolled); state hanya memutar ikon.
 */
export function FaqAccordion({ items }: FaqAccordionProps): ReactNode {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <details
            className="p-lg"
            key={item.question}
            // Atribut `open` disetel sekali lewat ref, bukan sebagai prop: menuliskan
            // `open={isOpen}` menjadikan <details> terkendali penuh dan akordeon tidak
            // dapat dibuka manual. `defaultOpen` tidak ada pada tipe JSX <details>
            // (itu milik <dialog>).
            ref={(node) => {
              if (node === null || node.open === (index === 0)) return;
              node.open = index === 0;
            }}
            onToggle={(event) => {
              setOpenIndex(event.currentTarget.open ? index : null);
            }}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-md type-h3 text-ink">
              {item.question}
              <ChevronDown
                aria-hidden="true"
                className={cn("shrink-0 transition-transform", isOpen && "rotate-180")}
                size={20}
                strokeWidth={1.75}
              />
            </summary>
            <p className="mt-sm type-body-md text-text-secondary">{item.answer}</p>
          </details>
        );
      })}
    </div>
  );
}
