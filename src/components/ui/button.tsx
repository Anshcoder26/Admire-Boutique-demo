import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "gold";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide " +
  "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 disabled:cursor-not-allowed " +
  "disabled:opacity-60 active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#7D1D1D] text-white shadow-[0_10px_30px_rgba(125,29,29,0.25)] hover:bg-[#641414] hover:shadow-[0_14px_36px_rgba(125,29,29,0.35)]",
  secondary:
    "bg-[#8B7355] text-white shadow-sm hover:bg-[#6E5A42]",
  outline:
    "border border-[#7D1D1D]/30 bg-transparent text-[#7D1D1D] hover:border-[#7D1D1D] hover:bg-[#7D1D1D]/5",
  ghost:
    "bg-transparent text-[#7D1D1D] hover:bg-[#7D1D1D]/8",
  gold:
    "text-[#3A2410] shadow-[0_10px_30px_rgba(212,175,55,0.28)] hover:shadow-[0_14px_36px_rgba(212,175,55,0.4)] " +
    "bg-[linear-gradient(120deg,#B8912D,#E6C866_50%,#B8912D)]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[38px] px-4 py-2 text-sm",
  md: "min-h-[46px] px-6 py-2.5 text-sm md:text-base",
  lg: "min-h-[52px] px-8 py-3.5 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}

function classesFor({ variant = "primary", size = "md", fullWidth, className }: CommonProps) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({ variant, size, fullWidth, className, children, ...props }: ButtonProps) {
  return (
    <button className={classesFor({ variant, size, fullWidth, className, children })} {...props}>
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

export function ButtonLink({ variant, size, fullWidth, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={classesFor({ variant, size, fullWidth, className, children })} {...props}>
      {children}
    </Link>
  );
}
