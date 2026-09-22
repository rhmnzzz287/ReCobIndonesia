import type { ReactNode } from "react";
import { SampleForm } from "@/components/blocks/sample-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getRegions } from "@/lib/data/regions";

export async function Cta(): Promise<ReactNode> {
  const regions = await getRegions();

  return (
    <Section id="form-sampel" tone="cream">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.cta.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.cta.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.cta.intro}</p>

        <ul className="mt-md list-disc space-y-xs pl-lg type-body-sm text-text-secondary">
          {copy.cta.benefits.map((benefit) => (
            <li key={benefit}>{benefit}</li>
          ))}
        </ul>

        <div className="mt-lg">
          <ButtonLink external href="https://wa.me/6281200000000" variant="secondary">
            {copy.cta.whatsappHelp}
          </ButtonLink>
        </div>

        <div className="mt-xl max-w-[720px]">
          <h3 className="type-h3 text-ink">{copy.cta.form.title}</h3>
          <p className="mt-xs type-body-sm text-text-secondary">{copy.cta.form.intro}</p>
          <div className="mt-md">
            <SampleForm regions={regions} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
