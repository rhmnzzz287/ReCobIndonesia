/**
 * Structured data (schema.org) untuk SEO, AEO, dan GEO.
 *
 * Semua nilai naskah dibaca dari `content/copy` supaya data terstruktur tidak pernah menyimpang
 * dari teks yang benar-benar tampil di halaman. Yang belum pasti TIDAK dikarang:
 *
 * - Tanpa `aggregateRating` dan `review`: belum ada ulasan nyata, dan rating karangan justru
 *   menghukum entitas di mesin pencari maupun mesin jawaban.
 * - Tanpa `contactPoint`, `address`, dan `sameAs`: kontak resmi belum final (PRD Bagian 8 butir 6).
 * - Tanpa nomor NPP: masih dalam proses pendaftaran (PRD Bagian 8 butir 2).
 *
 * Setiap node memakai `@id` absolut berbasis URL situs sehingga entitas dapat dihubungkan
 * lintas halaman — syarat agar mesin generatif mengenali satu entitas, bukan potongan terpisah.
 */

import { copy } from "@/content/copy";

export interface ProductSchemaInput {
  name: string;
  description: string;
  priceIdr: number;
  packWeightKg: number;
  comparePriceIdr: number | null;
}

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  "@id": string;
  name: string;
  legalName: string;
  url: string;
  description: string;
  knowsAbout: ReadonlyArray<string>;
}

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  description: string;
  inLanguage: "id-ID";
  publisher: { "@id": string };
}

export interface FaqPageSchema {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: ReadonlyArray<{
    "@type": "Question";
    name: string;
    acceptedAnswer: { "@type": "Answer"; text: string };
  }>;
}

export interface HowToSchema {
  "@context": "https://schema.org";
  "@type": "HowTo";
  name: string;
  description: string;
  step: ReadonlyArray<{
    "@type": "HowToStep";
    position: number;
    name: string;
    text: string;
  }>;
}

export interface ProductSchema {
  "@context": "https://schema.org";
  "@type": "Product";
  "@id": string;
  name: string;
  description: string;
  category: string;
  brand: { "@id": string };
  manufacturer: { "@id": string };
  weight: { "@type": "QuantitativeValue"; value: number; unitCode: "KGM" };
  offers: {
    "@type": "Offer";
    price: string;
    priceCurrency: "IDR";
    availability: string;
    url: string;
    seller: { "@id": string };
  };
}

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  "@id": string;
  url: string;
  name: string;
  description: string;
  inLanguage: "id-ID";
  isPartOf: { "@id": string };
  about: { "@id": string };
}

function absolute(siteUrl: string, path = ""): string {
  return `${siteUrl.replace(/\/+$/u, "")}${path}`;
}

export function organizationId(siteUrl: string): string {
  return `${absolute(siteUrl)}/#organization`;
}

export function webSiteId(siteUrl: string): string {
  return `${absolute(siteUrl)}/#website`;
}

export function buildOrganizationJsonLd(siteUrl: string): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: copy.meta.shortName,
    legalName: copy.meta.legalName,
    url: absolute(siteUrl),
    description: copy.meta.description,
    knowsAbout: copy.meta.knowsAbout,
  };
}

export function buildWebSiteJsonLd(siteUrl: string): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": webSiteId(siteUrl),
    name: copy.meta.shortName,
    url: absolute(siteUrl),
    description: copy.meta.description,
    inLanguage: "id-ID",
    publisher: { "@id": organizationId(siteUrl) },
  };
}

/**
 * Node halaman sekunder.
 *
 * `isPartOf` menunjuk ke `WebSite` dan `about` ke `Organization`, sehingga lima halaman prototipe
 * terbaca sebagai bagian dari satu situs milik satu entitas — bukan lima dokumen lepas yang
 * kebetulan satu domain.
 */
export function buildWebPageJsonLd(
  siteUrl: string,
  page: { path: string; name: string; description: string },
): WebPageSchema {
  const url = absolute(siteUrl, page.path);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.name,
    description: page.description,
    inLanguage: "id-ID",
    isPartOf: { "@id": webSiteId(siteUrl) },
    about: { "@id": organizationId(siteUrl) },
  };
}

export function buildFaqPageJsonLd(): FaqPageSchema {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faq.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * `HowTo` dibangun dari langkah transisi 7 hari yang sudah tampil di seksi produk, sehingga
 * setiap langkah dapat diverifikasi pengunjung pada halaman yang sama.
 */
export function buildHowToJsonLd(): HowToSchema {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: copy.product.transitionTitle,
    description: copy.product.transitionIntro,
    step: copy.product.transitionSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.day,
      text: `Berikan pakan ReCob.id sebesar ${step.share} dari total ransum konsentrat pada ${step.day} (${step.label}).`,
    })),
  };
}

export function buildProductJsonLd(
  siteUrl: string,
  product: ProductSchemaInput,
): ProductSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${absolute(siteUrl)}/#product`,
    name: product.name,
    description: product.description,
    category: "Pakan konsentrat ruminansia",
    brand: { "@id": organizationId(siteUrl) },
    manufacturer: { "@id": organizationId(siteUrl) },
    weight: { "@type": "QuantitativeValue", value: product.packWeightKg, unitCode: "KGM" },
    offers: {
      "@type": "Offer",
      price: String(product.priceIdr),
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
      url: absolute(siteUrl),
      seller: { "@id": organizationId(siteUrl) },
    },
  };
}
