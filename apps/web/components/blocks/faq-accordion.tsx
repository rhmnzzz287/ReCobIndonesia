import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: ReadonlyArray<FaqItem>;
}

/**
 * Akordeon berbasis <details>/<summary>: isi tetap terbaca tanpa JavaScript.
 *
 * Komponen ini sengaja TIDAK memakai state maupun `ref` untuk atribut `open`. Versi
 * sebelumnya menyetel `node.open` di dalam callback ref dan menyimpan indeks terbuka di
 * `useState`; keduanya berlomba dengan toggle bawaan peramban. Jejak mutasi terukur:
 * atribut `open` menjadi true lalu false hanya 8 ms kemudian, sehingga hanya item
 * pertama yang bisa dibuka dan sisanya tidak pernah mau terbuka.
 *
 * Penyebabnya: `onToggle` memanggil `setOpenIndex`, React me-render ulang, lalu callback
 * ref dijalankan lagi dan memaksa `node.open = (index === 0)`, yaitu `false` untuk semua
 * item selain yang pertama. Aturan yang sama juga menutup kembali item yang baru saja
 * dibuka.
 *
 * Karena itu keadaan terbuka diserahkan sepenuhnya ke peramban, dan ikon diputar lewat
 * varian `group-open:` milik Tailwind yang membaca selektor `[open]` — tanpa JavaScript.
 */
export function FaqAccordion({ items }: FaqAccordionProps): ReactNode {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      {items.map((item) => (
        <details className="group p-lg" key={item.question}>
          <summary className="flex cursor-pointer items-center justify-between gap-md type-h3 text-ink transition-colors hover:text-primary">
            {item.question}
            <ChevronDown
              aria-hidden="true"
              className="shrink-0 transition-transform duration-300 group-open:rotate-180"
              size={20}
              strokeWidth={1.75}
            />
          </summary>
          <p className="mt-sm type-body-md text-text-secondary">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
