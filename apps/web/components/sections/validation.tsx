import type { CSSProperties, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { copy } from "@/content/copy";

/**
 * Seksi kendali mutu.
 *
 * Daftar "Sumber Rujukan", blok status NPP, dan catatan batas klaim dihapus dari beranda atas
 * keputusan pemilik produk: ketiganya tidak dipakai di alur beranda. Naskahnya tetap hidup di
 * `copy.validation` karena masih dibaca `/kontak` (status NPP) dan `/llms.txt` (batas klaim dan
 * daftar sumber) — menghapusnya dari sana akan menghilangkan label klaim yang diwajibkan PRD
 * Bagian 8.
 */
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
                <p className="type-metric-md break-words text-primary">{item.metric}</p>
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
      </Container>
    </Section>
  );
}
