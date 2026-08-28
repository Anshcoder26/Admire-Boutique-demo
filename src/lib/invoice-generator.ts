import PDFDocument from "pdfkit";
import { Readable } from "stream";

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  orderNumber: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  estimatedDelivery: string;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("ADMIRE BOUTIQUE", 50, 50);
    doc.fontSize(10).font("Helvetica").text("Premium Indian Kurtis & Ethnic Wear", 50, 80);
    doc.fontSize(9).text("Email: support@admireboutique.com", 50, 95);

    // Invoice details
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("INVOICE", 50, 130);

    const detailsX = 350;
    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Order #: ${data.orderNumber}`, detailsX, 130)
      .text(`Date: ${data.date}`, detailsX, 145)
      .text(`Status: ${data.paymentStatus}`, detailsX, 160);

    // Customer details
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .text("BILL TO", 50, 200);

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(data.customerName, 50, 220)
      .text(data.customerEmail, 50, 235)
      .text(data.customerPhone, 50, 250)
      .text(
        `${data.address.line1}, ${data.address.city}, ${data.address.state} ${data.address.pincode}`,
        50,
        265
      );

    // Items table
    const tableTop = 320;
    const itemHeight = 25;
    const colX = { name: 50, qty: 350, price: 420, amount: 500 };

    // Table header
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .rect(50, tableTop, 510, 20)
      .fillAndStroke("#f0f0f0", "#ccc");

    doc
      .fillColor("black")
      .text("Product", colX.name, tableTop + 5)
      .text("Qty", colX.qty, tableTop + 5)
      .text("Price", colX.price, tableTop + 5)
      .text("Amount", colX.amount, tableTop + 5);

    // Table rows
    let currentY = tableTop + 30;
    doc.font("Helvetica").fontSize(9);

    data.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      doc
        .text(item.name, colX.name, currentY, { width: 280, height: itemHeight })
        .text(`${item.quantity}`, colX.qty, currentY, { align: "center" })
        .text(`₹${item.price.toLocaleString("en-IN")}`, colX.price, currentY, { align: "right" })
        .text(`₹${itemTotal.toLocaleString("en-IN")}`, colX.amount, currentY, { align: "right" });
      currentY += itemHeight + 10;
    });

    // Totals section
    const totalsY = currentY + 20;
    doc
      .moveTo(colX.price, totalsY - 10)
      .lineTo(510, totalsY - 10)
      .stroke();

    doc
      .fontSize(10)
      .font("Helvetica")
      .text("Subtotal:", colX.price, totalsY)
      .text(`₹${data.subtotal.toLocaleString("en-IN")}`, colX.amount, totalsY, { align: "right" })
      .text("Shipping:", colX.price, totalsY + 20)
      .text(
        data.shipping === 0 ? "FREE" : `₹${data.shipping.toLocaleString("en-IN")}`,
        colX.amount,
        totalsY + 20,
        { align: "right" }
      );

    if (data.discount > 0) {
      doc
        .text("Discount:", colX.price, totalsY + 40)
        .text(`-₹${data.discount.toLocaleString("en-IN")}`, colX.amount, totalsY + 40, {
          align: "right",
        });
    }

    // Total amount
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("TOTAL:", colX.price, totalsY + 60)
      .text(`₹${data.total.toLocaleString("en-IN")}`, colX.amount, totalsY + 60, { align: "right" });

    // Payment and delivery info
    const infoY = totalsY + 100;
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("PAYMENT & DELIVERY", 50, infoY);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Payment Method: ${data.paymentMethod}`, 50, infoY + 20)
      .text(`Estimated Delivery: ${data.estimatedDelivery}`, 50, infoY + 35);

    // Footer
    const footerY = 750;
    doc
      .fontSize(8)
      .fillColor("#999")
      .text(
        "Thank you for your purchase! For support, email support@admireboutique.com",
        50,
        footerY,
        {
          align: "center",
          width: 510,
        }
      )
      .text(`Generated on ${new Date().toLocaleString("en-IN")}`, 50, footerY + 15, {
        align: "center",
        width: 510,
      });

    doc.end();
  });
}

export async function generateInvoiceStream(data: InvoiceData): Promise<Readable> {
  const doc = new PDFDocument({ margin: 40, size: "A4" });

  // Header
  doc.fontSize(24).font("Helvetica-Bold").text("ADMIRE BOUTIQUE", 50, 50);
  doc.fontSize(10).font("Helvetica").text("Premium Indian Kurtis & Ethnic Wear", 50, 80);
  doc.fontSize(9).text("Email: support@admireboutique.com", 50, 95);

  // Invoice details
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("INVOICE", 50, 130);

  const detailsX = 350;
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Order #: ${data.orderNumber}`, detailsX, 130)
    .text(`Date: ${data.date}`, detailsX, 145)
    .text(`Status: ${data.paymentStatus}`, detailsX, 160);

  // Customer details
  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .text("BILL TO", 50, 200);

  doc
    .fontSize(10)
    .font("Helvetica")
    .text(data.customerName, 50, 220)
    .text(data.customerEmail, 50, 235)
    .text(data.customerPhone, 50, 250)
    .text(
      `${data.address.line1}, ${data.address.city}, ${data.address.state} ${data.address.pincode}`,
      50,
      265
    );

  // Items table
  const tableTop = 320;
  const itemHeight = 25;
  const colX = { name: 50, qty: 350, price: 420, amount: 500 };

  // Table header
  doc
    .fontSize(10)
    .font("Helvetica-Bold")
    .rect(50, tableTop, 510, 20)
    .fillAndStroke("#f0f0f0", "#ccc");

  doc
    .fillColor("black")
    .text("Product", colX.name, tableTop + 5)
    .text("Qty", colX.qty, tableTop + 5)
    .text("Price", colX.price, tableTop + 5)
    .text("Amount", colX.amount, tableTop + 5);

  // Table rows
  let currentY = tableTop + 30;
  doc.font("Helvetica").fontSize(9);

  data.items.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    doc
      .text(item.name, colX.name, currentY, { width: 280, height: itemHeight })
      .text(`${item.quantity}`, colX.qty, currentY, { align: "center" })
      .text(`₹${item.price.toLocaleString("en-IN")}`, colX.price, currentY, { align: "right" })
      .text(`₹${itemTotal.toLocaleString("en-IN")}`, colX.amount, currentY, { align: "right" });
    currentY += itemHeight + 10;
  });

  // Totals section
  const totalsY = currentY + 20;
  doc
    .moveTo(colX.price, totalsY - 10)
    .lineTo(510, totalsY - 10)
    .stroke();

  doc
    .fontSize(10)
    .font("Helvetica")
    .text("Subtotal:", colX.price, totalsY)
    .text(`₹${data.subtotal.toLocaleString("en-IN")}`, colX.amount, totalsY, { align: "right" })
    .text("Shipping:", colX.price, totalsY + 20)
    .text(
      data.shipping === 0 ? "FREE" : `₹${data.shipping.toLocaleString("en-IN")}`,
      colX.amount,
      totalsY + 20,
      { align: "right" }
    );

  if (data.discount > 0) {
    doc
      .text("Discount:", colX.price, totalsY + 40)
      .text(`-₹${data.discount.toLocaleString("en-IN")}`, colX.amount, totalsY + 40, {
        align: "right",
      });
  }

  // Total amount
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("TOTAL:", colX.price, totalsY + 60)
    .text(`₹${data.total.toLocaleString("en-IN")}`, colX.amount, totalsY + 60, { align: "right" });

  // Payment and delivery info
  const infoY = totalsY + 100;
  doc
    .fontSize(9)
    .font("Helvetica-Bold")
    .text("PAYMENT & DELIVERY", 50, infoY);

  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`Payment Method: ${data.paymentMethod}`, 50, infoY + 20)
    .text(`Estimated Delivery: ${data.estimatedDelivery}`, 50, infoY + 35);

  // Footer
  const footerY = 750;
  doc
    .fontSize(8)
    .fillColor("#999")
    .text(
      "Thank you for your purchase! For support, email support@admireboutique.com",
      50,
      footerY,
      {
        align: "center",
        width: 510,
      }
    )
    .text(`Generated on ${new Date().toLocaleString("en-IN")}`, 50, footerY + 15, {
      align: "center",
      width: 510,
    });

  doc.end();
  return doc;
}
