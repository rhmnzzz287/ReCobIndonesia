import { ShieldCheck } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CaptionNoteInverse } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Pita hero: bidang `primary` penuh lebar dengan lengkung bawah `arc`, satu angka pahlawan
 * berukuran `metric-lg`, dan deretan angka kredibilitas di bawahnya. Pengganti foto hero —
 * identitas dibawa bidang warna dan tipografi (DESIGN.md, bagian Layout).
 */
export async function Hero(): Promise<ReactNode> {
  const stats = [
    { label: copy.hero.statKudUnit, value: copy.hero.statKudValue },
    { label: copy.hero.statCattleUnit, value: copy.hero.statCattleValue },
    { label: copy.hero.statFarmerUnit, value: copy.hero.statFarmerValue },
  ];

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
      className="rounded-b-arc pb-2xl lg:pb-3xl"
      id="hero"
      tone="primary"
    >
      <Container>
        <p className="flex items-center gap-xs type-caption text-surface/90">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} />
          {copy.hero.badge}
        </p>

        <div className="mt-2xl grid gap-2xl lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div data-reveal="">
            <p className="type-label-md uppercase text-primary-soft">
              {copy.hero.eyebrow}
            </p>
            <h1 className="mt-sm type-display-xl text-surface">
              {copy.hero.title}
            </h1>
            <p className="mt-lg max-w-[46ch] type-body-lg text-surface/90">
              {copy.hero.subtitle}
            </p>
            <div className="mt-xl flex flex-wrap gap-sm">
              <ButtonLink href="#form-sampel" size="lg" variant="accent">
                {copy.hero.ctaPrimary}
              </ButtonLink>
              <ButtonLink href="#formulasi" size="lg" variant="secondary">
                {copy.hero.ctaSecondary}
              </ButtonLink>
            </div>
          </div>

          <figure
            data-reveal=""
            style={{ "--reveal-delay": "140ms" } as CSSProperties}
          >
            <p className="type-metric-lg text-primary-soft">
              {copy.hero.statLeadValue}
            </p>
            <figcaption className="mt-xs">
              <span className="type-label-md uppercase text-surface">
                {copy.hero.statLeadLabel}
              </span>
              <span className="mt-2xs block type-body-md text-surface/90">
                {copy.hero.statLeadUnit}
              </span>
            </figcaption>
            <p className="mt-sm border-t border-surface/30 pt-sm type-caption text-surface/85">
              {copy.hero.statLeadCaption}
            </p>
          </figure>
        </div>

        <ul className="mt-2xl grid gap-lg border-t border-surface/30 pt-xl sm:grid-cols-3">
          {stats.map((stat, index) => (
            <li
              data-reveal=""
              key={stat.label}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <p className="type-metric-md text-surface">{stat.value}</p>
              <p className="mt-2xs type-body-sm text-surface/90">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-sm type-caption text-surface/85">
          {copy.hero.statScaleCaption}
        </p>

        <dl className="mt-2xl grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          {priceRows.map((row, index) => (
            <div
              className="rounded-md bg-surface/10 p-lg transition-colors hover:bg-surface/15"
              data-reveal=""
              key={row.label}
              style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
            >
              <dt className="type-caption text-surface">{row.label}</dt>
              <dd className="mt-2xs type-h3 text-surface">{row.value}</dd>
            </div>
          ))}
        </dl>
        <CaptionNoteInverse className="mt-md">
          {copy.hero.priceCaption}
        </CaptionNoteInverse>

        <p className="mt-md type-caption text-surface/85">
          {copy.hero.standardBadge} • {copy.hero.highlightPaymentLabel}:{" "}
          {copy.hero.highlightPaymentValue} — {copy.hero.highlightPaymentNote}
        </p>
      </Container>
    </Section>
  );
}
