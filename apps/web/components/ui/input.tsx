import { CircleAlert } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends Omit<ComponentProps<"input">, "className"> {
  className?: string;
  invalid?: boolean;
}

export function Input({ className, invalid = false, ...props }: InputProps): ReactNode {
  return (
    <input
      aria-invalid={invalid}
      className={cn(
        "h-12 w-full rounded-sm border border-text-secondary bg-surface px-md type-body-md text-ink outline-none focus-visible:ring-[3px] focus-visible:ring-accent/35",
        invalid && "border-amber-ink",
        className,
      )}
      {...props}
    />
  );
}

export interface LabelProps extends Omit<ComponentProps<"label">, "className"> {
  className?: string;
  required?: boolean;
}

export function Label({ children, className, required = false, ...props }: LabelProps): ReactNode {
  return (
    <label className={cn("type-body-sm font-medium text-text", className)} {...props}>
      {children}
      {required ? <span className="text-amber-ink"> *</span> : null}
    </label>
  );
}

export interface FieldErrorProps {
  children: ReactNode;
}

export function FieldError({ children }: FieldErrorProps): ReactNode {
  return (
    <p className="flex items-center gap-xs type-caption text-amber-ink">
      <CircleAlert aria-hidden="true" size={16} strokeWidth={1.75} />
      {children}
    </p>
  );
}
