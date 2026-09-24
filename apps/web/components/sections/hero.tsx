import { ShieldCheck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Hero bergaya locol.company: satu bidang hijau limau terang penuh lebar dengan lengkung
 * bawah `arc`, judul raksasa, satu angka pahlawan, dan empat kartu harga.
 *
 * Warna: locol memakai rgb(148, 185, 78) dengan teks gelap. Token `lime` (#8FBF4E) adalah
 * padanan terdekat yang tetap memenuhi kontras — `ink` 8,72:1 dan `primary-strong` 4,50:1
 * di atasnya, sedangkan `text-secondary` hanya 3,38:1 sehingga TIDAK boleh dipakai di pita
 * ini. Karena itu seluruh teks hero memakai `ink`/`ink-deep`/`primary-strong`, bukan putih.
 *
 * Angka 20% adalah hitungan worst-case dari asumsi replacement rate NRC yang dipakai
 * validator, bukan janji yield penggembaran atau penghematan.
 */
export async function Hero(): Promise<ReactNode> {
  const priceRows = [
    { label: copy.hero.priceAnchorLabel, value: copy.hero.priceAnchorValue },
    { label: copy.hero.priceCompareLabel, value: copy.hero.priceCompareValue },
    { label: copy.hero.priceSavingLabel, value: copy.hero.priceSavingValue },
    {
      label: copy.hero.highlightFormulationLabel,
      value: copy.hero.highlightFormulationValue,
    },
  ];

  return (
    <Section
      className="rounded-b-arc pb-2xl pt-[calc(var(--header-h)+var(--spacing-lg))] lg:pb-3xl lg:pt-[calc(var(--header-h)+var(--spacing-xl))]"
      id="hero"
      tone="lime"
    >
      <Container>
        <p className="flex items-center gap-xs type-caption text-ink-deep">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} />
          {copy.hero.badge}
        </p>

        <div className="mt-2xl grid gap-2xl lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div data-reveal="">
            <p className="type-label-md uppercase text-primary-strong">
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-sm type-display-xl text-ink">
              {copy.hero.title}
            </h1>
            <p className="mt-lg max-w-[44ch] type-body-lg text-ink-deep">
              {copy.hero.subtitle}
            </p>
            <div className="mt-xl flex flex-col gap-sm sm:flex-row sm:flex-wrap">
              <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="primary">
                {copy.cta.preorderLabel}
              </ButtonLink>
              <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="secondary">
                {copy.cta.sampleLabel}
              </ButtonLink>
            </div>
          </div>

          <figure
            data-reveal=""
            style={{ "--reveal-delay": "140ms" } as CSSProperties}
          >
            <p className="type-metric-lg text-ink">{copy.hero.statLeadValue}</p>
            <figcaption className="mt-xs">
              <span className="type-label-md uppercase text-ink-deep">
                {copy.hero.statLeadLabel}
              </span>
              <span className="mt-2xs block type-body-md text-ink-deep">
                {copy.hero.statLeadUnit}
              </span>
            </figcaption>
            <p className="mt-sm border-t border-ink/25 pt-sm type-caption text-ink-deep">
              {copy.hero.statLeadCaption}
            </p>
          </figure>
        </div>

        <dl className="mt-2xl grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {priceRows.map((row, index) => (
            <div
              className="rounded-md bg-surface/45 p-lg transition-colors hover:bg-surface/60"
              data-reveal=""
              key={row.label}
              style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
            >
              <dt className="type-caption text-ink-deep">{row.label}</dt>
              <dd className="mt-2xs type-h3 text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-md rounded-sm bg-surface/35 px-sm py-xs">
          <p className="text-center type-caption text-ink-deep">{copy.hero.priceCaption}</p>
        </div>
      </Container>
    </Section>
  );
}
