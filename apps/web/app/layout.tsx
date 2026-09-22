import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Rubik } from "next/font/google";
import { ScrollReveal } from "@/components/blocks/scroll-reveal";
import { SiteHeader } from "@/components/blocks/site-header";
import { StickyCta } from "@/components/blocks/sticky-cta";
import { Footer } from "@/components/sections/footer";
import { copy } from "@/content/copy";
import { env } from "@/lib/env";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-rubik",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: copy.meta.title,
    // Halaman sekunder cukup menetapkan judulnya sendiri; akhiran merek ditambahkan
    // di satu tempat agar tidak pernah lupa atau berbeda antar halaman.
    template: `%s | ${copy.meta.shortName}`,
  },
  description: copy.meta.description,
  applicationName: copy.meta.shortName,
  // Memakai `env.siteUrl`, bukan `process.env` langsung: variabel lingkungan yang ADA tetapi
  // KOSONG ("" dari build arg Docker atau env Vercel yang belum diisi) lolos dari `??`,
  // sehingga `new URL("")` melempar ERR_INVALID_URL dan build gagal. `env.siteUrl` sudah
  // menormalkan nilai kosong menjadi null lalu jatuh ke bawaan.
  metadataBase: new URL(env.siteUrl),
  openGraph: {
    title: copy.meta.title,
    description: copy.meta.description,
    locale: "id_ID",
    type: "website",
    siteName: copy.meta.shortName,
  },
  twitter: {
    // `summary_large_image` agar gambar 1200x630 tampil penuh di pratinjau tautan.
    card: "summary_large_image",
    title: copy.meta.title,
    description: copy.meta.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "Pakan ternak",
};

/**
 * Kerangka seluruh halaman: header, isi, footer, bilah ajakan seluler, dan pengungkap viewport.
 *
 * Sebelumnya kerangka ini berada di `app/page.tsx`, sehingga hanya beranda yang memilikinya.
 * Setelah dipindah ke sini, setiap rute baru mewarisinya tanpa menyalin satu baris pun.
 *
 * `canonical` TIDAK ditetapkan di sini: nilai absolut di akar akan diwarisi semua halaman dan
 * membuat halaman sekunder menunjuk ke beranda. Setiap halaman menetapkan kanoniknya sendiri.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${rubik.variable} ${jakarta.variable} ${plexMono.variable}`}>
      <body className="type-body-md bg-surface text-ink">
        <a className="skip-link" href="#konten">
          {copy.nav.skipLabel}
        </a>
        <SiteHeader />
        {children}
        <Footer />
        <StickyCta />
        <ScrollReveal />
      </body>
    </html>
  );
}
