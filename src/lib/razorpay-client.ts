"use client";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: (resp: unknown) => void) => void };
  }
}

// Load the Razorpay checkout script on demand. Resolves false if it can't load
// (e.g. offline) so the caller can surface a friendly error.
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function formatPaymentDeadline(iso?: string | null) {
  return iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "";
}

export type PaymentResult = {
  /**
   * paid: verified and recorded. not_completed: closed/failed, the order can
   * still be retried. expired: the payment window closed and the order was
   * cancelled. refund_due: money was taken but the order couldn't be honoured.
   */
  status: "paid" | "not_completed" | "expired" | "refund_due";
  message?: string;
};

/**
 * Open the Razorpay popup for an existing "Awaiting Payment" order and verify
 * the result with the server. The same order can be paid again after a failed
 * or abandoned attempt until its payment window closes.
 */
export function payOrderWithRazorpay(
  orderId: string,
  options: {
    prefill?: { name?: string; email?: string; contact?: string };
    /** Called when an attempt fails but the popup stays open for a retry. */
    onAttemptFailed?: (message: string) => void;
  } = {}
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    // Razorpay can fire several callbacks (e.g. a failed attempt, then a
    // successful retry inside the same popup); only the first final one counts.
    let settled = false;
    const finish = (result: PaymentResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    void (async () => {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded || !window.Razorpay) {
          return finish({
            status: "not_completed",
            message: "Could not load the payment gateway. Please check your connection and try again.",
          });
        }

        const rzpRes = await fetch("/api/checkout/razorpay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ order_id: orderId }),
        });
        const rzpData = (await rzpRes.json().catch(() => ({}))) as {
          success?: boolean;
          razorpay_order_id?: string;
          key_id?: string;
          amount?: number;
          order_number?: string;
          expires_at?: string;
          seconds_left?: number;
          error?: string;
          expired?: boolean;
        };
        if (rzpRes.status === 410 || rzpData.expired) {
          return finish({
            status: "expired",
            message: rzpData.error || "The payment window closed and the order was cancelled. Please place the order again.",
          });
        }
        if (!rzpRes.ok || !rzpData.success || !rzpData.razorpay_order_id) {
          return finish({ status: "not_completed", message: rzpData.error || "Could not start the payment. Please try again." });
        }
        const deadline = formatPaymentDeadline(rzpData.expires_at);

        const rzp = new window.Razorpay({
          key: rzpData.key_id,
          amount: rzpData.amount,
          currency: "INR",
          name: "Admire Boutique",
          description: `Order ${rzpData.order_number || ""}`.trim(),
          order_id: rzpData.razorpay_order_id,
          prefill: options.prefill,
          theme: { color: "#7D1D1D" },
          // Close the popup when the order's payment window ends, so nobody
          // pays into an order that is about to be auto-cancelled.
          timeout: rzpData.seconds_left && rzpData.seconds_left > 0 ? rzpData.seconds_left : undefined,
          handler: async (response: unknown) => {
            const r = response as { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
            try {
              const verifyRes = await fetch("/api/checkout/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ ...r, order_id: orderId }),
              });
              const verifyData = (await verifyRes.json().catch(() => ({}))) as { success?: boolean; error?: string; refund_due?: boolean };
              if (verifyRes.ok && verifyData.success) return finish({ status: "paid" });
              if (verifyData.refund_due) {
                return finish({ status: "refund_due", message: verifyData.error || "Your payment will be refunded." });
              }
              finish({
                status: "not_completed",
                message:
                  verifyData.error ||
                  "We couldn't confirm your payment yet. If money was deducted, it will be confirmed automatically within a few minutes — please check My Orders before paying again.",
              });
            } catch {
              finish({
                status: "not_completed",
                message:
                  "We couldn't confirm your payment because of a connection problem. If money was deducted, your order will be confirmed automatically within a few minutes — please check My Orders before paying again.",
              });
            }
          },
          modal: {
            ondismiss: () =>
              finish({
                status: "not_completed",
                message: `Payment not completed. Your items are reserved${deadline ? ` until ${deadline}` : " for a few minutes"} — use "Retry payment" to try again.`,
              }),
          },
        });
        // Razorpay keeps the popup open after a failed attempt so the customer
        // can retry with another method; just report why it failed meanwhile.
        rzp.on("payment.failed", (resp: unknown) => {
          const desc = (resp as { error?: { description?: string } })?.error?.description;
          options.onAttemptFailed?.(`${desc || "Payment failed."} You can retry in the payment window or choose another method.`);
        });
        rzp.open();
      } catch {
        finish({ status: "not_completed", message: "Payment error. Please try again." });
      }
    })();
  });
}
