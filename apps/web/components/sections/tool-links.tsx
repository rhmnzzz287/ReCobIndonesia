import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Kisi tautan ke halaman sekunder.
 *
 * Inilah yang membuat alur pelanggan berpindah halaman, bukan berhenti di beranda: setiap kartu
 * menjawab satu pertanyaan yang berbeda (apa produknya, berapa hematnya, bagaimana caranya,
 * bagaimana menghubungi). Tanpa bagian ini empat halaman itu tidak punya jalan masuk selain menu.
 */
export function ToolLinks(): ReactNode {
  return (
    <Section id="jelajahi" tone="surface">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <h2 className="type-h2 text-ink">{copy.toolLinks.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">{copy.toolLinks.intro}</p>
        </div>

        <div className="mt-xl grid gap-lg sm:grid-cols-2">
          {copy.toolLinks.items.map((item, index) => (
            <Link
              className="group flex min-h-11 flex-col rounded-lg border border-border bg-paper p-lg transition-colors hover:border-primary"
              data-reveal=""
              href={item.href}
              key={item.href}
              style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
            >
              <span className="flex items-center gap-xs type-h3 text-ink">
                {item.title}
                <ArrowRight
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                  size={18}
                  strokeWidth={1.75}
                />
              </span>
              <span className="mt-xs type-body-sm text-text-secondary">{item.body}</span>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
