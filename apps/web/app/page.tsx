import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/blocks/json-ld";
import { Cta } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Solution } from "@/components/sections/solution";
import { Validation } from "@/components/sections/validation";
import { getPrimaryProduct } from "@/lib/data/products";
import { env } from "@/lib/env";
import {
  buildFaqPageJsonLd,
  buildHowToJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";

/**
 * Kanonik beranda.
 *
 * Sejak kerangka situs pindah ke `app/layout.tsx`, `canonical` sengaja TIDAK lagi ditetapkan di
 * akar: nilai absolut di sana akan diwarisi lima halaman sekunder dan membuat semuanya menunjuk
 * ke beranda. Karena itu setiap halaman — termasuk beranda ini — menetapkan kanoniknya sendiri.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * Beranda: halaman naratif.
 *
 * Sejak prototipe dipecah menjadi tujuh halaman, isi berat (katalog produk, spesifikasi, kalkulator,
 * kemitraan, panduan, kontak) tinggal di rutenya masing-masing dan beranda menyusut menjadi alur
 * keputusan produk: orientasi, solusi, validasi, tanya jawab, lalu form permintaan. Kerangka situs
 * (header, footer, bilah ajakan) kini diwarisi dari `app/layout.tsx`.
 *
 * Data terstruktur: entitas (Organization, WebSite), tanya jawab (FAQPage), prosedur (HowTo), dan
 * penawaran (Product). Semuanya diturunkan dari lapisan konten dan data produk resmi, sehingga
 * tidak ada klaim yang tidak tampil di halaman. Penggabungan menjadi satu blok `@graph` dipilih
 * agar setiap node dapat saling menunjuk lewat `@id` (penerbit situs = organisasi yang sama,
 * penjual produk = organisasi yang sama) — inilah yang membuat mesin generatif mengenali satu
 * entitas, bukan potongan terpisah.
 */
export default async function HomePage(): Promise<ReactNode> {
  const { product } = await getPrimaryProduct();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationJsonLd(env.siteUrl),
      buildWebSiteJsonLd(env.siteUrl),
      buildFaqPageJsonLd(),
      buildHowToJsonLd(),
      buildProductJsonLd(env.siteUrl, {
        name: product.name,
        description: product.description,
        priceIdr: product.priceIdr,
        packWeightKg: product.packWeightKg,
        comparePriceIdr: product.comparePriceIdr,
      }),
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <main id="konten">
        <Hero />
        <Solution />
        <Validation />
        <Faq />
        <Cta />
      </main>
    </>
  );
}
