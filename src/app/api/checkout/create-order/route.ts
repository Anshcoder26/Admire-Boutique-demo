import { NextResponse } from "next/server";
import { createOrder, validateUserSessionToken } from "@/lib/db";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  const user = token ? await validateUserSessionToken(token) : null;

  if (!user) {
    return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
  }

  const body = (await request.json()) as {
    order_number?: string;
    items?: Array<{ name: string; size: string; qty: number; price: number }>; 
    subtotal?: number;
    shipping?: number;
    discount?: number;
    total?: number;
    payment_method?: string;
    address?: { label?: string; city?: string; state?: string; pincode?: string };
  };

  if (!body.items || body.items.length === 0) {
    return NextResponse.json({ error: "Order requires items" }, { status: 400 });
  }

  const paymentMethod = body.payment_method || "Cash on Delivery";
  if (paymentMethod === "Razorpay" && !(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)) {
    return NextResponse.json(
      { error: "Razorpay is not configured for this environment. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local." },
      { status: 400 }
    );
  }

  const order = await createOrder(user.id, {
    order_number: body.order_number || `AB-${Date.now()}`,
    status: "Confirmed",
    subtotal: Number(body.subtotal ?? 0),
    shipping: Number(body.shipping ?? 0),
    discount: Number(body.discount ?? 0),
    total: Number(body.total ?? 0),
    payment_status: paymentMethod === "Cash on Delivery" ? "Pending" : "Paid",
    payment_method: paymentMethod,
    delivery_partner: "BlueDart",
    tracking_id: `BD-${Date.now()}`,
    estimated_delivery: "Estimated arrival in 4–7 business days",
    items: body.items,
  });

  return NextResponse.json({ success: true, order });
}
