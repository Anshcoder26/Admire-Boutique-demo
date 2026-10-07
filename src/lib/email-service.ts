import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface EmailAttachment {
  filename: string;
  content: Buffer;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  attachments?: EmailAttachment[];
}

/** Sender address; must be on a domain verified with your email provider. */
export function getFromAddress(): string {
  return process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || "noreply@admireboutique.com";
}

export function getAppUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
}

interface MailTransport {
  sendMail: (options: EmailOptions) => Promise<unknown>;
}

// Configure email service based on environment
let transporter: MailTransport | null = null;

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
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Wrap Resend client for compatibility
    transporter = {
      sendMail: async (options: EmailOptions) => {
        return await resend.emails.send({
          from: options.from || getFromAddress(),
          to: options.to,
          subject: options.subject,
          html: options.html,
          attachments: options.attachments,
        });
      },
    };
  } else {
    console.warn("[EMAIL] No email service configured. Set SMTP_* or RESEND_API_KEY env vars.");
  }

  return transporter;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST || process.env.RESEND_API_KEY);
}

/** Throws on failure so callers can report it. */
export async function sendEmailOrThrow(options: EmailOptions): Promise<void> {
  const transport = initializeTransporter();
  if (!transport) {
    throw new Error("No email transport configured");
  }

  const result = (await transport.sendMail({
    ...options,
    from: options.from || getFromAddress(),
  })) as { error?: { message?: string } | null } | undefined;

  // Resend reports API errors in the result instead of throwing.
  if (result && result.error) {
    throw new Error(result.error.message || "Email provider rejected the message");
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sendEmailOrThrow(options);
    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[EMAIL] Error sending email:", error);
    return false;
  }
}
