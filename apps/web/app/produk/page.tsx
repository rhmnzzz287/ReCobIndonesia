import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { ScrollProgress } from "@/components/blocks/scroll-progress";
import { ProductComparison } from "@/components/sections/product-comparison";
import { ProductHero } from "@/components/sections/product-hero";
import { ProductIngredients } from "@/components/sections/product-ingredients";
import { ProductMarquee } from "@/components/sections/product-marquee";
import { ProductUsage } from "@/components/sections/product-usage";
import { copy } from "@/content/copy";
import { getPrimaryProduct } from "@/lib/data/products";
import { env } from "@/lib/env";
import { buildProductJsonLd, buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.produk.title,
  description: copy.pages.produk.intro,
  alternates: { canonical: "/produk" },
};

/**
 * S2 — halaman produk, disusun mengikuti irama halaman pendarat: panggung terang berfoto, pita alur
 * bergulir sebagai satu-satunya jeda gelap, lalu tiga bidang yang masing-masing menjawab satu
 * pertanyaan (apa bahannya, bagaimana memakainya, berapa hematnya).
 *
 * `PageHeader` tidak lagi dipakai di sini: judul halaman sudah dibawa panggung pembuka, dan
 * menambah kepala halaman kedua akan membuat pengunjung membaca dua judul sebelum sampai ke bahan.
 */
export default async function ProdukPage(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();

  return (
    <>
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
      <ScrollProgress />
      <main id="konten">
        <ProductHero />
        <ProductMarquee />
        <ProductIngredients />
        <ProductUsage />
        <ProductComparison />
      </main>
    </>
  );
}
