import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, StoreContactDetails } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Admire Boutique",
  description: "Shipping charges, delivery times and order tracking at Admire Boutique.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage
      title="Shipping & Delivery Policy"
      currentHref="/shipping-policy"
      sections={[
        {
          heading: "Where we deliver",
          body: <p>We currently deliver to addresses within India only.</p>,
        },
        {
          heading: "Shipping charges",
          body: (
            <ul>
              <li><strong>Free shipping</strong> on orders above ₹2,499.</li>
              <li>A flat shipping charge of <strong>₹149</strong> applies to orders of ₹2,499 or less.</li>
              <li>The shipping charge is shown at checkout before you pay.</li>
            </ul>
          ),
        },
        {
          heading: "Processing and delivery time",
          body: (
            <ul>
              <li>Orders are packed and handed to our courier partner within 1–2 business days of confirmation.</li>
              <li>Most orders are delivered within <strong>4–7 business days</strong> of dispatch. Metro cities are often faster; remote areas may take longer.</li>
              <li>All orders are paid online and are processed after the payment is confirmed.</li>
              <li>Delivery times are estimates and may be affected by courier delays, weather, festivals or other events beyond our control.</li>
            </ul>
          ),
        },
        {
          heading: "Order tracking",
          body: (
            <p>
              Once your order ships, the courier partner and tracking ID are shown in{" "}
              <Link href="/account/orders">My Orders</Link>, and we keep you updated by email and WhatsApp.
            </p>
          ),
        },
        {
          heading: "Delivery issues",
          body: (
            <ul>
              <li>Please check that your address and phone number are correct at checkout. We are not responsible for delays caused by incorrect details.</li>
              <li>If the courier cannot deliver after repeated attempts, the order may be returned to us. We will contact you to arrange re-delivery (re-shipping charges may apply) or a refund for prepaid orders.</li>
              <li>If the package looks tampered with or damaged at delivery, please refuse it or report it to us within 48 hours with photos.</li>
            </ul>
          ),
        },
        {
          heading: "Contact",
          body: (
            <>
              <p>For any shipping questions, contact us:</p>
              <StoreContactDetails />
            </>
          ),
        },
      ]}
    />
  );
}
