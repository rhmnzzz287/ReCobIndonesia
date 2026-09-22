"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
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
 * Tinggi tautan 44 px mengikuti target sentuh DESIGN.md; menu seluler memakai satu tombol
 * dengan `aria-expanded` agar pembaca layar tahu keadaan panel.
 */
export function SiteHeader(): ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-md md:h-20">
          <Link className="flex items-center gap-sm" href="/">
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

          <nav aria-label={copy.nav.brand} className="hidden items-center gap-lg lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                className="flex h-11 items-center type-body-sm text-text hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <ButtonLink href={SAMPLE_HREF} variant="accent">
              {copy.nav.sampleCta}
            </ButtonLink>
          </div>

          <button
            aria-controls="menu-utama"
            aria-expanded={open}
            aria-label={open ? copy.nav.closeLabel : copy.nav.menuLabel}
            className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35 lg:hidden"
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
      </Container>

      <div
        className={cn("border-t border-border bg-surface lg:hidden", open ? "block" : "hidden")}
        id="menu-utama"
      >
        <Container>
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
        </Container>
      </div>
    </header>
  );
}
