import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage, StoreContactDetails } from "@/components/policy-page";
import { WHATSAPP_DISPLAY, WHATSAPP_URL } from "@/lib/site-contact";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Admire Boutique",
  description: "Admire Boutique's policy on order cancellations, exchanges for damaged or wrong items, and refunds.",
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
          We want you to love what you buy. This policy explains our cancellation rules, how to get an exchange if
          your item arrives damaged, defective or wrong, and when you will get your money back.
        </p>
      }
      sections={[
        {
          heading: "Cancellations",
          body: (
            <ul>
              <li><strong>Orders cannot be cancelled once they are placed.</strong></li>
              <li>In rare cases we may cancel an order ourselves: a pricing or listing error, an item that is out of stock, an address we cannot deliver to, or suspected fraud. If we cancel a paid order, you receive a full refund.</li>
              <li>Online orders that are not paid within 15 minutes are not placed. Nothing is charged for these.</li>
            </ul>
          ),
        },
        {
          heading: "Exchanges",
          body: (
            <>
              <p>
                We exchange an item only if it arrives <strong>damaged, defective or wrong</strong> (for example, a
                different product, colour or size from what you ordered). We do not accept returns or exchanges for a
                change of mind, preference or fit.
              </p>
              <p>To be eligible for an exchange:</p>
              <ul>
                <li><strong>Record an unboxing video</strong> when the parcel is delivered, starting from the sealed package and showing the product clearly.</li>
                <li>Message us on {whatsapp} <strong>within 24 hours of delivery</strong> with your order number, a description of the issue and the unboxing video.</li>
                <li>Keep the item unused, unwashed and unaltered, with all original tags and packaging.</li>
              </ul>
              <p>
                Complaints without an unboxing video, or made more than 24 hours after delivery, are not eligible.
                Once we approve your request, we will arrange the exchange at no extra cost to you.
              </p>
            </>
          ),
        },
        {
          heading: "Refunds",
          body: (
            <ul>
              <li>If your exchange is approved but a replacement is not available, you receive a <strong>full refund</strong>, including any shipping charge.</li>
              <li>Approved refunds are processed within <strong>5–7 working days</strong>.</li>
              <li>Prepaid orders are refunded to the original payment method (UPI, card, net banking or wallet). Your bank may take a few more days to show the credit.</li>
              <li>Cash on Delivery orders are refunded by bank transfer or UPI to an account you share with us.</li>
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
              <p>For exchanges or refund questions, contact us:</p>
              <StoreContactDetails />
            </>
          ),
        },
      ]}
    />
  );
}
