const PLACEHOLDER_ORIGIN = "https://same-site.invalid";

/** Returns the path only if it stays on this site, so a link can't send people elsewhere. */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/")) return null;
  try {
    // Browsers treat "//evil.com" and "/\evil.com" as other sites; so does URL.
    return new URL(value, PLACEHOLDER_ORIGIN).origin === PLACEHOLDER_ORIGIN ? value : null;
  } catch {
    return null;
  }
}
