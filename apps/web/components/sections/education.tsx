import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function Education(): Promise<ReactNode> {
  return (
    <Section id="edukasi" tone="surface">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">
            {copy.education.eyebrow}
          </p>
          <h2 className="mt-sm type-h2 text-ink">{copy.education.title}</h2>
          <p className="mt-md type-body-md text-text-secondary">
            {copy.education.intro}
          </p>
        </div>

        <ul className="mt-2xl grid auto-rows-fr gap-md md:grid-cols-2">
          {copy.education.items.map((item, index) => (
            <li
              className="h-full"
              data-reveal=""
              key={item.title}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <Card className="flex h-full flex-col" tone="paper">
                <span className="type-mono-data text-primary">
                  Modul {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2xs type-h3 text-ink">{item.title}</h3>
                <p className="mt-xs type-body-sm text-text-secondary">
                  {item.body}
                </p>
                <p className="mt-auto pt-md type-body-sm text-primary">
                  {item.action}
                </p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
