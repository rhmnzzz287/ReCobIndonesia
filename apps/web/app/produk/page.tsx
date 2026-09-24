import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { ScrollProgress } from "@/components/blocks/scroll-progress";
import { ProductComparison } from "@/components/sections/product-comparison";
import { ProductCatalog } from "@/components/sections/product-catalog";
import { ProductHero } from "@/components/sections/product-hero";
import { ProductIngredients } from "@/components/sections/product-ingredients";
import { ProductMarquee } from "@/components/sections/product-marquee";
import { copy } from "@/content/copy";
import { getPrimaryProduct, getProducts } from "@/lib/data/products";
import { env } from "@/lib/env";
import { buildProductJsonLd, buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.produk.title,
  description: copy.pages.produk.intro,
  alternates: { canonical: "/produk" },
};

/**
 * S2 — halaman produk, disusun mengikuti irama halaman pendarat: panggung terang berfoto,
 * pita alur bergulir sebagai satu-satunya jeda gelap, bahan dan fungsinya, katalog kartu ringkas,
 * lalu perbandingan harga.
 *
 * `PageHeader` tidak lagi dipakai di sini: katalog dan panggung pembuka sudah memberi orientasi,
 * sehingga tidak ada kepala halaman kedua sebelum pengunjung sampai ke bahan.
 */
export default async function ProdukPage(): Promise<ReactNode> {
  const [{ product }, products] = await Promise.all([getPrimaryProduct(), getProducts()]);

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
        <ProductCatalog products={products} />
        <ProductComparison />
      </main>
    </>
  );
}
