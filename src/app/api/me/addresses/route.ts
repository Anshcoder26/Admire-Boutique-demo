import { NextRequest, NextResponse } from "next/server";
import { createAddress, listCustomerAddresses, validateUserSessionToken } from "@/lib/db";

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

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ success: true, addresses: await listCustomerAddresses(user.id) });
}

export async function POST(request: Request) {
  const user = await getUserFromRequest(request);
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

  const phoneDigits = String(body.phone).replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit Indian mobile number" },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(String(body.pincode).trim())) {
    return NextResponse.json(
      { error: "Enter a valid 6-digit pincode" },
      { status: 400 }
    );
  }

  const address = await createAddress(user.id, {
    label: body.label,
    full_name: body.full_name,
    phone: phoneDigits,
    line1: body.line1,
    line2: body.line2,
    city: body.city,
    state: body.state,
    pincode: String(body.pincode).trim(),
    country: body.country || "India",
    is_default: Boolean(body.is_default),
  });

  return NextResponse.json({ success: true, address }, { status: 201 });
}
