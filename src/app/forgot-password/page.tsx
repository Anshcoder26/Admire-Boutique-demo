"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft, Mail, CheckCircle, Loader } from "lucide-react";
import { useState, useCallback } from "react";

interface FormErrors {
  email?: string;
  submit?: string;
}

interface ResetResponse {
  success?: boolean;
  message?: string;
  error?: string;
  nextRetryIn?: string;
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setErrors({});

      try {
        const response = await fetch("/api/auth/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        const data = (await response.json()) as ResetResponse;

        if (!response.ok) {
          if (response.status === 429) {
            setErrors({
              submit: data.error || `Too many attempts. Please try again ${data.nextRetryIn || "later"}.`,
            });
          } else {
            setErrors({
              submit:
                data.error ||
                "Unable to process request. Please try again later.",
            });
          }
          setLoading(false);
          return;
        }

        if (!data.success) {
          setErrors({
            submit: data.error || "Unable to process request.",
          });
          setLoading(false);
          return;
        }

        // Show success state
        setSubmitted(true);
      } catch (error) {
        console.error("[FORGOT-PASSWORD] Request failed:", error);
        setErrors({
          submit: "Connection error. Please check your internet and try again.",
        });
        setLoading(false);
      }
    },
    [email, validateForm]
  );

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-2xl px-4 py-8 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-[32px] border border-[#7D1D1D]/20 bg-[#fffaf6] shadow-[0_22px_60px_rgba(216,30,143,0.08)]">
        <div className="p-6 md:p-10">
          {/* Header */}
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[#7D1D1D] hover:text-[#a81566] transition mb-6 font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-4xl md:text-5xl text-[#201614] mb-2">
                  Reset password
                </h1>
                <p className="text-base text-[#5a4b45]">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Error message */}
                {errors.submit && (
                  <div className="rounded-[16px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-4 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-[#ff6b6b]">
                      {errors.submit}
                    </p>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                    Email address
                  </label>
                  <div
                    className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                      errors.email
                        ? "border-[#ff6b6b] bg-[#fff0f0]"
                        : "border-[#7D1D1D]/20 bg-[#fff5f0] hover:border-[#7D1D1D]/40"
                    }`}
                  >
                    <Mail
                      className={`h-4 w-4 ${
                        errors.email ? "text-[#ff6b6b]" : "text-[#7D1D1D]"
                      }`}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(e.target.value)}
                      className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                      placeholder="your@email.com"
                      disabled={loading}
                      autoComplete="email"
                      aria-label="Email address"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="text-xs text-[#ff6b6b] font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7D1D1D] px-5 py-3.5 md:py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#7D1D1D]/40 min-h-[48px] md:min-h-[44px]"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Sending email...
                    </>
                  ) : (
                    <>
                      Send reset link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // Success state
            <div className="text-center py-8">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-[#6f2fbf]/10 p-4">
                  <CheckCircle className="h-12 w-12 text-[#6f2fbf]" />
                </div>
              </div>
              <h2 className="font-serif text-3xl text-[#201614] mb-3">
                Email sent! ✓
              </h2>
              <p className="text-base text-[#5a4b45] mb-6 max-w-md mx-auto">
                Check your email for a password reset link. The link will expire in 1 hour.
              </p>
              <p className="text-sm text-[#8a6f5f] mb-6">
                Don&apos;t see the email? Check your spam folder or{" "}
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="text-[#7D1D1D] hover:text-[#a81566] font-semibold transition"
                >
                  try another email
                </button>
              </p>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#7D1D1D] px-6 py-3 text-sm font-bold text-white hover:bg-[#a81566] transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
