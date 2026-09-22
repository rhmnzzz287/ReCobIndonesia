import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Rubik } from "next/font/google";
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
  title: copy.meta.title,
  description: copy.meta.description,
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
  },
};

/** Data terstruktur organisasi; hanya fakta yang sudah pasti, tanpa nomor NPP yang belum terbit. */
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ReCob.id",
  description: copy.meta.description,
  url: env.siteUrl,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${rubik.variable} ${jakarta.variable} ${plexMono.variable}`}>
      <body className="type-body-md bg-surface text-ink">
        <script
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
          type="application/ld+json"
        />
        {children}
      </body>
    </html>
  );
}
