import { NextRequest, NextResponse } from "next/server";
import {
  listCustomerOrders,
  getCustomerOrderById,
  getProductById,
  getProductByName,
  validateUserSessionToken,
} from "@/lib/db";

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

// Map a DB status string to the lowercase union the order-detail page expects.
function normalizeStatus(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "confirmed") return "processing";
  if (["pending", "processing", "shipped", "delivered", "cancelled"].includes(s)) {
    return s;
  }
  return "processing";
}

// Convert a raw order row into the shape the order-detail page renders.
type RawOrderItem = {
  image?: string;
  productId?: string;
  name: string;
  qty?: number;
  quantity?: number;
  price?: number;
  size?: string;
  color?: string;
};

async function toOrderDetail(row: Record<string, unknown>) {
  const rawItems = (Array.isArray(row.items) ? row.items : []) as RawOrderItem[];

  const items = await Promise.all(
    rawItems.map(async (item) => {
      let image = item.image;
      if (!image) {
        const product = item.productId
          ? await getProductById(item.productId)
          : await getProductByName(item.name);
        image = product?.images?.[0] || "";
      }
      return {
        name: item.name,
        image,
        quantity: Number(item.qty ?? item.quantity ?? 1),
        price: Number(item.price ?? 0),
        size: item.size || undefined,
        color: item.color || undefined,
      };
    })
  );

  let address: Record<string, unknown> = {};
  try {
    address = row.address_json ? JSON.parse(row.address_json as string) : {};
  } catch {
    address = {};
  }

  const hasAddress = address && (address.line1 || address.full_name);

  return {
    id: row.id,
    orderNumber: row.order_number || row.id,
    date: row.created_at || new Date().toISOString(),
    total: Number(row.total ?? 0),
    status: normalizeStatus(String(row.status ?? "")),
    paymentStatus: row.payment_status || "Pending",
    paymentMethod: row.payment_method || "",
    subtotal: Number(row.sub_total ?? 0),
    shipping: Number(row.shipping ?? 0),
    discount: Number(row.discount ?? 0),
    items,
    shippingAddress: hasAddress
      ? {
          name: address.full_name || "",
          email: address.email || "",
          phone: address.phone || "",
          address: [address.line1, address.line2].filter(Boolean).join(", "),
          city: address.city || "",
          state: address.state || "",
          zip: address.pincode || "",
        }
      : undefined,
  };
}

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  // Single-order lookup (scoped to the authenticated customer to prevent IDOR).
  if (id) {
    const row = await getCustomerOrderById(user.id, id);
    if (!row) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order: await toOrderDetail(row) });
  }

  return NextResponse.json({ success: true, orders: await listCustomerOrders(user.id) });
}
