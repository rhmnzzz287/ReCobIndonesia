import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { Calculator } from "@/components/sections/calculator";
import { CostCompare } from "@/components/sections/cost-compare";
import { ProductCta } from "@/components/sections/product-cta";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildHowToJsonLd, buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.kalkulator.title,
  description: copy.pages.kalkulator.intro,
  alternates: { canonical: "/kalkulator" },
};

/**
 * S9 — halaman kalkulator.
 *
 * Dua bagian berurutan: kalkulator interaktif yang memakai jumlah sapi pengunjung, lalu tabel
 * perbandingan harga yang statis (bisa diperiksa tanpa mengubah apa pun). Keduanya membaca
 * aritmetika yang sama dari `lib/utils/feed-cost.ts`, dan uji silang mengunci kecocokannya.
 *
 * `HowTo` protokol pakan diikutsertakan karena pertanyaan "berapa hematnya" hampir selalu
 * diikuti "bagaimana cara pakainya".
 */
export default function KalkulatorPage(): ReactNode {
  return (
    <main id="konten">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildWebPageJsonLd(env.siteUrl, {
              path: "/kalkulator",
              name: copy.pages.kalkulator.title,
              description: copy.pages.kalkulator.intro,
            }),
            buildHowToJsonLd(),
          ],
        }}
      />
      <PageHeader {...copy.pages.kalkulator} />
      <Calculator />
      <CostCompare />
      <ProductCta />
    </main>
  );
}
