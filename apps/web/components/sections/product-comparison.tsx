import { ArrowRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { CaptionNote } from "@/components/ui/caption-note";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Tabel perbandingan ringkas, protokol transisi 7 hari, dan penutup halaman.
 *
 * Tabel ini sengaja lebih pendek daripada tabel di `/kalkulator`: di sini pengunjung baru perlu
 * melihat arah angkanya, sedangkan rincian lima baris plus kolom selisih ada di halaman kalkulator.
 * Angkanya diambil dari `copy.costCompare` yang sama, jadi kedua tabel tidak bisa berbeda isi.
 */
export function ProductComparison(): ReactNode {
  const rows = copy.productStory.comparisonRows;
  const [criteria, recob, conventional] = copy.productStory.comparisonColumns;

  return (
    <Section id="perbandingan" tone="surface">
      <Container>
        <div className="max-w-[68ch]" data-reveal="">
          <p className="type-label-md uppercase text-primary">{copy.costCompare.eyebrow}</p>
          <h2 className="mt-sm type-h2 text-ink">{copy.productStory.comparisonTitle}</h2>
        </div>

        <div className="mt-xl overflow-x-auto" data-reveal="">
          <table className="w-full min-w-[560px] border-collapse text-left">
            <caption className="sr-only">{copy.productStory.comparisonTitle}</caption>
            <thead>
              <tr className="border-b border-border">
                <th className="py-sm type-label-md uppercase text-text-secondary" scope="col">
                  {criteria}
                </th>
                <th className="py-sm type-label-md uppercase text-primary" scope="col">
                  {recob}
                </th>
                <th className="py-sm type-label-md uppercase text-text-secondary" scope="col">
                  {conventional}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr className="border-b border-border" key={row.criteria}>
                  <th className="py-md type-body-sm text-text" scope="row">
                    {row.criteria}
                  </th>
                  <td className="py-md type-mono-data text-primary-strong">{row.recob}</td>
                  <td className="py-md type-mono-data text-text-secondary">
                    {row.conventional}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CaptionNote className="mt-md">{copy.productStory.comparisonCaption}</CaptionNote>

        <div className="mt-3xl" data-reveal="">
          <h2 className="type-h3 text-ink">{copy.product.transitionTitle}</h2>
          <p className="mt-xs type-body-sm text-text-secondary">{copy.product.transitionIntro}</p>
          <ol className="mt-md grid auto-rows-fr gap-sm md:grid-cols-4">
            {copy.product.transitionSteps.map((step, index) => (
              <li
                className="flex h-full flex-col rounded-md bg-surface p-md type-body-sm text-text"
                data-reveal=""
                key={step.day}
                style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
              >
                <span className="type-mono-data text-primary">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-2xs type-label-md text-ink">{step.day}</p>
                <p className="mt-2xs type-metric-md break-words text-primary">{step.share}</p>
                <p className="mt-auto pt-2xs type-caption text-text-secondary">{step.label}</p>
              </li>
            ))}
          </ol>
        </div>

        <div
          className="mt-3xl flex flex-wrap items-end justify-between gap-lg border-t border-border pt-xl"
          data-reveal=""
        >
          <div className="max-w-[52ch]">
            <h2 className="type-h3 text-ink">{copy.productStory.closingTitle}</h2>
            <p className="mt-xs type-body-sm text-text-secondary">
              {copy.productStory.closingBody}
            </p>
          </div>
          <div className="flex flex-wrap gap-sm">
            <ButtonLink href="/kontak#form-sampel" size="lg" variant="accent">
              {copy.cta.preorderLabel}
            </ButtonLink>
            <ButtonLink href="/kontak#form-sampel" size="lg" variant="secondary">
              {copy.cta.sampleLabel}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
