import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans, Rubik } from "next/font/google";
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
  title: "ReCob.id — Pakan Konsentrat Sapi Perah dari Limbah Bonggol Jagung",
  description:
    "Pelet konsentrat sapi perah berprotein tinggi dari bonggol jagung dan ampas tahu terfermentasi. Rp160.000 per karung 50 kg.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${rubik.variable} ${jakarta.variable} ${plexMono.variable}`}>
      <body className="type-body-md bg-surface text-ink">{children}</body>
    </html>
  );
}
