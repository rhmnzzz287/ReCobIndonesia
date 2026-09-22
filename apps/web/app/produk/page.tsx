import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { Product } from "@/components/sections/product";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { env } from "@/lib/env";
import { buildProductJsonLd, buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.produk.title,
  description: copy.pages.produk.intro,
  alternates: { canonical: "/produk" },
};

/** S2 — komposisi tiga bahan, spesifikasi karung 50 kg, dan cara ganti pakan 7 hari. */
export default async function ProdukPage(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();

  return (
    <main id="konten">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            buildWebPageJsonLd(env.siteUrl, {
              path: "/produk",
              name: copy.pages.produk.title,
              description: copy.pages.produk.intro,
            }),
            buildProductJsonLd(env.siteUrl, {
              name: product.name,
              description: product.description,
              priceIdr: product.priceIdr,
              packWeightKg: product.packWeightKg,
              comparePriceIdr: product.comparePriceIdr,
            }),
          ],
        }}
      />
      <PageHeader {...copy.pages.produk} />
      <Product />
    </main>
  );
}
