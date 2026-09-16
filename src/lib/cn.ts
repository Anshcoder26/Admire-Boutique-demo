/**
 * Tiny classname joiner — filters out falsy values and joins with spaces.
 * Dependency-free alternative to clsx for composing conditional Tailwind classes.
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
