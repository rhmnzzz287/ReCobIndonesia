import type { ReactNode } from "react";
import { MetricPanel } from "@/components/blocks/metric-panel";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";
import { getPublicMetrics } from "@/lib/data/impact";

export async function Impact(): Promise<ReactNode> {
  const metrics = await getPublicMetrics();

  return (
    <Section id="dampak" tone="ink">
      <Container>
        <Badge tone="warn">{copy.impact.demoBadge}</Badge>
        <p className="mt-md type-label-md uppercase text-accent">{copy.impact.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-surface">{copy.impact.title}</h2>
        <p className="mt-md type-body-md text-surface/85">{copy.impact.intro}</p>
        <div className="mt-xl">
          <MetricPanel metrics={metrics} />
        </div>
        <div className="mt-xl">
          <Alert>{copy.impact.withheldTitle}</Alert>
        </div>
      </Container>
    </Section>
  );
}
