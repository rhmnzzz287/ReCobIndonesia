import type { ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Validation(): Promise<ReactNode> {
  return (
    <Section id="mutu" tone="paper">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.validation.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.validation.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.validation.intro}</p>

        <ul className="mt-xl grid gap-md md:grid-cols-3">
          {copy.validation.qcItems.map((item) => (
            <li key={item.title}>
              <Card tone="surface">
                <p className="type-metric-md text-primary">{item.metric}</p>
                <h3 className="mt-xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
                <p className="mt-md type-caption uppercase text-text-secondary">{item.note}</p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.validation.citationTitle}</h3>
          <ul className="mt-sm list-disc space-y-xs pl-lg type-body-sm text-text-secondary">
            {copy.validation.citations.map((citation) => (
              <li key={citation}>{citation}</li>
            ))}
          </ul>
        </div>

        <dl className="mt-xl">
          <dt className="type-caption text-text-secondary">{copy.validation.nppLabel}</dt>
          <dd className="type-body-md text-ink">{copy.validation.nppStatus}</dd>
        </dl>

        <div className="mt-lg">
          <Alert>{copy.validation.claimNotice}</Alert>
        </div>
      </Container>
    </Section>
  );
}
