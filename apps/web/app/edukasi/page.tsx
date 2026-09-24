import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { Education } from "@/components/sections/education";
import { ProductCta } from "@/components/sections/product-cta";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.edukasi.title,
  description: copy.pages.edukasi.intro,
  alternates: { canonical: "/edukasi" },
};

/**
 * S4 — panduan kandang.
 *
 * Empat topik dari PRD ditampilkan sebagai kartu, bukan artikel MDX: `@next/mdx` belum terpasang,
 * dan menambah dependensi hanya untuk empat kartu tidak sepadan. Isi artikelnya sendiri menyusul
 * saat Siklus B.
 */
export default function EdukasiPage(): ReactNode {
  return (
    <main id="konten">
      <JsonLd
        data={buildWebPageJsonLd(env.siteUrl, {
          path: "/edukasi",
          name: copy.pages.edukasi.title,
          description: copy.pages.edukasi.intro,
        })}
      />
      <PageHeader {...copy.pages.edukasi} />
      <Education />
      <ProductCta />
    </main>
  );
}
