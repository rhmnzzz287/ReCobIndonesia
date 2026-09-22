import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface AlertProps {
  children: ReactNode;
  className?: string;
}

/** Penanda asumsi/disclaimer: ikon wajib, maksimum tiga baris (Docs/DESIGN.md, alert-warn). */
export function Alert({ children, className }: AlertProps): ReactNode {
  return (
    <div
      className={cn(
        "flex items-start gap-xs rounded-sm bg-amber-soft p-md type-body-sm text-amber-ink",
        className,
      )}
      role="note"
    >
      <TriangleAlert aria-hidden="true" className="mt-2xs shrink-0" size={20} strokeWidth={1.75} />
      <div>{children}</div>
    </div>
  );
}
