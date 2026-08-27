import { NextRequest, NextResponse } from "next/server";
import { createOrder, validateUserSessionToken, getProductById, getProductByName, getOrderByNumber } from "@/lib/db";

async function getUserFromRequest(request: Request) {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (token) {
    return await validateUserSessionToken(token);
  }
  
  // Fall back to HTTP-only cookie
  const nextRequest = request as NextRequest;
  const cookieToken = nextRequest.cookies.get("admire-session")?.value || "";
  if (cookieToken) {
    return await validateUserSessionToken(cookieToken);
  }
  
  return null;
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 });
  }

  const body = (await request.json()) as {
    order_number?: string;
    items?: Array<{ productId?: string; name: string; size: string; qty: number; price: number }>; 
    subtotal?: number;
    shipping?: number;
    discount?: number;
    total?: number;
    payment_method?: string;
    address?: { id?: string; label?: string; full_name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; pincode?: string; country?: string };
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

  try {
    // FIX P1 + P2: Validate items and enrich with database data
    const validatedItems = await Promise.all(
      body.items.map(async (item) => {
        // Get productId if missing (P1: Missing productId fallback)
        let productId = item.productId;
        if (!productId) {
          const product = await getProductByName(item.name);
          if (!product) {
            throw new Error(`Product "${item.name}" not found in database`);
          }
          productId = product.id;
        }

        // Get current product data to validate price (P2: Price validation)
        const product = await getProductById(productId);
        if (!product) {
          throw new Error(`Product with ID "${productId}" not found`);
        }

        // Validate quantity is reasonable (security)
        if (item.qty <= 0 || item.qty > 10) {
          throw new Error(`Invalid quantity: ${item.qty}. Must be between 1 and 10`);
        }

        // Use database price to prevent price tampering
        return {
          productId,
          name: product.name,
          size: item.size,
          qty: item.qty,
          price: product.price, // Use current DB price, not cart price
        };
      })
    );

    // FIX P4: Duplicate order prevention - check if order already exists
    const orderNumber = body.order_number || `AB-${Date.now()}`;
    const existingOrder = await getOrderByNumber(orderNumber);
    if (existingOrder) {
      return NextResponse.json(
        { error: "Order already exists. Please refresh and try again.", order: existingOrder },
        { status: 409 }
      );
    }

    // FIX P3: Address validation and persistence
    if (!body.address || !body.address.line1 || !body.address.city) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    const order = await createOrder(user.id, {
      order_number: orderNumber,
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
      items: validatedItems,
      address: body.address, // FIX P3: Pass address to createOrder
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    console.error("[CHECKOUT] Error:", message);
    
    // Check if it's a stock error
    if (message.includes("Insufficient stock")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    
    // Check if it's a duplicate order error
    if (message.includes("Order already exists")) {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    
    // Other validation errors
    if (message.includes("not found") || message.includes("Invalid") || message.includes("required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    
    return NextResponse.json({ error: message || "Failed to create order" }, { status: 500 });
  }
}
