"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface CountUpProps {
  /** Angka yang dinaikkan; dipisah dari awalan/akhiran agar bisa dianimasikan sendiri. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Angka nol di belakang koma pada keluaran akhir. */
  decimals?: number;
  durationMs?: number;
  className?: string;
}

/**
 * Angka yang naik dari nol saat masuk viewport (Docs/DESIGN.md bagian Motion: 700 ms, sekali saja).
 *
 * Teks server sengaja berisi angka AKHIR, bukan nol: tanpa JavaScript atau dengan
 * `prefers-reduced-motion: reduce`, pengunjung langsung membaca angka yang benar. Animasi hanya
 * menggantikan teks itu selama 700 ms ketika JavaScript aktif — kalau urutannya dibalik, layar
 * kosong akan tampil lebih dulu pada perangkat yang lambat.
 */
export function CountUp({
  className,
  decimals = 0,
  durationMs = 700,
  prefix = "",
  suffix = "",
  value,
}: CountUpProps): ReactNode {
  const [shown, setShown] = useState(value);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;

    // `matchMedia` tidak ada di lingkungan DOM minimal (jsdom, peramban lama); tanpa penjagaan ini
    // halaman yang benar-benar butuh animasi justru gagal render di sana.
    const reducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      return;
    }

    const format = new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    let frame = 0;
    let startedAt = 0;
    let done = false;

    const step = (now: number): void => {
      if (startedAt === 0) startedAt = now;
      const progress = Math.min(1, (now - startedAt) / durationMs);
      setShown(value * progress);
      if (progress < 1) frame = requestAnimationFrame(step);
      else {
        done = true;
        setShown(value);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        if (done) return;
        // Nol dulu supaya lompatan ke angka pertama tidak terlihat; satu render, bukan state awal.
        setShown(0);
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [decimals, durationMs, value]);

  const text = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(shown);

  return (
    <span className={className} ref={ref}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
}
