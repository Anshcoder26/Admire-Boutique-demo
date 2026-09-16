import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  /** Adds a subtle lift on hover — use for interactive/clickable cards. */
  interactive?: boolean;
  /** Adds a thin gold hairline instead of the default maroon line. */
  gold?: boolean;
}

export function Card({ children, interactive, gold, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--panel)] rounded-[var(--radius-xl)] shadow-[var(--shadow-md)]",
        gold ? "border border-[#D4AF37]/35" : "border border-[#7D1D1D]/12",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
