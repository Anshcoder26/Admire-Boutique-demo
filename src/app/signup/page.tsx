"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = (await response.json()) as { success?: boolean; token?: string; error?: string };
    if (!response.ok || !data.success || !data.token) {
      alert(data.error || "Unable to create account");
      setLoading(false);
      return;
    }

    window.localStorage.setItem("admire-user-token", data.token);
    window.dispatchEvent(new Event("admire-auth-updated"));
    window.dispatchEvent(new Event("storage"));
    setLoading(false);
    router.push("/account");
    router.refresh();
  };

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-[32px] border border-[#e7d9cf] bg-[#fffaf6] shadow-[0_22px_60px_rgba(51,32,27,0.08)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(146,98,75,0.12),_transparent_38%),linear-gradient(135deg,_#f8efe7,_#f3e5d8_40%,_#efe0d0)] p-6 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d7c1af] bg-white/80 text-[#4b1f1d]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">New account</p>
                <h1 className="font-serif text-5xl text-[#201614]">Create your account</h1>
              </div>
            </div>
            <p className="max-w-md text-base leading-7 text-[#5a4b45]">
              Save your addresses, track orders, manage deliveries, and enjoy a premium boutique shopping experience.
            </p>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d]">Full name</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e5d1c5] bg-[#f9f2ee] px-4 py-3">
                  <UserRound className="h-4 w-4 text-[#5d2a25]" />
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-transparent text-sm text-[#2d2421] outline-none" placeholder="Your full name" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d]">Email</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e5d1c5] bg-[#f9f2ee] px-4 py-3">
                  <Mail className="h-4 w-4 text-[#5d2a25]" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-transparent text-sm text-[#2d2421] outline-none" placeholder="you@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d]">Phone</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e5d1c5] bg-[#f9f2ee] px-4 py-3">
                  <Phone className="h-4 w-4 text-[#5d2a25]" />
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-transparent text-sm text-[#2d2421] outline-none" placeholder="+91 98765 43210" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d]">Password</label>
                <div className="flex items-center gap-3 rounded-2xl border border-[#e5d1c5] bg-[#f9f2ee] px-4 py-3">
                  <LockKeyhole className="h-4 w-4 text-[#5d2a25]" />
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-transparent text-sm text-[#2d2421] outline-none" placeholder="Create a password" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#4b1f1d] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#4b1f1d]/20 disabled:opacity-70">
                {loading ? "Creating account..." : "Create account"} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[#665a55]">
              Already have an account? <Link href="/login" className="font-semibold text-[#5d2a25]">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
