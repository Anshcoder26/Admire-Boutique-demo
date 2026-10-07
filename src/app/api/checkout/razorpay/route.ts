import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { validateUserSessionToken, getOrderById, updateOrder, cancelUnpaidOrder, AWAITING_PAYMENT_STATUS } from "@/lib/db";
import { sweepExpiredOrders } from "@/lib/payments";
import { secondsUntil } from "@/lib/payment-utils";

function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
  });
}

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
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return NextResponse.json(
      { error: "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local." },
      { status: 400 }
    );
  }

  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    amount?: number;
    order_number?: string;
    order_id?: string;
  };

  // The Razorpay amount is ALWAYS derived from the persisted order total, never
  // from the client. Trusting a client-supplied amount would let a buyer create
  // a full-price order and then pay a tiny amount (the verify step only checks
  // the signature, not the value). So a valid DB order id is mandatory here.
  if (!body.order_id) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  await sweepExpiredOrders();

  const dbOrder = await getOrderById(body.order_id);
  if (!dbOrder || dbOrder.customer_id !== user.id || dbOrder.payment_method !== "Razorpay") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // This route both starts the first payment and retries a failed one, on the
  // same order (no duplicates). Only unpaid orders inside their window qualify.
  if (dbOrder.payment_status === "Paid") {
    return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
  }
  const isAwaiting = dbOrder.status === AWAITING_PAYMENT_STATUS && dbOrder.payment_status === "Pending";
  const secondsLeft = secondsUntil(dbOrder.payment_expires_at);
  if (!isAwaiting || secondsLeft <= 0) {
    if (isAwaiting) await cancelUnpaidOrder(dbOrder.id);
    return NextResponse.json(
      { error: "The payment window for this order has closed and it was cancelled. Please place the order again.", expired: true },
      { status: 410 }
    );
  }

  // Server-authoritative amount (in paise). Ignore any client-provided amount.
  const amountPaise = Math.round(Number(dbOrder.total) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
  }

  try {
    // Razorpay allows several payment attempts on one Razorpay order, so a
    // retry reuses it. A new one is only created on the first attempt.
    let razorpayOrderId: string | null = dbOrder.razorpay_order_id || null;
    if (!razorpayOrderId) {
      const razorpay = getRazorpay();
      const rzpOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt: dbOrder.order_number,
        // Capture automatically so successful payments settle (and fire
        // payment.captured) instead of sitting "authorized" until manual capture.
        payment_capture: true,
        notes: {
          order_id: dbOrder.id,
          customer_id: user.id,
          customer_email: user.email,
        },
      });
      razorpayOrderId = rzpOrder.id;
      await updateOrder(dbOrder.id, { razorpay_order_id: razorpayOrderId });
    }

    return NextResponse.json({
      success: true,
      razorpay_order_id: razorpayOrderId,
      amount: amountPaise,
      key_id: process.env.RAZORPAY_KEY_ID,
      order_number: dbOrder.order_number,
      expires_at: dbOrder.payment_expires_at,
      seconds_left: secondsLeft,
    });
  } catch (error) {
    console.error("[RAZORPAY] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment order" },
      { status: 500 }
    );
  }
}
