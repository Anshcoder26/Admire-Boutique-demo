import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendEmail, generateNewProductEmail } from "@/lib/mailer";
import { randomUUID } from "crypto";

// Verify admin auth (basic check)
async function verifyAdminAuth(request: NextRequest) {
  const authCookie = request.cookies.get("admin_auth");
  const adminToken = request.headers.get("x-admin-token");

  if (!authCookie && !adminToken) {
    return false;
  }

  // TODO: Implement proper admin session validation
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAdmin = await verifyAdminAuth(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      price,
      discountPrice,
      description,
      image,
      images,
      material,
      care,
      sizes,
      colors,
      stock,
      notifySubscribers = true,
    } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: "Product name and price are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    const productId = randomUUID();

    // Insert product
    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, category, price, discount_price, description, 
        image, images, material, care, sizes, colors, stock, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      productId,
      name,
      category || "Other",
      price,
      discountPrice || null,
      description || null,
      image || null,
      images ? JSON.stringify(images) : null,
      material || null,
      care || null,
      sizes ? JSON.stringify(sizes) : null,
      colors ? JSON.stringify(colors) : null,
      stock || 0
    );

    // Get all active subscribers
    if (notifySubscribers) {
      try {
        const subscribersStmt = db.prepare(
          "SELECT email, name FROM subscribers WHERE status = 'active'"
        );
        const subscribers = subscribersStmt.all() as Array<{
          email: string;
          name?: string;
        }>;

        if (subscribers.length > 0) {
          const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${productId}`;
          const emailHtml = generateNewProductEmail(name, productUrl);

          // Send emails to all subscribers
          await sendEmail({
            to: subscribers.map((s) => s.email),
            subject: `✨ New Arrival: ${name} - Exclusive from Admire Boutique`,
            html: emailHtml,
          });

          console.log(`📧 Sent new product notification to ${subscribers.length} subscribers`);
        }
      } catch (emailError) {
        console.error("Failed to send subscriber notifications:", emailError);
        // Don't fail the product creation if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        productId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
