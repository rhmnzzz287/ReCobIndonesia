import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const cardStyles = cva(
  "rounded-lg p-lg transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  {
    variants: {
      tone: {
        surface:
          "bg-surface shadow-[0_1px_2px_rgba(13,18,22,0.06),0_8px_24px_rgba(13,18,22,0.06)]",
        cream: "border border-border bg-cream",
        paper: "border border-border bg-paper",
      },
    },
    defaultVariants: { tone: "surface" },
  },
);

export interface CardProps extends VariantProps<typeof cardStyles> {
  children: ReactNode;
  className?: string;
}

export function Card({ tone, children, className }: CardProps): ReactNode {
  return <div className={cn(cardStyles({ tone }), className)}>{children}</div>;
}
