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

  useEffect(() => {
    fetch("/api/faq")
      .then((res) => res.json())
      .then((data) => setFaqs(data.faqs || []))
      .catch(() => setFaqs([]));
  }, []);

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Support centre</p>
        <h1 className="mt-2 font-serif text-5xl text-[#201614]">FAQs</h1>
      </div>

      <div className="space-y-4">
        {faqs.length === 0 ? (
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
