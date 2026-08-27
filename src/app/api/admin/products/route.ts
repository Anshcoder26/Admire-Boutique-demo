import { NextRequest, NextResponse } from "next/server";
import { getDb, validateSessionToken } from "@/lib/db";
import { sendEmail, generateNewProductEmail } from "@/lib/mailer";
import { randomUUID } from "crypto";

// Verify admin auth
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : "";

  if (!token) {
    return null;
  }

  try {
    const user = await validateSessionToken(token);
    if (!user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await verifyAdminAuth(request);
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized - Admin token required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      category,
      price,
      stock,
      fabric,
      stitching,
      description,
      images,
      colors,
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
    
    // Generate slug from product name
    const slug = `${name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")}-${Date.now()}`;

    // Insert product with all required fields
    const stmt = db.prepare(`
      INSERT INTO products (
        id, slug, name, category, price, originalPrice, discount, rating, reviews, stock, 
        badge, fabric, description, images, colors, sizes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    stmt.run(
      productId,
      slug,
      name,
      category || "Other",
      Number(price),
      Number(price) * 1.2, // Default original price as 20% higher
      0, // No discount by default
      4.5, // Default rating
      0, // No reviews yet
      Number(stock) || 0,
      stitching || "Stitched", // Use badge field for stitching type
      fabric || "Cotton",
      description || `${name} - Premium piece from Admire Boutique`,
      images ? JSON.stringify(images) : JSON.stringify([]),
      colors ? JSON.stringify(colors) : JSON.stringify([]),
      JSON.stringify([]) // Sizes (can be added later)
    );

    // Send to all customers (registered users) + newsletter subscribers
    if (notifySubscribers) {
      try {
        // Get all customers
        const customersStmt = db.prepare(
          "SELECT email, name FROM customers"
        );
        const customers = customersStmt.all() as Array<{
          email: string;
          name?: string;
        }>;

        // Get all active newsletter subscribers
        const subscribersStmt = db.prepare(
          "SELECT email, name FROM subscribers WHERE status = 'active'"
        );
        const subscribers = subscribersStmt.all() as Array<{
          email: string;
          name?: string;
        }>;

        // Combine and deduplicate by email
        const emailMap = new Map<string, { email: string; name?: string }>();
        customers.forEach((c) => emailMap.set(c.email.toLowerCase(), c));
        subscribers.forEach((s) => emailMap.set(s.email.toLowerCase(), s));

        const allRecipients = Array.from(emailMap.values());

        if (allRecipients.length > 0) {
          const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${slug}`;
          const emailHtml = generateNewProductEmail(name, productUrl);

          // Send emails to all customers and subscribers
          await sendEmail({
            to: allRecipients.map((r) => r.email),
            subject: `✨ New Arrival: ${name} - Exclusive from Admire Boutique`,
            html: emailHtml,
          });

          console.log(
            `📧 Sent new product notification to ${allRecipients.length} recipients`
          );
        }
      } catch (emailError) {
        console.error("Failed to send notifications:", emailError);
        // Don't fail the product creation if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product created and published successfully",
        product: {
          id: productId,
          slug,
          name,
          category: category || "Other",
          price: Number(price),
          stock: Number(stock) || 0,
          description,
          images,
          colors,
          fabric,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product creation error:", error);
    return NextResponse.json(
      { error: `Failed to create product: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
