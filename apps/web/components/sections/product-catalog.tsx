import { ArrowRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { groupProductsByCategory } from "@/lib/data/products";
import type { DemoProduct } from "@/lib/data/demo-data";
import { formatIdr } from "@/lib/utils/format";

export interface ProductCatalogProps {
  products: ReadonlyArray<DemoProduct>;
}

/** Katalog produk ringkas seperti kartu kategori Nufeed, tanpa route detail baru. */
export function ProductCatalog({ products }: ProductCatalogProps): ReactNode {
  const groups = groupProductsByCategory(products);
  const catalogCopy = copy.pages.produk.catalog;

  return (
    <Section id="katalog-produk" labelledBy="katalog-produk-judul" tone="surface">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">{catalogCopy.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink" id="katalog-produk-judul">
            {catalogCopy.title}
          </h2>
          <p className="mt-md type-body-md text-text-secondary">{catalogCopy.intro}</p>
        </div>

        {groups.length === 0 ? (
          <div className="mt-2xl rounded-md bg-paper p-xl" data-reveal="">
            <h3 className="type-h3 text-ink">{catalogCopy.emptyTitle}</h3>
            <p className="mt-xs type-body-sm text-text-secondary">{catalogCopy.emptyBody}</p>
          </div>
        ) : (
          <div className="mt-2xl flex flex-col gap-3xl">
            {groups.map((group, groupIndex) => (
              <section
                aria-labelledby={`katalog-kategori-${groupIndex + 1}`}
                key={group.category}
              >
                <h3
                  className="type-h3 text-ink"
                  id={`katalog-kategori-${groupIndex + 1}`}
                >
                  {group.category}
                </h3>
                <div className="mt-lg grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
                  {group.products.map((product) => (
                    <article
                      className="flex flex-col rounded-md border border-border bg-paper p-md"
                      data-reveal=""
                      key={product.slug}
                    >
                      <div className="relative min-h-56 rounded-sm bg-cream p-md">
                        <Image
                          alt={product.name}
                          className="object-contain"
                          fill
                          sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 90vw"
                          src={product.imagePath || "/img/produk/karung-50kg.webp"}
                        />
                      </div>
                      <div className="mt-md flex flex-1 flex-col">
                        <h4 className="type-h3 text-ink">{product.name}</h4>
                        <p className="mt-2xs type-caption uppercase text-text-secondary">
                          {catalogCopy.priceLabel}
                        </p>
                        <p className="mt-xs font-mono-data type-metric-md text-primary-strong">
                          {formatIdr(product.priceIdr)}
                        </p>
                        <p className="mt-2xs type-body-sm text-text-secondary">
                          {catalogCopy.priceUnit} {product.unit} {product.packWeightKg}{" "}
                          {catalogCopy.weightUnit}
                        </p>
                        <div className="mt-lg flex flex-wrap gap-sm">
                          <ButtonLink href="/kontak#form-sampel" variant="accent">
                            {copy.cta.preorderLabel}
                          </ButtonLink>
                          <ButtonLink href="/kalkulator" variant="secondary">
                            {catalogCopy.cta}
                            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                          </ButtonLink>
                          <ButtonLink href="/spesifikasi-produk" variant="ghost">
                            {catalogCopy.specificationCta}
                            <ArrowRight aria-hidden="true" size={18} strokeWidth={1.75} />
                          </ButtonLink>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
