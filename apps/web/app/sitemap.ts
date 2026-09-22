import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

/**
 * Enam rute publik prototipe.
 *
 * Daftar ini harus diperbarui setiap kali rute baru dibuat: halaman yang tidak ada di sitemap
 * praktis tidak pernah ditemukan mesin pencari.
 */
const ROUTES = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/produk", changeFrequency: "monthly", priority: 0.9 },
  { path: "/kalkulator", changeFrequency: "monthly", priority: 0.9 },
  { path: "/mitra", changeFrequency: "monthly", priority: 0.8 },
  { path: "/edukasi", changeFrequency: "monthly", priority: 0.7 },
  { path: "/kontak", changeFrequency: "monthly", priority: 0.8 },
] as const satisfies ReadonlyArray<{
  path: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}>;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/+$/u, "");
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
