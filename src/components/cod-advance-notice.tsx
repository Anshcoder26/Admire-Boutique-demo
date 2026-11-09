import { codBalanceDue, type CodPaymentDetails } from "@/lib/cod";

const inr = (value: number) => `₹${Number(value).toLocaleString("en-IN")}`;

/** How to pay the COD advance, shown to the customer until it is verified. */
export function CodAdvanceNotice({
  orderNumber,
  total,
  advance,
  payment,
}: {
  orderNumber: string;
  total: number;
  advance: number;
  payment?: CodPaymentDetails;
}) {
  return (
    <div className="rounded-2xl border border-[#f0d9b5] bg-[#fff8ee] p-5 text-left text-sm text-[#584942]">
      <p className="font-semibold text-[#241915]">Pay {inr(advance)} by UPI to confirm this order</p>
      <p className="mt-1">
        This is adjusted against your total of {inr(total)}. You pay the remaining {inr(codBalanceDue(total, advance))} on delivery.
      </p>
      <dl className="mt-3 space-y-1">
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-[#241915]">UPI ID:</dt>
          <dd>{payment?.upiId || "We will share this with you on WhatsApp shortly"}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-[#241915]">Amount:</dt>
          <dd>{inr(advance)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="font-medium text-[#241915]">Order ID:</dt>
          <dd>{orderNumber}</dd>
        </div>
      </dl>
      {payment ? (
        <p className="mt-3">
          After paying, share a screenshot on WhatsApp at <strong>{payment.screenshotWhatsapp}</strong> so we can verify it. For questions, contact{" "}
          <strong>{payment.supportPhone}</strong>.
        </p>
      ) : null}
    </div>
  );
}
