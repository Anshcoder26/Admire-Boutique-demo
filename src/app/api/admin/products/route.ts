import { NextRequest, NextResponse } from "next/server";
import { createProduct, getNotificationRecipients } from "@/lib/db";
import { authenticateAdmin } from "@/lib/admin-auth";
import { sendEmail, generateNewProductEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const admin = await authenticateAdmin(request);
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

    const product = await createProduct({
      name,
      category: category || "Other",
      price: Number(price),
      stock: Number(stock) || 0,
      fabric: fabric || "Cotton",
      description: description || `${name} - Premium piece from Admire Boutique`,
      images: Array.isArray(images) && images.length > 0 ? images : undefined,
      colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
      stitchType: stitching === "Unstitched" ? "Unstitched" : "Stitched",
    });

    // Send to all customers (registered users) + newsletter subscribers
    if (notifySubscribers) {
      try {
        const allRecipients = await getNotificationRecipients();

        if (allRecipients.length > 0) {
          const productUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/products/${product.slug}`;
          const emailHtml = generateNewProductEmail(name, productUrl);

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
          id: product.id,
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          description: product.description,
          images: product.images,
          colors: product.colors,
          fabric: product.fabric,
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
