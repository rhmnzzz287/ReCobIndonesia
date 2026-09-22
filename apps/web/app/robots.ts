import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Kebijakan crawler.
 *
 * Selain mesin pencari umum, situs ini sengaja DIBIARKAN dirayapi crawler mesin jawaban
 * (AEO/GEO): justru itu jalur agar ReCob.id dikutip saat orang bertanya soal pakan konsentrat
 * sapi perah. Kebijakan ditulis eksplisit per agen, bukan wildcard pasif, supaya niatnya
 * terbaca dan mudah diubah bila kelak ada bagian yang perlu ditutup.
 *
 * Yang ditutup hanya rute internal: endpoint form dan pemeriksaan kesehatan tidak punya nilai
 * pencarian dan tidak boleh masuk indeks.
 */
export default function robots(): MetadataRoute.Robots {
  const base = env.siteUrl.replace(/\/+$/u, "");
  const internal = ["/api/", "/actions/"];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: internal },
      // Mesin jawaban: diizinkan merayapi isi publik.
      { userAgent: "GPTBot", allow: "/", disallow: internal },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: internal },
      { userAgent: "ChatGPT-User", allow: "/", disallow: internal },
      { userAgent: "PerplexityBot", allow: "/", disallow: internal },
      { userAgent: "ClaudeBot", allow: "/", disallow: internal },
      { userAgent: "anthropic-ai", allow: "/", disallow: internal },
      { userAgent: "Google-Extended", allow: "/", disallow: internal },
      { userAgent: "Applebot-Extended", allow: "/", disallow: internal },
      { userAgent: "CCBot", allow: "/", disallow: internal },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
