import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Hero(): Promise<ReactNode> {
  return (
    <Section id="hero" tone="surface">
      <Container>
        <p className="flex items-center gap-xs rounded-lg bg-amber-soft p-md type-caption text-amber-ink">
          <ShieldCheck aria-hidden="true" size={20} strokeWidth={1.75} />
          {copy.hero.badge}
        </p>
        <p className="mt-md type-label-md uppercase text-primary">{copy.hero.eyebrow}</p>
        <h1 className="mt-sm type-display-xl text-ink">{copy.hero.title}</h1>
        <p className="mt-md type-body-lg text-text-secondary">{copy.hero.subtitle}</p>
        <div className="mt-xl flex flex-wrap gap-sm">
          <ButtonLink href="#form-sampel" size="lg" variant="accent">
            {copy.hero.ctaPrimary}
          </ButtonLink>
          <ButtonLink href="#formulasi" size="lg" variant="secondary">
            {copy.hero.ctaSecondary}
          </ButtonLink>
        </div>
        <div className="mt-2xl grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.priceAnchorLabel}</p>
            <p className="type-metric-md text-primary">{copy.hero.priceAnchorValue}</p>
            <p className="type-caption text-text-secondary">{copy.hero.priceAnchorUnit}</p>
          </div>
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.priceCompareLabel}</p>
            <p className="type-metric-md text-text-secondary">{copy.hero.priceCompareValue}</p>
          </div>
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.priceSavingLabel}</p>
            <p className="type-metric-md text-primary">{copy.hero.priceSavingValue}</p>
          </div>
          <div className="rounded-lg bg-paper p-lg">
            <p className="type-caption text-text-secondary">{copy.hero.highlightFormulationLabel}</p>
            <p className="type-metric-md text-primary">{copy.hero.highlightFormulationValue}</p>
            <p className="type-caption text-text-secondary">
              {copy.hero.highlightFormulationNote}
            </p>
          </div>
        </div>
        <CaptionNote>{copy.hero.priceCaption}</CaptionNote>
        <p className="mt-md type-caption text-text-secondary">
          {copy.hero.standardBadge} • {copy.hero.highlightPaymentLabel}:{" "}
          {copy.hero.highlightPaymentValue} — {copy.hero.highlightPaymentNote}
        </p>
      </Container>
    </Section>
  );
}
