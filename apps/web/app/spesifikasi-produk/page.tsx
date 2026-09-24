import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { PageHeader } from "@/components/blocks/page-header";
import { ProductCta } from "@/components/sections/product-cta";
import { ProductUsage } from "@/components/sections/product-usage";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import { buildWebPageJsonLd } from "@/lib/seo/structured-data";

export const metadata: Metadata = {
  title: copy.pages.spesifikasiProduk.title,
  description: copy.pages.spesifikasiProduk.intro,
  alternates: { canonical: "/spesifikasi-produk" },
};

export default function SpesifikasiProdukPage(): ReactNode {
  const pageCopy = copy.pages.spesifikasiProduk;

  return (
    <>
      <JsonLd
        data={buildWebPageJsonLd(env.siteUrl, {
          path: "/spesifikasi-produk",
          name: pageCopy.title,
          description: pageCopy.intro,
        })}
      />
      <main id="konten">
        <PageHeader {...pageCopy} />
        <ProductUsage />
        <ProductCta />
      </main>
    </>
  );
}
