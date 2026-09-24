"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { copy } from "@/content/copy";

/**
 * Bilah ajakan lengket untuk layar kecil; muncul setelah pengguna melewati hero.
 *
 * Bertahan sampai `lg` (1024 px), bukan `md`. Pada 768-1023 px tautan navigasi masih tersembunyi
 * di balik menu hamburger dan ajakan header baru tampil dari `lg`, sehingga tanpa bilah ini tablet
 * hanya punya satu jalur konversi yang perlu dibuka dulu. Padding bawah footer memakai breakpoint
 * `lg` yang sama agar bilah tidak menutup baris legalitas.
 */
export function StickyCta(): ReactNode {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll(): void {
      setVisible(window.scrollY > 640);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-md transition-transform lg:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-xs">
        <ButtonLink className="min-w-0 flex-1 text-center" href="/kontak#form-sampel" variant="accent">
          {copy.cta.preorderLabel}
        </ButtonLink>
        <ButtonLink className="min-w-0 flex-1 text-center" href="/kontak#form-sampel" variant="secondary">
          {copy.cta.sampleLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
