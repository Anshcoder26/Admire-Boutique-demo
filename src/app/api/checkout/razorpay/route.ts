import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { validateUserSessionToken } from "@/lib/db";

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
  };

  if (!body.amount || !body.order_number) {
    return NextResponse.json({ error: "Missing amount or order_number" }, { status: 400 });
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
