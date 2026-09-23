import type { ReactNode } from "react";
import { copy } from "@/content/copy";

/**
 * Pita alur produksi yang bergulir sendiri.
 *
 * Daftarnya ditulis dua kali di dalam satu trek: saat trek pertama habis, animasi mengulang dan
 * mata pembaca melihat sambungan yang mulus — itulah satu-satunya alasan penggandaan ini. Gerakan
 * dimatikan oleh `prefers-reduced-motion` dan oleh `motion-reduce:` pada kelas animasinya.
 *
 * Pita ini `aria-hidden`: isinya pengulangan ringkas alur yang sudah dijelaskan lengkap di seksi
 * bahan dan kemasan, jadi pembaca layar tidak perlu mendengarnya dua kali.
 */
export function ProductMarquee(): ReactNode {
  return (
    <section aria-labelledby="pita-alur" className="border-y border-border bg-ink py-md">
      <h2 className="sr-only" id="pita-alur">
        {copy.productStory.marqueeTitle}
      </h2>
      <div
        aria-hidden="true"
        className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]"
      >
        <ul className="flex shrink-0 animate-[marquee_38s_linear_infinite] items-center gap-2xl pr-2xl motion-reduce:animate-none">
          {[...copy.productStory.marquee, ...copy.productStory.marquee].map((item, index) => (
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
