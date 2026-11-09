/** One quoted CSV cell. Text starting with a formula character is neutralised so Excel won't run it. */
export function toCsvCell(value: unknown): string {
  const text = String(value ?? "");
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}
