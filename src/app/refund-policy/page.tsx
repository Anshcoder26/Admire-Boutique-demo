import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, StoreContactDetails } from "@/components/policy-page";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Admire Boutique",
  description: "How to cancel an order, return or exchange an item, and get a refund at Admire Boutique.",
};

export default function RefundPolicyPage() {
  const whatsapp = (
    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
      WhatsApp ({WHATSAPP_DISPLAY})
    </a>
  );

  return (
    <PolicyPage
      title="Cancellation & Refund Policy"
      currentHref="/refund-policy"
      intro={
        <p>
          We want you to love what you buy. If something isn&apos;t right, this policy explains how to cancel an
          order, return or exchange an item, and when you will get your money back.
        </p>
      }
      sections={[
        {
          heading: "Cancelling an order",
          body: (
            <ul>
              <li>You can cancel an order any time before it is shipped. Message us on {whatsapp} with your order number.</li>
              <li>Orders that have already been shipped cannot be cancelled, but you can return them after delivery under the return policy below.</li>
              <li>If you cancel a prepaid order before it ships, you will receive a full refund.</li>
              <li>Online orders that are not paid within 15 minutes are cancelled automatically. Nothing is charged for these.</li>
            </ul>
          ),
        },
        {
          heading: "Returns and exchanges",
          body: (
            <>
              <p>You can request a return or exchange within <strong>7 days of delivery</strong>, provided that:</p>
              <ul>
                <li>The item is unused, unwashed and unaltered.</li>
                <li>All original tags are attached and the item is in its original packaging.</li>
              </ul>
              <p>
                To start a return, message us on {whatsapp} with your order number, the item and the reason. We will
                arrange a pickup where available, or share the return address.
              </p>
            </>
          ),
        },
        {
          heading: "Damaged, defective or wrong items",
          body: (
            <p>
              If you receive a damaged, defective or wrong item, please tell us within 48 hours of delivery and share
              photos of the product and packaging on {whatsapp}. We will replace it or give you a full refund at no
              extra cost, including shipping.
            </p>
          ),
        },
        {
          heading: "Refunds",
          body: (
            <ul>
              <li>Once we receive and check the returned item, we will confirm your refund on WhatsApp or email.</li>
              <li>Approved refunds are processed within <strong>5–7 working days</strong>.</li>
              <li>Prepaid orders are refunded to the original payment method (UPI, card, net banking or wallet). Your bank may take a few more days to show the credit.</li>
              <li>Cash on Delivery orders are refunded by bank transfer or UPI to an account you share with us.</li>
              <li>For change-of-mind returns, the original shipping charge (if any) is not refundable.</li>
            </ul>
          ),
        },
        {
          heading: "Payment debited but order not confirmed",
          body: (
            <p>
              If money was debited but your order was not confirmed, it is applied to your order automatically or
              refunded in full to the original payment method within 5–7 working days. You can check the order status
              under <Link href="/account/orders">My Orders</Link>.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <>
              <p>For cancellations, returns or refund questions, contact us:</p>
              <StoreContactDetails />
            </>
          ),
        },
      ]}
    />
  );
}
