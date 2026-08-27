import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = randomUUID();

    // Use prepare/run for SQLite through statement execution
    const stmt = db.prepare(
      "INSERT INTO subscribers (id, email, name, status) VALUES (?, ?, ?, 'active')"
    );
    stmt.run(id, email, name || null);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to our newsletter",
      },
      { status: 201 }
    );
  } catch (error) {
    // Check if it's a duplicate email error
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 409 }
      );
    }

    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
