import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Page section wrapper — consistent horizontal padding, max width, and vertical
 * rhythm across the storefront.
 */
export function Section({
  children,
  className,
  width = "default",
  spacing = "md",
}: {
  children: ReactNode;
  className?: string;
  width?: "default" | "wide" | "narrow";
  spacing?: "none" | "sm" | "md" | "lg";
}) {
  const maxW = {
    narrow: "max-w-3xl",
    default: "max-w-7xl",
    wide: "max-w-[88rem]",
  }[width];

  const pad = {
    none: "",
    sm: "py-6 md:py-8",
    md: "py-8 md:py-12",
    lg: "py-12 md:py-20",
  }[spacing];

  return (
    <section className={cn("px-4 md:px-8 lg:px-10", pad, className)}>
      <div className={cn("mx-auto", maxW)}>{children}</div>
    </section>
  );
}

/**
 * Festive section header: gold eyebrow + serif title + optional description,
 * with a "View all" style action slot.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={cn(
        "mb-6 md:mb-8 gap-4",
        centered
          ? "flex flex-col items-center text-center"
          : "flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end",
        className,
      )}
    >
      <div className={cn(centered && "flex flex-col items-center")}>
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-3 text-[#6B5D57] leading-relaxed",
              centered ? "max-w-2xl" : "max-w-xl",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
