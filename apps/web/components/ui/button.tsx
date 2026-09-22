import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const buttonStyles = cva(
  "inline-flex min-h-12 items-center justify-center gap-xs rounded-md px-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-primary type-label-md uppercase text-surface hover:bg-primary-strong",
        accent:
          "bg-accent type-label-md uppercase text-ink hover:bg-accent-ink",
        secondary:
          "border border-text-secondary bg-surface type-label-md text-primary hover:bg-primary-soft",
        ghost:
          "bg-transparent type-label-md text-primary hover:bg-primary-soft",
      },
      size: {
        md: "",
        lg: "min-h-[52px] px-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;

export interface ButtonProps
  extends Omit<ComponentProps<"button">, "className">, ButtonStyleProps {
  className?: string;
}

export function Button({
  variant,
  size,
  className,
  type,
  ...props
}: ButtonProps): ReactNode {
  return (
    <button
      className={cn(buttonStyles({ variant, size }), className)}
      type={type ?? "button"}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends ButtonStyleProps {
  href: string;
  className?: string;
  external?: boolean;
  children?: ReactNode;
  /** Penangan klik opsional; dipakai menu seluler untuk menutup panel setelah navigasi. */
  onClick?: () => void;
  /** Label aksesibilitas untuk tautan yang teksnya tidak deskriptif. */
  ariaLabel?: string;
}

/** Tombol di atas bidang limau/terang: `secondary` memakai latar putih agar tetap terbaca. */
export function ButtonLink({
  ariaLabel,
  className,
  external = false,
  href,
  onClick,
  size,
  variant,
  children,
}: ButtonLinkProps): ReactNode {
  const classes = cn(buttonStyles({ variant, size }), className);

  if (external || href.startsWith("http")) {
    return (
      <a
        aria-label={ariaLabel}
        className={classes}
        href={href}
        onClick={onClick}
        rel="noopener noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      aria-label={ariaLabel}
      className={classes}
      href={href}
      {...(onClick === undefined ? {} : { onClick })}
    >
      {children}
    </Link>
  );
}
