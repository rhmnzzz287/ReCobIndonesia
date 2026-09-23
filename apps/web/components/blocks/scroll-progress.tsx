"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Bilah kemajuan gulir tipis di paling atas jendela.
 *
 * Penulisan lebar lewat `requestAnimationFrame` yang dibatalkan tiap peristiwa gulir: satu render
 * per bingkai, bukan satu render per piksel gulir. Bilah ini murni hiasan, jadi seluruhnya
 * `aria-hidden` dan tidak punya padanan teks.
 */
export function ScrollProgress(): ReactNode {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    let frame = 0;

    function onScroll(): void {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setRatio(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-1">
      <span
        className="block h-full bg-accent motion-reduce:transition-none"
        style={{ width: `${(ratio * 100).toFixed(2)}%` }}
      />
    </div>
  );
}
