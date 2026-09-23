"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { cn } from "@/lib/utils/cn";

/** Tautan navigasi utama. Rute, bukan anchor, supaya setiap halaman punya alamat sendiri. */
const NAV_LINKS = [
  { href: "/", label: copy.nav.home },
  { href: "/produk", label: copy.nav.product },
  { href: "/kalkulator", label: copy.nav.calculator },
  { href: "/mitra", label: copy.nav.partnership },
  { href: "/edukasi", label: copy.nav.education },
  { href: "/kontak", label: copy.nav.contact },
] as const;

/** Ajakan utama mengarah ke formulir sampel di halaman kontak. */
const SAMPLE_HREF = "/kontak#form-sampel";

/**
 * Header lengket untuk seluruh halaman. Komponen ini mengelola keadaan buka/tutup menu seluler
 * dan membaca naskahnya sendiri dari lapisan konten, sehingga layout akar cukup merendernya.
 *
 * Susunan mengikuti nufeed.co.id: pulau mengambang berisi lambang di kiri, tautan di tengah, dan
 * ajakan di kanan. Pulau itu melayang di atas halaman — bar pembungkusnya transparan dan hanya
 * `--header-h` yang memisahkannya dari tepi atas — sehingga isi halaman lewat di belakangnya.
 * Kolom kiri/kanan memakai `1fr` supaya menu benar-benar berada di tengah, bukan hanya tampak di
 * tengah karena lebar kedua sisi kebetulan seimbang.
 *
 * Pengakalan tabrakan: pulau ini berlatar `surface` penuh (bukan kaca transparan) dan tetap
 * setinggi itu di segala posisi gulir, sama seperti nufeed — jadi teks halaman yang lewat di
 * belakangnya tidak pernah mengganggu baca. Jarak atas setiap seksi pertama diatur `--header-h`
 * di `app/globals.css`, dan sasaran anchor memakai `scroll-margin-top` yang sama sehingga judul
 * bagian tidak pernah tertutup pulau.
 *
 * Tinggi tautan 44 px mengikuti target sentuh DESIGN.md; menu seluler memakai satu tombol
 * dengan `aria-expanded` agar pembaca layar tahu keadaan panel.
 */
export function SiteHeader(): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-lg pt-sm md:px-2xl md:pt-md">
      <div
        // Elevasi `raised` dari DESIGN.md; bayangan hijau nufeed tidak dipakai karena warnanya
        // milik merek lain. Panel seluler menempel sebagai pulau kedua di bawahnya.
        className="mx-auto flex h-16 w-full max-w-[1200px] items-center rounded-sm bg-surface px-md shadow-[0_1px_2px_rgba(13,18,22,0.06),0_8px_24px_rgba(13,18,22,0.06)] md:h-20 md:px-lg"
      >
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-sm md:gap-md">
          <Link className="flex items-center gap-sm justify-self-start" href="/">
            <Image
              alt=""
              className="h-8 w-auto"
              height={150}
              priority
              src="/img/logo.png"
              width={186}
            />
            <span className="type-h3 text-ink">{copy.nav.brand}</span>
          </Link>

          <nav
            aria-label={copy.nav.brand}
            className="hidden items-center justify-self-center lg:flex"
          >
            {NAV_LINKS.map((link) => (
              <Link
                aria-current={pathname === link.href ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center rounded-sm px-xs type-label-md uppercase transition-colors",
                  pathname === link.href
                    ? "border-b-2 border-primary text-primary"
                    : "text-text hover:bg-primary-soft hover:text-primary",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden justify-self-end lg:block">
            <ButtonLink href={SAMPLE_HREF} variant="accent">
              {copy.nav.sampleCta}
            </ButtonLink>
          </div>

          <button
            aria-controls="menu-utama"
            aria-expanded={open}
            aria-label={open ? copy.nav.closeLabel : copy.nav.menuLabel}
            className="col-start-3 flex h-11 w-11 items-center justify-center justify-self-end rounded-md text-ink hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35 lg:hidden"
            onClick={() => {
              setOpen((current) => !current);
            }}
            type="button"
          >
            {open ? (
              <X aria-hidden="true" size={24} strokeWidth={1.75} />
            ) : (
              <Menu aria-hidden="true" size={24} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "mx-auto mt-sm w-full max-w-[1200px] overflow-hidden rounded-sm bg-surface shadow-[0_1px_2px_rgba(13,18,22,0.06),0_8px_24px_rgba(13,18,22,0.06)] lg:hidden",
          open ? "block" : "hidden",
        )}
        id="menu-utama"
      >
        <div className="px-md">
          <nav aria-label={copy.nav.brand} className="flex flex-col py-sm">
            {NAV_LINKS.map((link) => (
              <Link
                className="flex min-h-12 items-center type-body-md text-text hover:text-primary"
                href={link.href}
                key={link.href}
                onClick={() => {
                  setOpen(false);
                }}
              >
                {link.label}
              </Link>
            ))}
            <ButtonLink
              className="mt-sm"
              href={SAMPLE_HREF}
              onClick={() => {
                setOpen(false);
              }}
              variant="accent"
            >
              {copy.nav.sampleCta}
            </ButtonLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
