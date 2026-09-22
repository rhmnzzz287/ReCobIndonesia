"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { copy } from "@/content/copy";

/** Bilah ajakan lengket untuk layar kecil; muncul setelah pengguna melewati hero. */
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-md transition-transform md:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex gap-xs">
        <ButtonLink className="flex-1" href="/kontak#form-sampel" variant="accent">
          {copy.cta.sticky.ctaLabel}
        </ButtonLink>
        <ButtonLink className="flex-1" href="/kontak#form-sampel" variant="secondary">
          {copy.cta.sticky.whatsappLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
