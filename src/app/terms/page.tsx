import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, StoreContactDetails } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms & Conditions | Admire Boutique",
  description: "Terms and conditions for using the Admire Boutique website and buying from us.",
};

export default function TermsPage() {
  return (
    <PolicyPage
      title="Terms & Conditions"
      currentHref="/terms"
      intro={
        <p>
          These Terms &amp; Conditions apply to your use of this website and to every purchase from Admire Boutique,
          167, near S. S. P office, Avas Vikas, Civil Lines, Moradabad, Uttar Pradesh 244001. By using the website or
          placing an order, you agree to these terms.
        </p>
      }
      sections={[
        {
          heading: "Eligibility and accounts",
          body: (
            <p>
              You must be at least 18 years old, or use the website under the supervision of a parent or guardian.
              You are responsible for keeping your account password confidential and for all activity under your
              account. Please give accurate name, phone and address details so we can deliver your order.
            </p>
          ),
        },
        {
          heading: "Products and pricing",
          body: (
            <ul>
              <li>All prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
              <li>We try to show product colours and details accurately, but actual colours may vary slightly due to screen settings and handcrafted finishes.</li>
              <li>Prices and availability may change without notice. The price shown at checkout is the price you pay.</li>
              <li>If an item is listed at an incorrect price because of an error, we may cancel the order and refund any amount paid.</li>
            </ul>
          ),
        },
        {
          heading: "Orders",
          body: (
            <p>
              An order is confirmed when you receive an order confirmation. We may refuse or cancel an order if the
              item is out of stock, if there is a pricing or listing error, if we cannot deliver to your address, or
              if we suspect fraud. If we cancel a paid order, you will receive a full refund.
            </p>
          ),
        },
        {
          heading: "Payments",
          body: (
            <ul>
              <li>We accept online payments only (UPI, debit/credit cards, net banking and wallets), processed securely by Razorpay.</li>
              <li>Online payments are processed securely by Razorpay. We do not store your card or bank details.</li>
              <li>An online order must be paid within 15 minutes of placing it. Unpaid orders are cancelled automatically and the items released.</li>
              <li>If your account is debited but the order is not confirmed, the amount is either applied to your order or refunded automatically.</li>
            </ul>
          ),
        },
        {
          heading: "Shipping, cancellations and returns",
          body: (
            <p>
              Delivery is covered by our <Link href="/shipping-policy">Shipping &amp; Delivery Policy</Link>.
              Cancellations, returns, exchanges and refunds are covered by our{" "}
              <Link href="/refund-policy">Cancellation &amp; Refund Policy</Link>.
            </p>
          ),
        },
        {
          heading: "Intellectual property",
          body: (
            <p>
              All content on this website, including product photos, designs, text and logos, belongs to Admire
              Boutique and may not be copied or used without our written permission.
            </p>
          ),
        },
        {
          heading: "Acceptable use",
          body: (
            <p>
              You agree not to misuse the website, including attempting to gain unauthorised access, interfering
              with its operation, placing fraudulent orders or posting unlawful content.
            </p>
          ),
        },
        {
          heading: "Limitation of liability",
          body: (
            <p>
              To the extent permitted by law, our liability for any claim related to a product or order is limited
              to the amount you paid for that order. We are not liable for indirect or consequential losses, or for
              delays caused by events beyond our reasonable control such as courier disruptions, natural disasters
              or strikes.
            </p>
          ),
        },
        {
          heading: "Privacy",
          body: (
            <p>
              Your use of the website is also governed by our <Link href="/privacy-policy">Privacy Policy</Link>.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of India. Any disputes are subject to the exclusive jurisdiction of
              the courts at Moradabad, Uttar Pradesh.
            </p>
          ),
        },
        {
          heading: "Changes and contact",
          body: (
            <>
              <p>We may update these terms from time to time; the version on this page applies. For any questions, contact us:</p>
              <StoreContactDetails />
            </>
          ),
        },
      ]}
    />
  );
}
