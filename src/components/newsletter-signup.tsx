"use client";

import { useState } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";
import { FabricBooti } from "@/components/motifs/fabric-booti";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to subscribe");
        return;
      }

      setStatus("success");
      setMessage("Welcome! Check your email for updates.");
      setEmail("");
      setName("");

      // Reset after 5 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
      console.error("Newsletter signup error:", error);
    }
  };

  return (
    <div className="relative isolate overflow-hidden rounded-[20px] border border-[#eadcd3] bg-gradient-to-br from-[#fffaf6] to-[#f5ede7] p-8 shadow-[0_8px_24px_rgba(84,58,45,0.08)]">
      <FabricBooti opacity={0.05} size={130} motif="lotus" className="-z-10" />
      <div className="mb-4 flex items-center gap-2">
        <Mail className="h-5 w-5 text-[#7D1D1D]" />
        <h3 className="font-serif text-xl font-semibold text-[#201614]">
          Join Our Newsletter
        </h3>
      </div>
      <p className="mb-6 text-sm text-[#584942]">
        Be the first to know about new arrivals, exclusive offers, and insider tips.
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-green-50 p-4 text-green-700">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      ) : status === "error" ? (
        <div className="flex items-center gap-2 rounded-[10px] bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[8px] border border-[#d7c1af] bg-white px-4 py-2.5 text-sm text-[#201614] placeholder-[#8a6f5f] outline-none transition-all focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/20"
          />
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-[8px] border border-[#d7c1af] bg-white px-4 py-2.5 text-sm text-[#201614] placeholder-[#8a6f5f] outline-none transition-all focus:border-[#7D1D1D] focus:ring-2 focus:ring-[#7D1D1D]/20"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="rounded-[8px] bg-[#7D1D1D] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#6a1818] disabled:opacity-60"
            >
              {status === "loading" ? "..." : "Subscribe"}
            </button>
          </div>
          <p className="text-xs text-[#8a6f5f]">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </form>
      )}
    </div>
  );
}
