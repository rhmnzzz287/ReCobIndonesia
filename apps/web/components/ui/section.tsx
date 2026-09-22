import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const sectionStyles = cva("px-lg py-2xl lg:py-section", {
  variants: {
    tone: {
      surface: "bg-surface text-ink",
      cream: "bg-cream text-ink",
      paper: "bg-paper text-ink",
      primary: "bg-primary text-surface",
      ink: "bg-ink-deep text-surface",
    },
  },
  defaultVariants: { tone: "surface" },
});

export interface SectionProps extends VariantProps<typeof sectionStyles> {
  children: ReactNode;
  className?: string;
  id?: string;
  labelledBy?: string;
}

export function Section({
  children,
  className,
  id,
  labelledBy,
  tone,
}: SectionProps): ReactNode {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(sectionStyles({ tone }), className)}
      id={id}
    >
      <div className="mx-auto w-full max-w-[1200px]">{children}</div>
    </section>
  );
}
