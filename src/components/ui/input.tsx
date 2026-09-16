import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-[var(--radius-md)] border border-[#7D1D1D]/15 bg-white px-4 py-3 text-[#241A16] " +
  "placeholder:text-[#9c8b83] shadow-inner transition-colors duration-200 " +
  "focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export function Label({
  children,
  htmlFor,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-sm font-semibold text-[#5d413d]", className)}
    >
      {children}
    </label>
  );
}

type InputProps = ComponentPropsWithoutRef<"input">;
export function Input({ className, ...props }: InputProps) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

type TextareaProps = ComponentPropsWithoutRef<"textarea">;
export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(fieldBase, "min-h-[120px] resize-y", className)} {...props} />;
}

type SelectProps = ComponentPropsWithoutRef<"select">;
export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(fieldBase, "appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}

/** Labeled field wrapper — pairs a Label with any control and optional error text. */
export function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-[#b3261e]">{error}</p> : null}
    </div>
  );
}
