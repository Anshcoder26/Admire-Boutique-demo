import Link from "next/link";
import { Headphones, MessageCircle, ShieldCheck, Truck } from "lucide-react";

const supportCards = [
  { icon: Truck, title: "Shipping support", text: "Track shipments, choose delivery preferences and confirm updates on every order." },
  { icon: ShieldCheck, title: "Hassle-free returns", text: "Quick returns for damaged, incorrect or unused products within the eligible return window." },
  { icon: Headphones, title: "Customer care", text: "Talk to our team for styling advice, order concerns or product information." },
];

export default function SupportPage() {
  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="mb-6 text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">We’re here</p>
        <h1 className="mt-2 font-serif text-5xl text-[#201614]">Support and care</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {supportCards.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-[28px] border border-[#eadcce] bg-white p-5 shadow-[0_16px_28px_rgba(84,58,45,0.03)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e7db] text-[#4b1f1d]">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mb-2 font-semibold text-2xl text-[#201614]">{title}</h2>
            <p className="text-sm leading-7 text-[#584942]">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[30px] border border-[#eadcce] bg-[#fffaf6] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">Connect</p>
            <h2 className="mt-1 font-serif text-4xl text-[#201614]">Need help right away?</h2>
          </div>
          <div className="flex gap-3">
            <Link href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
            <Link href="mailto:hello@admireboutique.in" className="inline-flex items-center gap-2 rounded-full border border-[#d9c3b8] bg-white px-4 py-2.5 text-sm font-medium text-[#402320]">
              Email us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
