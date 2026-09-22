import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Problem(): Promise<ReactNode> {
  return (
    <Section id="tantangan" tone="surface">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.problem.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.problem.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.problem.intro}
          </p>
        </div>
        <ul className="mt-2xl grid auto-rows-fr gap-md md:grid-cols-3">
          {copy.problem.items.map((item, index) => (
            <li
              className="h-full"
              data-reveal=""
              key={item.title}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <Card className="flex h-full flex-col" tone="paper">
                <p className="type-metric-md break-words text-primary">{item.metric}</p>
                <h3 className="mt-xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {item.body}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
