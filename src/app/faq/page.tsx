"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
  category: string;
};

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/faq")
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setFaqs(data.faqs || []);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setFaqs([]);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#7D1D1D]">Support centre</p>
        <h1 className="mt-2 font-serif text-5xl font-semibold tracking-tight text-[var(--ink)]">FAQs</h1>
      </div>

      <div className="space-y-4">
        {status === "loading" ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl border border-[var(--ink)]/10 bg-white" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="rounded-xl border border-dashed border-[#d9b8b8] bg-[#fff7f7] p-6 text-sm text-[#7a3b3b]">
            We couldn&apos;t load the FAQs right now. Please refresh the page or try again shortly.
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--ink)]/15 bg-white p-6 text-sm text-[var(--ink)]/70">No FAQs available right now.</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="rounded-xl border border-[var(--ink)]/10 bg-white p-4 shadow-[var(--shadow-sm)] md:p-5">
              <button type="button" onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="flex w-full items-center justify-between gap-3 text-left">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)]/60">{faq.category}</div>
                  <div className="font-medium text-[var(--ink)]">{faq.question}</div>
                </div>
                <ChevronDown className={`h-5 w-5 text-[#7D1D1D] transition ${openId === faq.id ? "rotate-180" : ""}`} />
              </button>
              {openId === faq.id ? <p className="mt-4 text-sm leading-7 text-[var(--ink)]/70">{faq.answer}</p> : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
