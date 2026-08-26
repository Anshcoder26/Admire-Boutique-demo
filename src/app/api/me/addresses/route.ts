import { NextResponse } from "next/server";
import { createAddress, listCustomerAddresses, validateUserSessionToken } from "@/lib/db";

function getUserFromRequest(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";
  if (!token) return null;
  return validateUserSessionToken(token);
}

export async function GET(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, addresses: listCustomerAddresses(user.id) });
}

export async function POST(request: Request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    label?: string;
    full_name?: string;
    phone?: string;
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    is_default?: boolean;
  };

  if (!body.label || !body.full_name || !body.phone || !body.line1 || !body.city || !body.state || !body.pincode) {
    return NextResponse.json({ error: "Incomplete address details" }, { status: 400 });
  }

  const address = createAddress(user.id, {
    label: body.label,
    full_name: body.full_name,
    phone: body.phone,
    line1: body.line1,
    line2: body.line2,
    city: body.city,
    state: body.state,
    pincode: body.pincode,
    country: body.country || "India",
    is_default: Boolean(body.is_default),
  });

  return NextResponse.json({ success: true, address }, { status: 201 });
}
