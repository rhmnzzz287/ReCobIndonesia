import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface CaptionNoteProps {
  children: ReactNode;
  className?: string;
}

/** Blok asumsi/sumber di bawah angka: caption pada paper, diakhiri titik. */
export function CaptionNote({
  children,
  className,
}: CaptionNoteProps): ReactNode {
  return (
    <p
      className={cn(
        "rounded-sm bg-paper px-sm py-xs type-caption text-text-secondary",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Varian untuk bidang gelap/jenuh: latar tembus pandang, teks tetap terbaca. */
export function CaptionNoteInverse({
  children,
  className,
}: CaptionNoteProps): ReactNode {
  return (
    <p
      className={cn(
        "rounded-sm bg-surface/10 px-sm py-xs type-caption text-surface",
        className,
      )}
    >
      {children}
    </p>
  );
}
