import { Resend } from "resend";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    // If no Resend API key, log instead (for development)
    if (!process.env.RESEND_API_KEY) {
      console.log("📧 Email (dev mode):", {
        to: options.to,
        subject: options.subject,
      });
      return { success: true, isDev: true };
    }

    // Initialize Resend only when sending
    const resend = new Resend(process.env.RESEND_API_KEY);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@admireboutique.com",
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("❌ Email send failed:", error);
    return { success: false, error };
  }
}

export function generateNewProductEmail(productName: string, productUrl: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4b1f1d 0%, #8a6f5f 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: #fffaf6; padding: 30px; border-radius: 0 0 8px 8px; }
          .product-name { color: #4b1f1d; font-size: 20px; font-weight: bold; margin: 15px 0; }
          .cta-button { display: inline-block; background: #4b1f1d; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; font-weight: 600; }
          .footer { color: #8a6f5f; font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ New Arrival!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We're thrilled to announce a new addition to our premium collection:</p>
            <div class="product-name">${productName}</div>
            <p>This exquisite piece combines traditional craftsmanship with contemporary elegance. Be among the first to own it!</p>
            <a href="${productUrl}" class="cta-button">View Product</a>
            <p>Don't miss out on our latest creations. Check back regularly for more exclusive pieces.</p>
            <p>Warm regards,<br><strong>Admire Boutique</strong></p>
          </div>
          <div class="footer">
            <p>You're receiving this email because you subscribed to our newsletter.</p>
            <p>If you no longer wish to receive these emails, you can <a href="#">unsubscribe here</a>.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
