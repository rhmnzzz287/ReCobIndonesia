import type { ReactNode } from "react";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

export async function CostCompare(): Promise<ReactNode> {
  return (
    <Section id="penghematan" tone="surface">
      <Container>
        <p className="type-label-md uppercase text-primary">{copy.costCompare.eyebrow}</p>
        <h2 className="mt-sm type-h2 text-ink">{copy.costCompare.title}</h2>
        <p className="mt-md type-body-md text-text-secondary">{copy.costCompare.intro}</p>

        <div className="mt-xl overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">{copy.costCompare.title}</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="py-sm type-label-md text-text-secondary" scope="col">
                  {copy.costCompare.tableHead.criteria}
                </th>
                <th className="py-sm type-label-md text-primary" scope="col">
                  {copy.costCompare.tableHead.recob}
                </th>
                <th className="py-sm type-label-md text-text-secondary" scope="col">
                  {copy.costCompare.tableHead.conventional}
                </th>
                <th className="py-sm type-label-md text-text-secondary" scope="col">
                  {copy.costCompare.tableHead.difference}
                </th>
              </tr>
            </thead>
            <tbody>
              {copy.costCompare.rows.map((row) => (
                <tr className="border-b border-border" key={row.criteria}>
                  <th className="py-sm type-body-sm text-text" scope="row">
                    {row.criteria}
                  </th>
                  <td className="py-sm type-body-sm text-text">{row.recob}</td>
                  <td className="py-sm type-body-sm text-text-secondary">{row.conventional}</td>
                  <td className="py-sm type-body-sm text-primary">{row.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-xl">
          <h3 className="type-h3 text-ink">{copy.costCompare.assumptionTitle}</h3>
          <ul className="mt-md list-disc space-y-xs pl-lg type-body-sm text-text-secondary">
            {copy.costCompare.assumptions.map((assumption) => (
              <li key={assumption}>{assumption}</li>
            ))}
          </ul>
          <CaptionNote className="mt-md">{copy.costCompare.closing}</CaptionNote>
        </div>
      </Container>
    </Section>
  );
}
