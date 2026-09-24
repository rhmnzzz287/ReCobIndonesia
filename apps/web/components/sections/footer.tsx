import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { copy } from "@/content/copy";

/**
 * Footer dua tingkat. Sebelumnya grid `md:grid-cols-3` menampung empat blok berlabel
 * ("Produk & Solusi", "Wilayah Kemitraan KUD", "Kepatuhan & Legalitas", "Legal") sehingga
 * blok terakhir jatuh ke baris tersendiri selebar penuh tanpa hierarki, dan tinggi kolom
 * bergerigi (162/132/124 px).
 *
 * Kini: baris merek berdiri sendiri (lebar dibatasi 68ch agar tagline tidak melebar penuh),
 * lalu tiga kolom tautan `auto-rows-fr` dengan tinggi seragam, lalu baris legal dan bilah
 * identitas berbatas. Empat blok berlabel tidak lagi bercampur dengan blok merek.
 */
export async function Footer(): Promise<ReactNode> {
  const columns = [
    {
      title: copy.footer.productTitle,
      items: copy.footer.productLinks.map((link) => link),
    },
    {
      title: copy.footer.companyTitle,
      items: copy.footer.regions.map(
        (region) => `${region.name} — ${region.location}`,
      ),
    },
    {
      title: copy.footer.contactTitle,
      items: copy.footer.compliance.map((item) => item),
    },
  ];

  return (
    <footer className="bg-ink-deep pb-[calc(var(--spacing-2xl)+80px)] pt-2xl text-surface lg:pb-2xl">
      <Container>
        <div className="max-w-[68ch]">
          <div className="flex items-center gap-sm">
            <Image
              alt=""
              className="h-10 w-auto"
              height={150}
              src="/img/logo.png"
              width={186}
            />
            <p className="type-h3 text-surface">{copy.footer.brand}</p>
          </div>
          <p className="mt-md type-body-sm text-surface/90">
            {copy.footer.tagline}
          </p>
          <p className="mt-md type-label-md uppercase text-accent">
            {copy.footer.badge}
          </p>
        </div>

        <div className="mt-2xl grid auto-rows-fr gap-xl md:grid-cols-3">
          {columns.map((column) => (
            <div className="h-full" key={column.title}>
              <h2 className="type-label-md uppercase text-accent">
                {column.title}
              </h2>
              <ul className="mt-md flex flex-col gap-sm">
                {column.items.map((item) => (
                  <li className="type-body-sm text-surface/90" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-2xl border-t border-surface/20 pt-lg">
          <h2 className="type-label-md uppercase text-accent">
            {copy.footer.legalTitle}
          </h2>
          <ul className="mt-md flex flex-wrap gap-x-xl gap-y-sm">
            {copy.footer.legalLinks.map((link) => (
              <li className="type-body-sm text-surface/90" key={link}>
                {link}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-lg flex flex-col gap-sm border-t border-surface/20 pt-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="type-body-sm text-surface/90">
              {copy.footer.address}
            </p>
            <p className="mt-2xs type-caption text-surface/75">
              {copy.footer.nppStatus}
            </p>
          </div>
          <p className="type-caption text-surface/75">
            {copy.footer.copyright}
          </p>
        </div>

        <p className="mt-md type-caption text-surface/75">
          {copy.footer.contactNotice}
        </p>
      </Container>
    </footer>
  );
}
