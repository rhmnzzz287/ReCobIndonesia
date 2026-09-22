import { Check } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { SampleForm } from "@/components/blocks/sample-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getRegions } from "@/lib/data/regions";

export async function Cta(): Promise<ReactNode> {
  const regions = await getRegions();

  return (
    <Section
      className="rounded-t-arc rounded-b-arc"
      id="form-sampel"
      tone="primary"
    >
      <Container>
        <div className="grid gap-2xl lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div data-reveal="">
            <p className="type-label-md uppercase text-primary-soft">
              {copy.cta.eyebrow}
            </p>
            <h2 className="mt-sm type-h2 text-surface">{copy.cta.title}</h2>
            <p className="mt-md type-body-lg text-surface/90">
              {copy.cta.intro}
            </p>

            <ul className="mt-lg flex flex-col gap-sm">
              {copy.cta.benefits.map((benefit, index) => (
                <li
                  className="flex items-start gap-xs type-body-sm text-surface/90"
                  data-reveal=""
                  key={benefit}
                  style={
                    { "--reveal-delay": `${index * 70}ms` } as CSSProperties
                  }
                >
                  <Check
                    aria-hidden="true"
                    className="mt-2xs shrink-0 text-primary-soft"
                    size={18}
                    strokeWidth={1.75}
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="mt-lg">
              <ButtonLink
                external
                href="https://wa.me/6281200000000"
                variant="accent"
              >
                {copy.cta.whatsappHelp}
              </ButtonLink>
            </div>
          </div>

          <div
            className="rounded-lg bg-surface p-lg md:p-xl"
            data-reveal=""
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <h3 className="type-h3 text-ink">{copy.cta.form.title}</h3>
            <p className="mt-xs type-body-sm text-text-secondary">
              {copy.cta.form.intro}
            </p>
            <div className="mt-md">
              <SampleForm regions={regions} />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
