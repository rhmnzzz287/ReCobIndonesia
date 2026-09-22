import type { ReactNode } from "react";
import { KudFlow } from "@/components/blocks/kud-flow";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getActiveKudNames } from "@/lib/data/kud";

export async function Partnership(): Promise<ReactNode> {
  const activeNames = await getActiveKudNames();
  const names = activeNames.length > 0 ? activeNames : copy.partnership.kudNames;

  return (
    <Section id="kemitraan" tone="paper">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.partnership.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.partnership.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.partnership.intro}</p>

        <div className="mt-xl">
          <KudFlow names={names} />
        </div>

        <ol className="mt-xl grid gap-md md:grid-cols-4">
          {copy.partnership.steps.map((step, index) => (
            <li key={step.title}>
              <Card tone="surface">
                <span className="type-mono-data text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2xs type-h3 text-ink">{step.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{step.body}</p>
              </Card>
            </li>
          ))}
        </ol>

        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.partnership.kudTitle}</h3>
          <p className="mt-xs type-body-sm text-text-secondary">{copy.partnership.kudSubtitle}</p>
          <p className="mt-2xs type-caption text-text-secondary">{copy.partnership.kudNote}</p>
        </div>
      </Container>
    </Section>
  );
}
