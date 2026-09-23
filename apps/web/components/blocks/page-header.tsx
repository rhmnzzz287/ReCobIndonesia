import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";

export interface PageHeaderProps {
  eyebrow: string;
  title: string;
  intro: string;
}

/**
 * Judul halaman sekunder. Satu pola untuk lima rute supaya tinggi, jarak, dan ukuran hurufnya
 * seragam — kalau tiap halaman menyusun kepalanya sendiri, perbedaannya baru terlihat setelah
 * beberapa halaman ditulis.
 */
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps): ReactNode {
  return (
    <div className="border-b border-border bg-cream">
      <Container>
        <div className="max-w-[68ch] pb-2xl pt-[calc(var(--header-h)+var(--spacing-lg))] lg:pt-[calc(var(--header-h)+var(--spacing-xl))]">
          <p className="type-label-md uppercase text-primary">{eyebrow}</p>
          <h1 className="mt-sm type-h1 text-ink">{title}</h1>
          <p className="mt-md type-body-lg text-text-secondary">{intro}</p>
        </div>
      </Container>
    </div>
  );
}
