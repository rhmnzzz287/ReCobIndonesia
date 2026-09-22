import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Education(): Promise<ReactNode> {
  return (
    <Section id="edukasi" tone="surface">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.education.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.education.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.education.intro}</p>

        <ul className="mt-xl grid gap-md md:grid-cols-2">
          {copy.education.items.map((item, index) => (
            <li key={item.title}>
              <Card tone="paper">
                <span className="type-mono-data text-primary">
                  Modul {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">{item.body}</p>
                <p className="mt-md type-body-sm text-primary">{item.action}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
