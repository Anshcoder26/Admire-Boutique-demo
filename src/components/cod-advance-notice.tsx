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
    <div className="rounded-lg border border-[#7D1D1D]/25 bg-white p-5 text-left text-sm text-[var(--ink)]/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7D1D1D]">UPI payment details</p>
      <p className="mt-3 text-xs text-[var(--ink)]/60">UPI ID</p>
      <p className="break-all text-2xl font-bold text-[var(--ink)]">
        {payment?.upiId || "We will share this with you on WhatsApp shortly"}
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--ink)]/60">Amount</dt>
          <dd className="text-lg font-semibold text-[var(--ink)]">{inr(advance)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--ink)]/60">Order ID</dt>
          <dd className="break-all text-lg font-semibold text-[var(--ink)]">{orderNumber}</dd>
        </div>
      </dl>
      {payment ? (
        <p className="mt-4 border-t border-[var(--ink)]/10 pt-3">
          After paying, share a screenshot on WhatsApp at <strong className="text-[var(--ink)]">{payment.screenshotWhatsapp}</strong>. For questions, contact{" "}
          <strong className="text-[var(--ink)]">{payment.supportPhone}</strong>.
        </p>
      ) : null}
      <p className="mt-2">
        This is adjusted against your total of {inr(total)}. You pay the remaining {inr(codBalanceDue(total, advance))} on delivery.
      </p>
    </div>
  );
}
