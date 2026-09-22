import { describe, expect, it } from "vitest";
import { copy } from "@/content/copy";
import {
  buildFaqPageJsonLd,
  buildHowToJsonLd,
  buildOrganizationJsonLd,
  buildProductJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/structured-data";

const SITE = "https://recob.id";

describe("structured data", () => {
  it("membangun node WebPage yang menunjuk situs dan organisasi", () => {
    const page = buildWebPageJsonLd(SITE, {
      path: "/produk",
      name: "Pakan ReCob.id",
      description: "Bahan pembuat, isi karung, dan cara mengganti pakan lama.",
    });

    expect(page["@type"]).toBe("WebPage");
    expect(page.url).toBe(`${SITE}/produk`);
    expect(page["@id"]).toBe(`${SITE}/produk#webpage`);
    expect(page.isPartOf["@id"]).toBe(`${SITE}/#website`);
    expect(page.about["@id"]).toBe(`${SITE}/#organization`);
    expect(page.inLanguage).toBe("id-ID");
  });

  it("menyatakan organisasi dengan identitas entitas yang bertaut", () => {
    const node = buildOrganizationJsonLd(SITE);

    expect(node["@type"]).toBe("Organization");
    expect(node["@id"]).toBe(`${SITE}/#organization`);
    expect(node.name).toBe(copy.meta.shortName);
    expect(node.legalName).toBe(copy.meta.legalName);
    expect(node.url).toBe(SITE);
    expect(node.knowsAbout).toEqual(copy.meta.knowsAbout);
  });

  it("tidak mencantumkan kanal kontak yang belum ada", () => {
    const node = buildOrganizationJsonLd(SITE);

    // PRD Bagian 8: kontak resmi menyusul sebelum rilis publik. Structured data tidak boleh
    // memuat nomor atau alamat yang belum nyata, dan tidak boleh memuat sameAs kosong.
    expect(node).not.toHaveProperty("contactPoint");
    expect(node).not.toHaveProperty("address");
    expect(node).not.toHaveProperty("sameAs");
  });

  it("menyatakan situs dengan bahasa Indonesia dan penerbit yang sama", () => {
    const node = buildWebSiteJsonLd(SITE);

    expect(node["@type"]).toBe("WebSite");
    expect(node["@id"]).toBe(`${SITE}/#website`);
    expect(node.inLanguage).toBe("id-ID");
    expect(node.publisher).toEqual({ "@id": `${SITE}/#organization` });
  });

  it("menyatakan produk dengan penawaran rupiah dan tanpa penilaian karangan", () => {
    const node = buildProductJsonLd(SITE, {
      name: "ReCob.id Pelet Konsentrat 50 kg",
      description: "Pelet konsentrat sapi perah dari bonggol jagung terfermentasi.",
      priceIdr: 160000,
      packWeightKg: 50,
      comparePriceIdr: 200000,
    });

    expect(node["@type"]).toBe("Product");
    expect(node.offers).toMatchObject({
      "@type": "Offer",
      price: "160000",
      priceCurrency: "IDR",
      availability: "https://schema.org/InStock",
    });
    // Klaim tanpa dasar dilarang: tidak ada rating maupun ulasan sampai datanya nyata.
    expect(node).not.toHaveProperty("aggregateRating");
    expect(node).not.toHaveProperty("review");
  });

  it("menyatakan FAQ dari naskah yang benar-benar tampil", () => {
    const node = buildFaqPageJsonLd();
    const first = node.mainEntity[0];
    const source = copy.faq.items[0];
    expect(first).toBeDefined();
    expect(source).toBeDefined();

    expect(node["@type"]).toBe("FAQPage");
    expect(node.mainEntity).toHaveLength(copy.faq.items.length);
    expect(first).toMatchObject({
      "@type": "Question",
      name: source?.question,
    });
    expect(first?.acceptedAnswer).toEqual({
      "@type": "Answer",
      text: source?.answer,
    });
  });

  it("menyatakan protokol transisi sebagai HowTo berurutan", () => {
    const node = buildHowToJsonLd();
    const firstStep = node.step[0];
    const sourceStep = copy.product.transitionSteps[0];
    expect(firstStep).toBeDefined();
    expect(sourceStep).toBeDefined();

    expect(node["@type"]).toBe("HowTo");
    expect(node.name).toBe(copy.product.transitionTitle);
    expect(node.step).toHaveLength(copy.product.transitionSteps.length);
    expect(firstStep).toMatchObject({
      "@type": "HowToStep",
      position: 1,
      name: sourceStep?.day,
    });
  });

  it("tidak memuat emoji pada seluruh blok structured data", () => {
    const blocks = [
      buildOrganizationJsonLd(SITE),
      buildWebSiteJsonLd(SITE),
      buildFaqPageJsonLd(),
      buildHowToJsonLd(),
      buildProductJsonLd(SITE, {
        name: "n",
        description: "d",
        priceIdr: 160000,
        packWeightKg: 50,
        comparePriceIdr: null,
      }),
    ];
    const serialized = JSON.stringify(blocks);
    expect(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(serialized)).toBe(false);
  });

  it("memakai URL absolut sehingga entitas dapat dihubungkan lintas halaman", () => {
    for (const node of [buildOrganizationJsonLd(SITE), buildWebSiteJsonLd(SITE)]) {
      expect(JSON.stringify(node)).toContain(SITE);
    }
  });
});
