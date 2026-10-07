import { NextRequest, NextResponse } from "next/server";
import { validateUserSessionToken, getOrderById } from "@/lib/db";
import { generateInvoiceStream } from "@/lib/invoice-generator";
import { buildInvoiceData } from "@/lib/notifications/order-context";

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

    const invoiceStream = await generateInvoiceStream(buildInvoiceData(order, user));

    return new NextResponse(invoiceStream as unknown as ReadableStream<Uint8Array>, {
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
