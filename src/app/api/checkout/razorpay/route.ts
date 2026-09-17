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
    amount: number;
    order_number: string;
    order_id?: string;
  };

  if (!body.amount || !body.order_number) {
    return NextResponse.json({ error: "Missing amount or order_number" }, { status: 400 });
  }

  // If a DB order id is supplied, it must belong to the authenticated user. We
  // link the Razorpay order id back to it so the verify step can confirm the
  // payment corresponds to this exact order (prevents cross-order replay).
  let dbOrder = null;
  if (body.order_id) {
    dbOrder = await getOrderById(body.order_id);
    if (!dbOrder || dbOrder.customer_id !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
  }

  try {
    // Create Razorpay order (amount in paise)
    const razorpay = getRazorpay();
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(body.amount * 100), // Convert to paise
      currency: "INR",
      receipt: body.order_number,
      notes: {
        customer_id: user.id,
        customer_email: user.email,
      },
    });

    if (body.order_id) {
      await updateOrder(body.order_id, { razorpay_order_id: rzpOrder.id });
    }

    return NextResponse.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
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
