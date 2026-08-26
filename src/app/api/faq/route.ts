import { NextResponse } from "next/server";
import { listFaqs } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ success: true, faqs: await listFaqs() });
}
