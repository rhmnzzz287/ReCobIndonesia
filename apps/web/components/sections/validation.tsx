import type { CSSProperties, ReactNode } from "react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Validation(): Promise<ReactNode> {
  return (
    <Section id="mutu" tone="paper">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.validation.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.validation.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.validation.intro}
          </p>
        </div>

        <ul className="mt-2xl grid auto-rows-fr gap-md md:grid-cols-3">
          {copy.validation.qcItems.map((item, index) => (
            <li
              className="h-full"
              data-reveal=""
              key={item.title}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <Card className="flex h-full flex-col" tone="surface">
                <p className="type-metric-md text-primary">{item.metric}</p>
                <h3 className="mt-xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {item.body}
                </p>
                <p className="mt-auto pt-md type-caption uppercase text-text-secondary">
                  {item.note}
                </p>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-2xl grid gap-xl lg:grid-cols-2">
          <div data-reveal="">
            <h3 className="type-h3 text-ink">
              {copy.validation.citationTitle}
            </h3>
            <ul className="mt-md flex list-disc flex-col gap-sm pl-lg type-body-sm text-text-secondary">
              {copy.validation.citations.map((citation) => (
                <li key={citation}>{citation}</li>
              ))}
            </ul>
          </div>

          <div data-reveal="">
            <dl className="rounded-lg border border-border bg-surface p-lg">
              <dt className="type-label-md uppercase text-text-secondary">
                {copy.validation.nppLabel}
              </dt>
              <dd className="mt-xs type-body-sm text-ink">
                {copy.validation.nppStatus}
              </dd>
            </dl>
            <div className="mt-md">
              <Alert>{copy.validation.claimNotice}</Alert>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
