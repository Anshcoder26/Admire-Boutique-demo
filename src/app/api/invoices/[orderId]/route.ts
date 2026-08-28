import { NextRequest, NextResponse } from "next/server";
import { validateUserSessionToken, getOrderById } from "@/lib/db";
import { generateInvoiceStream } from "@/lib/invoice-generator";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await params;

  try {
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify user owns this order
    if (order.customer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse items if stored as JSON string
    const items =
      typeof order.items === "string" ? JSON.parse(order.items) : order.items || [];

    // Parse address if stored as JSON string
    const address =
      typeof order.shipping_address === "string"
        ? JSON.parse(order.shipping_address)
        : order.shipping_address || {};

    const invoiceStream = await generateInvoiceStream({
      orderNumber: order.order_number,
      date: new Date(order.created_at).toLocaleDateString("en-IN"),
      customerName: user.name || "Customer",
      customerEmail: user.email,
      customerPhone: user.phone || "N/A",
      address: {
        line1: address.line1 || "",
        city: address.city || "",
        state: address.state || "",
        pincode: address.pincode || "",
        country: address.country || "India",
      },
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.qty || item.quantity,
        price: item.price,
      })),
      subtotal: order.subtotal,
      shipping: order.shipping,
      discount: order.discount || 0,
      total: order.total,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      estimatedDelivery: order.estimated_delivery || "4-7 business days",
    });

    return new NextResponse(invoiceStream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice-${order.order_number}.pdf"`,
      },
    });
  } catch (error) {
    console.error("[INVOICE] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
