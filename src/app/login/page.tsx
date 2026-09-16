"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Loader } from "lucide-react";
import { useState, useCallback } from "react";

interface FormErrors {
  email?: string;
  password?: string;
  submit?: string;
}

interface LoginResponse {
  success?: boolean;
  user?: { id: string; name: string; email: string };
  userType?: "admin" | "customer";
  error?: string;
  retryAfter?: number;
  nextRetryIn?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [retryAfterTime, setRetryAfterTime] = useState<number | null>(null);

  // Validate email format
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  // Validate form inputs
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      // Validate form
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
          credentials: "include", // Include cookies
        });

        const data = (await response.json()) as LoginResponse;

        if (!response.ok) {
          // Handle rate limiting
          if (response.status === 429) {
            setRetryAfterTime(data.retryAfter || 60);
            setErrors({
              submit:
                data.error ||
                `Too many login attempts. Please try again in ${data.nextRetryIn || "15 minutes"}.`,
            });
          } else if (response.status === 401) {
            setErrors({
              submit: data.error || "Invalid email or password. Please try again.",
            });
          } else {
            setErrors({
              submit: data.error || "An error occurred. Please try again later.",
            });
          }
          setLoading(false);
          return;
        }

        if (!data.success || !data.user) {
          setErrors({
            submit: data.error || "Login failed. Please try again.",
          });
          setLoading(false);
          return;
        }

        // Successful login
        setSuccessMessage(`Welcome back, ${data.user.name}! Redirecting...`);

        // Store auth token for client-side auth checks
        window.localStorage.setItem("admire-user-token", "authenticated");

        // For admin, also store admin token
        if (data.userType === "admin") {
          window.localStorage.setItem("admire-admin-token", "authenticated");
        }

        // Dispatch auth update event
        window.dispatchEvent(new Event("admire-auth-updated"));
        window.dispatchEvent(new Event("storage"));

        // Check if there's a redirect param or if we came from checkout
        const params = new URLSearchParams(window.location.search);
        let redirectPath = params.get("redirect") || (data.userType === "admin" ? "/admin" : "/account");

        // If user has cart items and no specific redirect, go to checkout
        if (redirectPath === "/account" && !params.get("redirect")) {
          const cart = JSON.parse(window.localStorage.getItem("admire-cart") || "[]");
          if (cart.length > 0) {
            redirectPath = "/checkout";
          }
        }

        // Small delay for UX feedback
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 500);
      } catch (error) {
        console.error("[LOGIN] Request failed:", error);
        setErrors({
          submit:
            "Connection error. Please check your internet and try again.",
        });
        setLoading(false);
      }
    },
    [email, password, validateForm, router]
  );

  // Clear email error when user starts typing
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  // Clear password error when user starts typing
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-xl border border-[#7D1D1D]/20 bg-white shadow-[var(--shadow-md)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left section - Info */}
          <div className="bg-[#7D1D1D] p-6 text-white md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-white/30 bg-white/10 text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">
                  Your account
                </p>
                <h1 className="font-serif text-4xl font-semibold tracking-tight text-white md:text-5xl">
                  Sign in
                </h1>
              </div>
            </div>
            <p className="max-w-md text-base leading-7 text-white/75">
              Track orders, save addresses, manage delivery preferences and enjoy a seamless shopping experience built for real customers.
            </p>

            {/* Help section */}
            <div className="mt-8 space-y-4">
              <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white/80 backdrop-blur-sm">
                <p className="font-semibold mb-2">🔐 New to Admire Boutique?</p>
                <Link
                  href="/signup"
                  className="font-semibold text-white underline-offset-4 transition hover:text-white/80 hover:underline"
                >
                  Create an account →
                </Link>
              </div>

              <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white/80 backdrop-blur-sm">
                <p className="font-semibold mb-2">❓ Forgot password?</p>
                <Link
                  href="/forgot-password"
                  className="font-semibold text-white underline-offset-4 transition hover:text-white/80 hover:underline"
                >
                  Reset password →
                </Link>
              </div>
            </div>
          </div>

          {/* Right section - Form */}
          <div className="p-6 md:p-8 lg:p-10">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Error message */}
              {errors.submit && (
                <div className="rounded-md border border-[#b3261e]/40 bg-[#fff0f0] p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-[#b3261e] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#b3261e]">
                      {errors.submit}
                    </p>
                    {retryAfterTime && (
                      <p className="text-xs text-[#b3261e]/80 mt-1">
                        Please wait {retryAfterTime} seconds before trying again.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div className="rounded-md border border-[#7D1D1D]/30 bg-[var(--background)] p-4 flex gap-3">
                  <div className="text-sm font-semibold text-[#7D1D1D]">
                    ✓ {successMessage}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink)]/50 font-semibold">
                  Email address
                </label>
                <div
                  className={`flex items-center gap-3 rounded-md border transition-all px-4 py-3 focus-within:border-[#7D1D1D] focus-within:ring-2 focus-within:ring-[#7D1D1D]/10 ${
                    errors.email
                      ? "border-[#b3261e] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-white hover:border-[#7D1D1D]/40"
                  }`}
                >
                  <Mail
                    className={`h-4 w-4 ${
                      errors.email ? "text-[#b3261e]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/40"
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    aria-label="Email address"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-xs text-[#b3261e] font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink)]/50 font-semibold">
                  Password
                </label>
                <div
                  className={`flex items-center gap-3 rounded-md border transition-all px-4 py-3 focus-within:border-[#7D1D1D] focus-within:ring-2 focus-within:ring-[#7D1D1D]/10 ${
                    errors.password
                      ? "border-[#b3261e] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-white hover:border-[#7D1D1D]/40"
                  }`}
                >
                  <LockKeyhole
                    className={`h-4 w-4 ${
                      errors.password ? "text-[#b3261e]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink)]/40"
                    placeholder="Enter password"
                    disabled={loading}
                    autoComplete="current-password"
                    aria-label="Password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#7D1D1D] hover:text-[#641414] flex h-11 w-11 items-center justify-center rounded-md transition hover:bg-[#7D1D1D]/5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="text-xs text-[#b3261e] font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || retryAfterTime !== null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#7D1D1D] px-5 py-3.5 md:py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[var(--shadow-sm)] transition-all hover:bg-[#641414] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#7D1D1D]/40 min-h-[48px] md:min-h-[44px]"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Forgot password link */}
              <div className="text-center text-sm text-[var(--ink)]/60">
                <Link
                  href="/forgot-password"
                  className="font-semibold text-[#7D1D1D] transition hover:text-[#641414]"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#7D1D1D]/10 text-center text-sm text-[var(--ink)]/60">
              New to Admire Boutique?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#7D1D1D] transition hover:text-[#641414]"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

