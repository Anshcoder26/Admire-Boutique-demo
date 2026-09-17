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
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Support centre</p>
        <h1 className="mt-2 font-serif text-5xl text-[#201614]">FAQs</h1>
      </div>

      <div className="space-y-4">
        {status === "loading" ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-[26px] border border-[#eadcce] bg-[#fffaf7]" />
            ))}
          </div>
        ) : status === "error" ? (
          <div className="rounded-[24px] border border-dashed border-[#d9b8b8] bg-[#fff7f7] p-6 text-sm text-[#7a3b3b]">
            We couldn&apos;t load the FAQs right now. Please refresh the page or try again shortly.
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-[#d9c3b8] bg-[#fffaf7] p-6 text-sm text-[#5a4b45]">No FAQs available right now.</div>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="rounded-[26px] border border-[#eadcce] bg-white p-4 shadow-[0_16px_28px_rgba(84,58,45,0.03)] md:p-5">
              <button type="button" onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="flex w-full items-center justify-between gap-3 text-left">
                <div>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#7d645a]">{faq.category}</div>
                  <div className="font-medium text-[#201614]">{faq.question}</div>
                </div>
                <ChevronDown className={`h-5 w-5 text-[#5d2a25] transition ${openId === faq.id ? "rotate-180" : ""}`} />
              </button>
              {openId === faq.id ? <p className="mt-4 text-sm leading-7 text-[#584942]">{faq.answer}</p> : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
