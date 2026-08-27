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

        // Dispatch auth update event
        window.dispatchEvent(new Event("admire-auth-updated"));
        window.dispatchEvent(new Event("storage"));

        // Small delay for UX feedback
        setTimeout(() => {
          router.push("/account");
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
      <div className="overflow-hidden rounded-[32px] border border-[#c94a6a]/20 bg-[#fffaf6] shadow-[0_22px_60px_rgba(216,30,143,0.08)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left section - Info */}
          <div className="bg-[linear-gradient(135deg,_#f8efe7,_#f3e5d8_40%,_#efe0d0)] p-6 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c94a6a]/30 bg-white/80 text-[#c94a6a]">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">
                  Your account
                </p>
                <h1 className="font-serif text-4xl md:text-5xl text-[#201614]">
                  Sign in
                </h1>
              </div>
            </div>
            <p className="max-w-md text-base leading-7 text-[#5a4b45]">
              Track orders, save addresses, manage delivery preferences and enjoy a seamless shopping experience built for real customers.
            </p>

            {/* Help section */}
            <div className="mt-8 space-y-4">
              <div className="rounded-[24px] border border-white/70 bg-white/50 p-4 text-sm text-[#483d39] backdrop-blur-sm">
                <p className="font-semibold mb-2">🔐 New to Admire Boutique?</p>
                <Link
                  href="/signup"
                  className="text-[#c94a6a] hover:text-[#a81566] font-semibold transition"
                >
                  Create an account →
                </Link>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/50 p-4 text-sm text-[#483d39] backdrop-blur-sm">
                <p className="font-semibold mb-2">❓ Forgot password?</p>
                <Link
                  href="/forgot-password"
                  className="text-[#c94a6a] hover:text-[#a81566] font-semibold transition"
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
                <div className="rounded-[16px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#ff6b6b]">
                      {errors.submit}
                    </p>
                    {retryAfterTime && (
                      <p className="text-xs text-[#ff6b6b]/80 mt-1">
                        Please wait {retryAfterTime} seconds before trying again.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div className="rounded-[16px] border-2 border-[#6f2fbf] bg-[#f0f0ff] p-4 flex gap-3">
                  <div className="text-sm font-semibold text-[#6f2fbf]">
                    ✓ {successMessage}
                  </div>
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
                      : "border-[#c94a6a]/20 bg-[#fff5f0] hover:border-[#c94a6a]/40"
                  }`}
                >
                  <Mail
                    className={`h-4 w-4 ${
                      errors.email ? "text-[#ff6b6b]" : "text-[#c94a6a]"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="you@example.com"
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

              {/* Password field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                  Password
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                    errors.password
                      ? "border-[#ff6b6b] bg-[#fff0f0]"
                      : "border-[#c94a6a]/20 bg-[#fff5f0] hover:border-[#c94a6a]/40"
                  }`}
                >
                  <LockKeyhole
                    className={`h-4 w-4 ${
                      errors.password ? "text-[#ff6b6b]" : "text-[#c94a6a]"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
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
                    className="text-[#c94a6a] hover:text-[#a81566] transition p-1"
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
                  <p id="password-error" className="text-xs text-[#ff6b6b] font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || retryAfterTime !== null}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#c94a6a] px-5 py-3.5 md:py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#c94a6a]/40 min-h-[48px] md:min-h-[44px]"
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
              <div className="text-center text-sm text-[#665a55]">
                <Link
                  href="/forgot-password"
                  className="text-[#c94a6a] hover:text-[#a81566] font-semibold transition"
                >
                  Forgot password?
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-[#c94a6a]/10 text-center text-sm text-[#665a55]">
              New to Admire Boutique?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#c94a6a] hover:text-[#a81566] transition"
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

