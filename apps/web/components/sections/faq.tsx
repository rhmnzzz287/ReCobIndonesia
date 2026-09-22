import type { ReactNode } from "react";
import { FaqAccordion } from "@/components/blocks/faq-accordion";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Faq(): Promise<ReactNode> {
  return (
    <Section id="faq" tone="surface">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.faq.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.faq.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.faq.intro}</p>
        <div className="mt-xl">
          <FaqAccordion items={copy.faq.items} />
        </div>
      </Container>
    </Section>
  );
}
