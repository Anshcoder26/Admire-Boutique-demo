/**
 * Pure CSRF origin-verification logic, extracted so it can be unit-tested
 * independently of the Next.js proxy runtime.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

export interface OriginCheckInput {
  method: string;
  host: string | null;
  origin: string | null;
  referer: string | null;
  appUrl?: string | null;
}

export type OriginCheckResult = "allow" | "reject";

/**
 * Decides whether a request should be allowed through CSRF origin checks.
 *
 * - Non-mutating methods are always allowed.
 * - Requests with no Origin/Referer (typical of non-browser clients) are allowed,
 *   since CSRF is a browser-only attack.
 * - A present Origin/Referer must resolve to a host in the allow-list (the request
 *   host and, optionally, a configured app URL). Anything else is rejected.
 */
export function checkOrigin(input: OriginCheckInput): OriginCheckResult {
  if (!isMutatingMethod(input.method)) return "allow";

  const source = input.origin ?? input.referer;
  if (!source) return "allow";

  let sourceHost: string;
  try {
    sourceHost = new URL(source).host;
  } catch {
    return "reject";
  }

  const allowed = new Set<string>();
  if (input.host) allowed.add(input.host);
  if (input.appUrl) {
    try {
      allowed.add(new URL(input.appUrl).host);
    } catch {
      // ignore invalid configured app URL
    }
  }

  return allowed.has(sourceHost) ? "allow" : "reject";
}
