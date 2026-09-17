import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { validateUserSessionToken, getOrderById, updateOrder } from "@/lib/db";

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
    order_number: string;
    order_id?: string;
  };

  if (!body.order_number) {
    return NextResponse.json({ error: "Missing order_number" }, { status: 400 });
  }

  // The Razorpay amount is ALWAYS derived from the persisted order total, never
  // from the client. Trusting a client-supplied amount would let a buyer create
  // a full-price order and then pay a tiny amount (the verify step only checks
  // the signature, not the value). So a valid DB order id is mandatory here.
  if (!body.order_id) {
    return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
  }

  const dbOrder = await getOrderById(body.order_id);
  if (!dbOrder || dbOrder.customer_id !== user.id) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Server-authoritative amount (in paise). Ignore any client-provided amount.
  const amountPaise = Math.round(Number(dbOrder.total) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise <= 0) {
    return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
  }

  try {
    // Create Razorpay order (amount in paise), using the trusted order total.
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: body.order_number,
      notes: {
        customer_id: user.id,
        customer_email: user.email,
      },
    });

    await updateOrder(body.order_id, { razorpay_order_id: rzpOrder.id });

    return NextResponse.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount: amountPaise,
      key_id: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("[RAZORPAY] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create payment order" },
      { status: 500 }
    );
  }
}
