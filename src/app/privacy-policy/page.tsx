import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, StoreContactDetails } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Admire Boutique",
  description: "How Admire Boutique collects, uses and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      title="Privacy Policy"
      currentHref="/privacy-policy"
      intro={
        <p>
          This Privacy Policy explains how Admire Boutique (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) collects, uses,
          shares and protects your personal information when you visit our website or buy from us. By using this
          website you agree to this policy. We follow applicable Indian law, including the Information Technology
          Act, 2000 and the Digital Personal Data Protection Act, 2023.
        </p>
      }
      sections={[
        {
          heading: "Information we collect",
          body: (
            <ul>
              <li>Account details: your name, email address, phone number and password (stored only in encrypted, hashed form).</li>
              <li>Order details: delivery addresses, items purchased, order amounts and order history.</li>
              <li>Payment details: payments are processed by Razorpay. We receive the payment status and reference IDs; we never see or store your card, UPI PIN or net-banking credentials.</li>
              <li>Messages you send us on WhatsApp, Instagram, Facebook or email.</li>
              <li>Technical data such as browser type and pages visited, collected through cookies and similar technologies.</li>
            </ul>
          ),
        },
        {
          heading: "How we use your information",
          body: (
            <ul>
              <li>To create and manage your account and process, ship and deliver your orders.</li>
              <li>To send order confirmations, payment receipts, invoices and delivery updates by email and WhatsApp.</li>
              <li>To handle returns, refunds and customer support requests.</li>
              <li>To send newsletters or offers, only if you have subscribed. You can unsubscribe at any time.</li>
              <li>To prevent fraud, keep the website secure and comply with legal and tax obligations.</li>
            </ul>
          ),
        },
        {
          heading: "Sharing your information",
          body: (
            <>
              <p>We do not sell or rent your personal information. We share it only with service providers who help us run the store, and only as needed:</p>
              <ul>
                <li>Razorpay, to process online payments.</li>
                <li>Courier and logistics partners, to deliver your orders.</li>
                <li>Email and WhatsApp (Meta) messaging providers, to send order updates.</li>
                <li>Website hosting and database providers.</li>
              </ul>
              <p>We may also disclose information when required by law or to protect our rights, customers or the public.</p>
            </>
          ),
        },
        {
          heading: "Cookies",
          body: (
            <p>
              We use essential cookies and your browser&apos;s local storage to keep you signed in and to remember your
              cart and wishlist. These are required for the website to work. You can clear them from your browser
              settings, but some features may stop working.
            </p>
          ),
        },
        {
          heading: "Data security and retention",
          body: (
            <p>
              We use HTTPS encryption, hashed passwords and access controls to protect your data. We keep your
              information for as long as your account is active and as long as needed for orders, accounting and
              legal requirements, after which it is deleted or anonymised.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You can view and update your profile and addresses from your <Link href="/account">account</Link>. You
              may also ask us to access, correct or delete your personal data, or withdraw consent for marketing
              messages, by contacting us using the details below. We will respond within a reasonable time and as
              required by law.
            </p>
          ),
        },
        {
          heading: "Children",
          body: <p>Our website is not intended for children under 18. We do not knowingly collect data from children.</p>,
        },
        {
          heading: "Changes to this policy",
          body: <p>We may update this policy from time to time. The latest version will always be available on this page.</p>,
        },
        {
          heading: "Grievance officer and contact",
          body: (
            <>
              <p>For any privacy questions or complaints, please contact our grievance officer:</p>
              <StoreContactDetails />
            </>
          ),
        },
      ]}
    />
  );
}
