import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { Contact } from "@/components/sections/contact";
import { Cta } from "@/components/sections/cta";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.kontak.title,
  description: copy.pages.kontak.intro,
  alternates: { canonical: "/kontak" },
};

/**
 * S7 — kontak, legalitas, dan titik konversi.
 *
 * `Cta` membawa formulir permintaan sampel beserta `id="form-sampel"`, sehingga tautan
 * `/kontak#form-sampel` dari header, hero, kalkulator, dan bilah lengket semuanya mendarat
 * di formulir yang sama.
 */
export default function KontakPage(): ReactNode {
  return (
    <main id="konten">
      <JsonLd
        data={buildWebPageJsonLd(env.siteUrl, {
          path: "/kontak",
          name: copy.pages.kontak.title,
          description: copy.pages.kontak.intro,
        })}
      />
      <PageHeader {...copy.pages.kontak} />
      <Contact />
      <Cta />
    </main>
  );
}
