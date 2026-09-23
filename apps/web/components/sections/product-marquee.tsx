import type { ReactNode } from "react";
import { copy } from "@/content/copy";

/**
 * Pita alur produksi yang bergulir sendiri.
 *
 * Ada dua daftar di sini, dan pembagiannya disengaja:
 *
 * - `#pita-alur-daftar` adalah daftar proses yang sebenarnya, dirender sebagai daftar semantik biasa
 *   dan disembunyikan secara visual. Pembaca layar mendengarnya sekali, lengkap, tanpa animasi.
 * - `#pita-alur-trek` adalah salinan dekoratif yang digandakan lalu digeser. Ia `aria-hidden` supaya
 *   isinya tidak diumumkan dua kali, dan penggandaannya hanya supaya sambungan animasi tidak
 *   terlihat: saat salinan pertama habis, animasi mengulang tepat di titik yang sama.
 *
 * Versi sebelumnya menandai seluruh pita `aria-hidden`, sehingga tidak ada satu pun bagian alur ini
 * yang sampai ke pembaca layar. Gerakan dimatikan oleh `prefers-reduced-motion` di `globals.css`
 * dan oleh `motion-reduce:` pada kelas animasinya.
 */
export function ProductMarquee(): ReactNode {
  const items = copy.productStory.marquee;

  return (
    <section aria-labelledby="pita-alur" className="border-y border-border bg-ink py-md">
      <h2 className="sr-only" id="pita-alur">
        {copy.productStory.marqueeTitle}
      </h2>

      <ul className="sr-only" id="pita-alur-daftar">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
        <ul
          aria-hidden="true"
          className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center gap-2xl pr-2xl motion-reduce:animate-none"
          id="pita-alur-trek"
        >
          {[...items, ...items].map((item, index) => (
            <li
              className="flex items-center gap-sm whitespace-nowrap type-label-md uppercase text-surface/85"
              key={`${item}-${String(index)}`}
            >
              <span className="h-2 w-2 rounded-pill bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
