"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Pengungkap saat masuk viewport. Satu komponen mengamati seluruh `[data-reveal]` di
 * dokumen, jadi tiap seksi tidak perlu memasang observer sendiri.
 *
 * Alasan memilih IntersectionObserver, bukan pustaka animasi: kebutuhan hanya
 * transisi opacity + translateY sekali jalan (pola yang sama dipakai locol.company
 * lewat Framer Motion, `opacity 0 -> 1` + `translateY(...) -> 0`). Menambah dependensi
 * animasi untuk satu efek bertentangan dengan aturan dependensi repo.
 *
 * Elemen tanpa JavaScript atau dengan `prefers-reduced-motion: reduce` tampil langsung;
 * aturannya ada di globals.css, bukan di sini, agar tidak bergantung pada hidrasi.
 */
export function ScrollReveal(): ReactNode {
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );

    const revealAll = (): void => {
      for (const target of targets) target.dataset.revealState = "shown";
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || typeof IntersectionObserver === "undefined") {
      revealAll();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealState = "shown";
          observer.unobserve(entry.target);
        }
      },
      // Ambang 0,15: elemen terungkap setelah seperenamnya terlihat, bukan saat
      // menyentuh tepi bawah viewport — gerakan terasa disengaja, bukan kebetulan.
      { rootMargin: "0px 0px -10% 0px", threshold: 0.15 },
    );

    for (const target of targets) {
      // Elemen yang sudah berada di viewport saat pemuatan diberi keadaan awal lalu
      // diamati, sehingga ia ikut bertransisi alih-alih melompat.
      target.dataset.revealState = "hidden";
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
