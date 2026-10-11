/**
 * Order statuses the owner can set from the admin panel (pure, so it's unit-testable).
 * Store policy: orders cannot be cancelled, so "Cancelled" is never accepted here.
 */

export const ORDER_STATUSES = ["Confirmed", "Packed", "Shipped", "Delivered"];
export const PAYMENT_STATUSES = ["Pending", "Paid", "Failed", "Refund Due", "Refunded"];
// Set automatically by the payment flow; not something to move orders into or out of by hand.
export const SYSTEM_STATUSES = ["Awaiting Payment", "Cancelled"];

export type AdminOrderUpdateError = { status: 400 | 409; error: string };

/** Returns why an admin update is not allowed, or null if it is. */
export function validateAdminOrderUpdate(
  currentStatus: string,
  update: { status?: unknown; paymentStatus?: unknown }
): AdminOrderUpdateError | null {
  const { status, paymentStatus } = update;

  if (status !== undefined && status !== null && status !== "") {
    if (typeof status !== "string" || !ORDER_STATUSES.includes(status)) {
      return { status: 400, error: `Status must be one of: ${ORDER_STATUSES.join(", ")}` };
    }
    if (SYSTEM_STATUSES.includes(currentStatus)) {
      return { status: 409, error: `An order that is ${currentStatus} can't be moved to another status` };
    }
  }

  if (paymentStatus !== undefined && paymentStatus !== null && paymentStatus !== "") {
    if (typeof paymentStatus !== "string" || !PAYMENT_STATUSES.includes(paymentStatus)) {
      return { status: 400, error: `Payment status must be one of: ${PAYMENT_STATUSES.join(", ")}` };
    }
  }

  return null;
}
