import { NextResponse } from "next/server";
import { endAllSessions } from "@/lib/session-cookies";

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  await endAllSessions(request, response);
  return response;
}
