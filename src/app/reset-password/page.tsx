"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Lock, CheckCircle, Loader } from "lucide-react";
import { Suspense, useCallback, useState } from "react";

interface ResetResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);

      if (!token) {
        setError("This reset link is invalid. Please request a new one.");
        return;
      }
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        });
        const data = (await response.json()) as ResetResponse;

        if (!response.ok || !data.success) {
          setError(data.error || "Unable to reset password. Please try again.");
          setLoading(false);
          return;
        }

        setDone(true);
        setTimeout(() => router.push("/login"), 2500);
      } catch (err) {
        console.error("[RESET-PASSWORD] Request failed:", err);
        setError("Connection error. Please check your internet and try again.");
        setLoading(false);
      }
    },
    [token, password, confirm, router]
  );

  return (
    <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-[32px] border border-[#7D1D1D]/20 bg-[#fffaf6] shadow-[0_22px_60px_rgba(216,30,143,0.08)]">
        <div className="p-6 md:p-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[#7D1D1D] hover:text-[#a81566] transition mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {done ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-14 w-14 text-green-600" />
              <h1 className="mt-4 font-serif text-3xl text-[#201614]">Password reset</h1>
              <p className="mt-2 text-base text-[#5a4b45]">
                Your password has been updated. Redirecting you to login…
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex rounded-full bg-[#7D1D1D] px-5 py-3 text-sm font-bold text-white"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-4xl md:text-5xl text-[#201614] mb-2">
                  Set a new password
                </h1>
                <p className="text-base text-[#5a4b45]">
                  Choose a new password for your account. Make it at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div className="rounded-[16px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-[#ff6b6b]">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                    New password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-[#7D1D1D]/20 bg-[#fff5f0] px-4 py-3 transition-all hover:border-[#7D1D1D]/40">
                    <Lock className="h-4 w-4 text-[#7D1D1D]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                      placeholder="At least 8 characters"
                      disabled={loading}
                      autoComplete="new-password"
                      aria-label="New password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                    Confirm password
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-[#7D1D1D]/20 bg-[#fff5f0] px-4 py-3 transition-all hover:border-[#7D1D1D]/40">
                    <Lock className="h-4 w-4 text-[#7D1D1D]" />
                    <input
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                      placeholder="Re-enter your password"
                      disabled={loading}
                      autoComplete="new-password"
                      aria-label="Confirm password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7D1D1D] px-5 py-3.5 md:py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#7D1D1D]/40 min-h-[48px] md:min-h-[44px]"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    <>Reset password</>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-[#584942]">Loading…</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
