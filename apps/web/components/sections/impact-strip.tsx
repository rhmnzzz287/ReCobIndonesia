import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";

/**
 * Bilah angka kredibilitas tepat di bawah hero, mengikuti pola locol.company yang
 * menaruh angka-angka besar sebagai bilah tersendiri sebelum narasi dimulai.
 *
 * Angka memakai `metric-md`, bukan `metric-lg`: bilah ini berisi tiga angka dalam satu
 * baris, dan `metric-lg` 88 px akan saling mendesak di lebar 1200 px.
 *
 * Seluruh angka adalah ilustrasi skala fase awal dan WAJIB disertai `statScaleCaption`
 * (PRD Bagian 8). Label tidak boleh dilepas dari captionnya.
 */
export async function ImpactStrip(): Promise<ReactNode> {
  const stats = [
    { label: copy.hero.statKudUnit, value: copy.hero.statKudValue },
    { label: copy.hero.statCattleUnit, value: copy.hero.statCattleValue },
    { label: copy.hero.statFarmerUnit, value: copy.hero.statFarmerValue },
  ];

  return (
    <section
      aria-labelledby="bilah-angka"
      className="bg-ink-deep py-xl text-surface"
    >
      <Container>
        <h2 className="type-label-md uppercase text-accent" id="bilah-angka">
          {copy.hero.statStripTitle}
        </h2>
        <ul className="mt-lg grid auto-rows-fr gap-xl sm:grid-cols-3">
          {stats.map((stat, index) => (
            <li
              data-reveal=""
              key={stat.label}
              style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
            >
              <p className="type-metric-md text-accent">{stat.value}</p>
              <p className="mt-2xs type-body-sm text-surface/90">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-lg type-caption text-surface/75">
          {copy.hero.statScaleCaption}
        </p>
      </Container>
    </section>
  );
}
