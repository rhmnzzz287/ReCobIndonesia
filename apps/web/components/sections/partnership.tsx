import type { CSSProperties, ReactNode } from "react";
import { KudFlow } from "@/components/blocks/kud-flow";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getActiveKudNames } from "@/lib/data/kud";

export async function Partnership(): Promise<ReactNode> {
  const activeNames = await getActiveKudNames();
  const names =
    activeNames.length > 0 ? activeNames : copy.partnership.kudNames;

  return (
    <Section id="kemitraan" tone="paper">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.partnership.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.partnership.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.partnership.intro}
          </p>
        </div>

        <div className="mt-xl" data-reveal="">
          <KudFlow names={names} />
        </div>

        <ol className="mt-2xl grid auto-rows-fr gap-md md:grid-cols-2 lg:grid-cols-4">
          {copy.partnership.steps.map((step, index) => (
            <li
              className="h-full"
              data-reveal=""
              key={step.title}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <Card className="flex h-full flex-col" tone="surface">
                <span className="type-mono-data text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2xs type-h3 text-ink">{step.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {step.body}
                </p>
              </Card>
            </li>
          ))}
        </ol>

        <div
          className="mt-2xl rounded-lg border border-border bg-surface p-lg"
          data-reveal=""
        >
          <h3 className="type-h3 text-ink">{copy.partnership.kudTitle}</h3>
          <p className="mt-xs type-body-sm text-text-secondary">
            {copy.partnership.kudSubtitle}
          </p>
          <p className="mt-sm type-caption text-text-secondary">
            {copy.partnership.kudNote}
          </p>
        </div>
      </Container>
    </Section>
  );
}
