import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/** Siklus A hanya memiliki satu rute publik; halaman sekunder menyusul pada Siklus B. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: env.siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
