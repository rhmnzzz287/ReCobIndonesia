import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { Partnership } from "@/components/sections/partnership";
import { ProductCta } from "@/components/sections/product-cta";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.mitra.title,
  description: copy.pages.mitra.intro,
  alternates: { canonical: "/mitra" },
};

/** S5 — alur konsinyasi, potong setoran susu, dan daftar KUD wilayah fokus. */
export default function MitraPage(): ReactNode {
  return (
    <main id="konten">
      <JsonLd
        data={buildWebPageJsonLd(env.siteUrl, {
          path: "/mitra",
          name: copy.pages.mitra.title,
          description: copy.pages.mitra.intro,
        })}
      />
      <PageHeader {...copy.pages.mitra} />
      <Partnership />
      <ProductCta />
    </main>
  );
}
