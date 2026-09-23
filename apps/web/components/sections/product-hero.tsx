import { ArrowDown } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { CountUp } from "@/components/blocks/count-up";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Panggung pembuka halaman produk: bidang terang, judul display besar, foto produk, dan bilah fakta.
 *
 * Bentuk sebelumnya menaruh seluruh teks di atas foto gelap. Selubung 70% diperlukan supaya kontras
 * teks putih lolos, dan akibatnya foto produk — satu-satunya bukti visual yang dimiliki halaman ini —
 * nyaris tidak terlihat. Di sini foto berdiri sendiri sebagai bidang penuh di samping salinan, jadi
 * tidak ada lagi selubung dan tidak ada lagi perhitungan kontras di atas gambar.
 *
 * Bilah fakta di bawah memakai angka yang sama dengan `copy.product.specs` (isi karung, masa simpan,
 * kadar air) supaya pengunjung langsung tahu ukuran produknya tanpa membuka bagian spesifikasi.
 * Foto memakai `priority` karena ia elemen terbesar di viewport pertama.
 */
export function ProductHero(): ReactNode {
  return (
    <Section
      className="overflow-hidden rounded-b-arc pb-2xl pt-[calc(var(--header-h)+var(--spacing-lg))] lg:pb-3xl"
      id="produk-hero"
      tone="cream"
    >
      <Container>
        <div className="grid gap-2xl lg:grid-cols-2 lg:items-center">
          <div data-reveal="">
            <p className="type-label-md uppercase text-primary">{copy.productStory.heroBadge}</p>
            <h1 className="mt-sm type-display-xl text-ink">{copy.productStory.heroTitle}</h1>
            <p className="mt-lg max-w-[52ch] type-body-lg text-text-secondary">
              {copy.productStory.heroLead}
            </p>
            <p className="mt-sm max-w-[52ch] type-body-sm text-text-secondary">
              {copy.productStory.heroCaption}
            </p>
            <div className="mt-xl flex flex-wrap gap-sm">
              <ButtonLink href="/kontak#form-sampel" size="lg" variant="accent">
                {copy.hero.ctaPrimary}
              </ButtonLink>
              <ButtonLink href="/kalkulator" size="lg" variant="secondary">
                {copy.productStory.comparisonCta}
              </ButtonLink>
            </div>
            <p className="mt-lg flex items-center gap-xs type-caption text-text-secondary">
              <ArrowDown aria-hidden="true" size={16} strokeWidth={1.75} />
              {copy.productStory.heroScrollLabel}
            </p>
          </div>

          <figure
            className="overflow-hidden rounded-xl border border-border bg-surface"
            data-reveal=""
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <Image
              alt={copy.productStory.heroPhotoAlt}
              className="h-auto w-full object-cover"
              height={932}
              priority
              sizes="(min-width: 1024px) 560px, 92vw"
              src="/img/produk/produk-hero.webp"
              width={1600}
            />
          </figure>
        </div>

        <div className="mt-2xl border-t border-border pt-lg" data-reveal="">
          <h2 className="type-label-md uppercase text-text-secondary" id="angka-produk">
            {copy.productStory.figuresTitle}
          </h2>
          <dl className="mt-md grid grid-cols-2 gap-lg sm:grid-cols-4">
            {copy.productStory.figures.map((figure) => (
              <div key={figure.label}>
                <dd className="type-metric-md text-primary-strong">
                  <CountUp
                    prefix={"prefix" in figure ? figure.prefix : ""}
                    suffix={"suffix" in figure ? figure.suffix : ""}
                    value={figure.value}
                  />
                </dd>
                <dt className="mt-2xs type-caption text-text-secondary">{figure.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </Section>
  );
}
