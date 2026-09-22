import type { ReactNode } from "react";
import { CaptionNote } from "@/components/ui/caption-note";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Problem(): Promise<ReactNode> {
  return (
    <Section id="tantangan" tone="surface">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.problem.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.problem.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.problem.intro}</p>
        <ul className="mt-xl grid gap-md md:grid-cols-3">
          {copy.problem.items.map((item) => (
            <li key={item.title}>
              <Card tone="paper">
                <p className="type-metric-md text-primary">{item.metric}</p>
                <h3 className="mt-xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
                <CaptionNote>{item.caption}</CaptionNote>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
