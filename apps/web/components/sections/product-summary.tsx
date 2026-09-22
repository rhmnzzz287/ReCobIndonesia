import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { formatIdr } from "@/lib/utils/format";

export interface ProductSummaryProps {
  product: {
    name: string;
    description: string;
    priceIdr: number;
    packWeightKg: number;
  };
}

/**
 * Ringkasan produk di beranda.
 *
 * Sebelumnya beranda memuat seluruh seksi produk (komposisi, spesifikasi, protokol transisi).
 * Isi itu kini tinggal di `/produk`, dan di sini hanya tersisa penawaran beserta tautan —
 * supaya beranda tetap menjadi halaman naratif, bukan katalog.
 *
 * Harga dibaca dari `getPrimaryProduct()` lewat prop, tidak pernah ditulis di komponen.
 */
export function ProductSummary({ product }: ProductSummaryProps): ReactNode {
  return (
    <Section id="produk-ringkas" tone="paper">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">{copy.productSummary.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink">{copy.productSummary.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">{copy.productSummary.intro}</p>
        </div>

        <div className="mt-xl flex flex-wrap items-end justify-between gap-lg" data-reveal="">
          <div className="min-w-0">
            <p className="type-label-md uppercase text-text-secondary">{product.name}</p>
            <p className="mt-xs font-mono-data type-metric-md text-primary-strong">
              {formatIdr(product.priceIdr)}
              <span className="type-body-sm text-text-secondary">
                {" "}
                / karung {product.packWeightKg} kg
              </span>
            </p>
          </div>

          <ButtonLink href="/produk" variant="secondary">
            {copy.productSummary.ctaLabel}
            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
