"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";

export interface SiteHeaderProps {
  nav: {
    brand: string;
    product: string;
    impact: string;
    partnership: string;
    education: string;
    sampleCta: string;
    menuLabel: string;
    closeLabel: string;
  };
  faqLabel: string;
}

/**
 * Header lengket beranda. Server Component induk (`app/page.tsx`) yang memegang teksnya,
 * komponen ini hanya mengelola keadaan buka/tutup menu seluler.
 *
 * Tinggi tautan 44 px mengikuti target sentuh DESIGN.md; menu seluler memakai satu tombol
 * dengan `aria-expanded` agar pembaca layar tahu keadaan panel.
 */
export function SiteHeader({ nav, faqLabel }: SiteHeaderProps): ReactNode {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#formulasi", label: nav.product },
    { href: "#dampak", label: nav.impact },
    { href: "#kemitraan", label: nav.partnership },
    { href: "#edukasi", label: nav.education },
    { href: "#faq", label: faqLabel },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur">
      <Container>
        <div className="flex h-16 items-center justify-between gap-md md:h-20">
          <a className="flex items-center gap-sm" href="#hero">
            <Image
              alt=""
              className="h-8 w-auto"
              height={150}
              priority
              src="/img/logo.png"
              width={186}
            />
            <span className="type-h3 text-ink">{nav.brand}</span>
          </a>

          <nav
            aria-label={nav.brand}
            className="hidden items-center gap-lg lg:flex"
          >
            {links.map((link) => (
              <a
                className="flex h-11 items-center type-body-sm text-text hover:text-primary"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden lg:block">
            <ButtonLink href="#form-sampel" variant="accent">
              {nav.sampleCta}
            </ButtonLink>
          </div>

          <button
            aria-controls="menu-utama"
            aria-expanded={open}
            aria-label={open ? nav.closeLabel : nav.menuLabel}
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
        className={cn(
          "border-t border-border bg-surface lg:hidden",
          open ? "block" : "hidden",
        )}
        id="menu-utama"
      >
        <Container>
          <nav aria-label={nav.brand} className="flex flex-col py-sm">
            {links.map((link) => (
              <a
                className="flex min-h-12 items-center type-body-md text-text hover:text-primary"
                href={link.href}
                key={link.href}
                onClick={() => {
                  setOpen(false);
                }}
              >
                {link.label}
              </a>
            ))}
            <ButtonLink
              className="mt-sm"
              href="#form-sampel"
              onClick={() => {
                setOpen(false);
              }}
              variant="accent"
            >
              {nav.sampleCta}
            </ButtonLink>
          </nav>
        </Container>
      </div>
    </header>
  );
}
