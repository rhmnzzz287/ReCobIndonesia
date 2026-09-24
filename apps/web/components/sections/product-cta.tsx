import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/** Penutup konversi ringkas untuk halaman yang tidak memiliki formulir penuh. */
export function ProductCta(): ReactNode {
  return (
    <Section id="cta-produk" labelledBy="cta-produk-title" tone="surface">
      <Container className="grid gap-lg lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="type-label-md uppercase text-primary">{copy.cta.compact.eyebrow}</p>
          <h2 className="mt-sm type-display-md text-ink" id="cta-produk-title">
            {copy.cta.compact.title}
          </h2>
        </div>
        <div className="flex flex-col gap-sm sm:flex-row sm:flex-wrap">
          <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="accent">
            {copy.cta.preorderLabel}
          </ButtonLink>
          <ButtonLink className="w-full sm:w-auto" href="/kontak#form-sampel" size="lg" variant="secondary">
            {copy.cta.sampleLabel}
          </ButtonLink>
        </div>
        <p className="type-body-md text-text-secondary lg:col-span-2 lg:max-w-[60ch]">
          {copy.cta.compact.intro}
        </p>
      </Container>
    </Section>
  );
}
