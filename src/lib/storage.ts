/**
 * Small, safe wrappers around browser localStorage.
 *
 * Reading JSON straight out of localStorage is risky: the value can be corrupt,
 * partially written, or tampered with, and a raw JSON.parse throw would crash the
 * component tree. These helpers never throw — they fall back to a default instead.
 */

/** Canonical localStorage keys used across the app. */
export const STORAGE_KEYS = {
  cart: "admire-cart",
  wishlist: "admire_wishlist",
} as const;

/**
 * Parse a JSON value from localStorage, returning `fallback` on any error
 * (missing key, invalid JSON, SSR / no window).
 */
export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Serialize and store a value in localStorage, swallowing quota / SSR errors. */
export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (quota exceeded, private mode, etc.)
  }
}
