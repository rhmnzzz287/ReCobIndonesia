import { cva, type VariantProps } from "class-variance-authority";
import { Handshake } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const badgeStyles = cva("inline-flex h-7 items-center gap-2xs rounded-pill px-sm type-caption", {
  variants: {
    tone: {
      neutral: "bg-paper text-text",
      primary: "bg-primary-soft text-primary",
      partner: "bg-tan text-ink",
      warn: "bg-amber-soft text-amber-ink",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface BadgeProps extends VariantProps<typeof badgeStyles> {
  children: ReactNode;
  className?: string;
}

export function Badge({ tone, children, className }: BadgeProps): ReactNode {
  return (
    <span className={cn(badgeStyles({ tone }), className)}>
      {tone === "partner" ? <Handshake aria-hidden="true" size={16} strokeWidth={1.75} /> : null}
      {children}
    </span>
  );
}
