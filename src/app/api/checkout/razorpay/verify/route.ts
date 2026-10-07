import { NextRequest, NextResponse, after } from "next/server";
import { validateUserSessionToken, getOrderById } from "@/lib/db";
import { captureException } from "@/lib/error-tracking";
import { markOrderPaid, notifyPaymentOutcome } from "@/lib/payments";
import { isValidCheckoutSignature } from "@/lib/payment-utils";

const REFUND_MESSAGE =
  "Your payment arrived after this order's payment window closed and the items have sold out. It will be refunded in full within 5–7 business days.";

async function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (token) {
    return await validateUserSessionToken(token);
  }

  const nextRequest = request as NextRequest;
  const cookieToken = nextRequest.cookies.get("admire-session")?.value || "";
  if (cookieToken) {
    return await validateUserSessionToken(cookieToken);
  }

  return null;
}

export async function POST(request: Request) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay is not configured" },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    order_id: string;
  };

  if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature || !body.order_id) {
    return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
  }

  try {
    if (!isValidCheckoutSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)) {
      console.error("[RAZORPAY] Signature verification failed for order:", body.order_id);
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
    }

    // Prevent tampering / IDOR: the order must belong to the authenticated user.
    const order = await getOrderById(body.order_id);
    if (!order || order.customer_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    // The Razorpay order must have been created by us for THIS order (which
    // fixes the amount). Otherwise a valid signature from a cheaper order
    // could be replayed to mark this one as paid.
    if (!order.razorpay_order_id || order.razorpay_order_id !== body.razorpay_order_id) {
      return NextResponse.json({ error: "Payment does not match this order" }, { status: 400 });
    }

    // Shared with the webhook: atomic and idempotent, so whichever arrives
    // first records the payment and only that one sends notifications.
    const outcome = await markOrderPaid(
      body.order_id,
      { razorpayOrderId: body.razorpay_order_id, razorpayPaymentId: body.razorpay_payment_id },
      "checkout"
    );
    after(() => notifyPaymentOutcome(outcome, body.order_id));

    const refundDue =
      outcome === "refund_due" ||
      (outcome === "already_processed" && (await getOrderById(body.order_id))?.payment_status === "Refund Due");
    if (refundDue) {
      return NextResponse.json({ success: false, refund_due: true, error: REFUND_MESSAGE }, { status: 409 });
    }

    return NextResponse.json({
      success: true,
      message: outcome === "already_processed" ? "Payment already verified" : "Payment verified successfully",
    });
  } catch (error) {
    console.error("[RAZORPAY VERIFY] Error:", error);
    void captureException(error, { route: "checkout/razorpay/verify" });
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment verification failed" },
      { status: 500 }
    );
  }
}
