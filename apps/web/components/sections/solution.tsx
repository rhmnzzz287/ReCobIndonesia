import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Solution(): Promise<ReactNode> {
  return (
    <Section id="solusi" tone="cream">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.solution.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.solution.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.solution.intro}
          </p>
          <p className="mt-sm type-label-md uppercase text-text-secondary">
            {copy.solution.assurance}
          </p>
        </div>
        <ul className="mt-2xl grid auto-rows-fr gap-md md:grid-cols-3">
          {copy.solution.pillars.map((pillar, index) => (
            <li
              className="h-full"
              data-reveal=""
              key={pillar.title}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <Card className="flex h-full flex-col" tone="surface">
                <h3 className="type-h3 text-ink">{pillar.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {pillar.body}
                </p>
                <p className="mt-auto pt-md type-caption uppercase text-primary">
                  {pillar.note}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
