import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Configure email service based on environment
let transporter: nodemailer.Transporter | null = null;

function initializeTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Use SMTP configuration
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.RESEND_API_KEY) {
    // Use Resend API (better alternative for India)
    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Wrap Resend client for compatibility
    transporter = {
      sendMail: async (options: EmailOptions) => {
        return await resend.emails.send({
          from: options.from || "noreply@admireboutique.com",
          to: options.to,
          subject: options.subject,
          html: options.html,
        });
      },
    } as any;
  } else {
    console.warn("[EMAIL] No email service configured. Set SMTP_* or RESEND_API_KEY env vars.");
  }

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transport = initializeTransporter();
    if (!transport) {
      console.warn("[EMAIL] Skipping email send - no transport configured");
      return false;
    }

    await transport.sendMail({
      ...options,
      from: options.from || process.env.SMTP_FROM || "noreply@admireboutique.com",
    });

    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email:", error);
    return false;
  }
}

export async function sendOrderConfirmation(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  orderTotal: number,
  orderItems: Array<{ name: string; quantity: number; price: number }>
): Promise<boolean> {
  const itemsHtml = orderItems
    .map(
      (item) =>
        `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">×${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
    </tr>`
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7D1D1D 0%, #a81566 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 5px 0 0 0; font-size: 14px; }
        .content { background: #f9f9f9; padding: 30px; border: 1px solid #eee; border-radius: 0 0 8px 8px; }
        .order-number { background: white; padding: 15px; border-left: 4px solid #7D1D1D; margin-bottom: 20px; }
        .order-number p { margin: 0; }
        .order-number .label { font-size: 12px; color: #888; text-transform: uppercase; }
        .order-number .number { font-size: 20px; font-weight: bold; color: #7D1D1D; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .button { display: inline-block; background: #7D1D1D; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed! 🎉</h1>
          <p>Thank you for shopping with Admire Boutique</p>
        </div>
        <div class="content">
          <p>Hi ${customerName},</p>
          <p>We're delighted to confirm that your order has been received and is being prepared for shipment.</p>
          
          <div class="order-number">
            <p class="label">Order Number</p>
            <p class="number">${orderNumber}</p>
          </div>

          <h3 style="margin-top: 25px; margin-bottom: 10px; color: #7D1D1D;">Order Items</h3>
          <table>
            <thead>
              <tr style="background: #f0f0f0;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #7D1D1D;">
              <span>Total Amount</span>
              <span>₹${orderTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <p style="margin-top: 25px; line-height: 1.6;">
            Your order will be shipped within 1-2 business days. We'll send you a tracking number once your package is on the way.
            <br><br>
            <strong>Estimated Delivery:</strong> 4-7 business days
          </p>

          <a href="${process.env.APP_URL || "http://localhost:3000"}/orders" class="button">Track Your Order</a>

          <div class="footer">
            <p>If you have any questions, please reach out to us at support@admireboutique.com</p>
            <p>&copy; ${new Date().getFullYear()} Admire Boutique. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `Order Confirmed - ${orderNumber}`,
    html,
  });
}

export async function sendAdminNotification(
  orderNumber: string,
  customerName: string,
  customerEmail: string,
  orderTotal: number,
  paymentMethod: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@admireboutique.com";

  const html = `
    <h2>New Order Received</h2>
    <p><strong>Order Number:</strong> ${orderNumber}</p>
    <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
    <p><strong>Amount:</strong> ₹${orderTotal.toLocaleString("en-IN")}</p>
    <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    <p><a href="${process.env.APP_URL || "http://localhost:3000"}/admin">View in Admin Dashboard</a></p>
  `;

  return sendEmail({
    to: adminEmail,
    subject: `New Order: ${orderNumber}`,
    html,
  });
}
