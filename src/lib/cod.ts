/** Helpers for Cash on Delivery orders (pure, so they're unit-testable and safe in the browser). */

export const COD_ADVANCE_AMOUNT = 500;

/** The store's order line: sends COD messages and receives screenshots, queries and owner alerts. */
export const ORDER_WHATSAPP_NUMBER = "919259314348";
const ORDER_WHATSAPP_DISPLAY = "+91 92593 14348";

/** How long stock is held for an unpaid COD advance before the owner should follow up and cancel. */
export const COD_HOLD_HOURS = 48;

export type CodPaymentDetails = {
  /** Empty until COD_UPI_ID is configured. */
  upiId: string;
  screenshotWhatsapp: string;
  supportPhone: string;
};

/** Server only: the COD_* settings are not exposed to the browser bundle. */
export function readCodPaymentDetails(): CodPaymentDetails {
  return {
    upiId: (process.env.COD_UPI_ID || "").trim(),
    screenshotWhatsapp: (process.env.COD_SCREENSHOT_WHATSAPP || "").trim() || ORDER_WHATSAPP_DISPLAY,
    supportPhone: (process.env.COD_SUPPORT_PHONE || "").trim() || ORDER_WHATSAPP_DISPLAY,
  };
}

export function codBalanceDue(total: number, advance: number = COD_ADVANCE_AMOUNT): number {
  return Math.max(0, Number(total) - Number(advance));
}

/** Postgres returns a Date or ISO string; SQLite returns "YYYY-MM-DD HH:MM:SS" in UTC with no zone. */
function parseOrderTime(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO time the 48-hour stock hold ends, or null if the order time can't be read. */
export function codHoldDeadline(createdAt: unknown): string | null {
  const created = parseOrderTime(createdAt);
  return created ? new Date(created.getTime() + COD_HOLD_HOURS * 3_600_000).toISOString() : null;
}

export function isCodHoldOver(createdAt: unknown, now: Date = new Date()): boolean {
  const deadline = codHoldDeadline(createdAt);
  return deadline !== null && now.getTime() >= new Date(deadline).getTime();
}
