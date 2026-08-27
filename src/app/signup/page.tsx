"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound, Loader, CheckCircle } from "lucide-react";
import { useState, useCallback } from "react";

interface FormState {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeToTerms?: string;
  submit?: string;
}

interface SignupResponse {
  success?: boolean;
  user?: { id: string; name: string; email: string };
  error?: string;
  nextRetryIn?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9+\-\s()]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  };

  const validatePasswordStrength = (
    password: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("At least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("One uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("One lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("One number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push("One special character");
    }

    return { valid: errors.length === 0, errors };
  };

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (form.name.length > 100) {
      newErrors.name = "Name must not exceed 100 characters";
    }

    // Email validation
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but if provided, must be valid)
    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!form.password) {
      newErrors.password = "Password is required";
    } else {
      const { valid, errors: passwordErrors } = validatePasswordStrength(
        form.password
      );
      if (!valid) {
        newErrors.password = `Password must contain: ${passwordErrors.join(", ")}`;
      }
    }

    // Confirm password validation
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement
    if (!form.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setErrors({});
      setSuccessMessage("");

      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim() || undefined,
            password: form.password,
          }),
          credentials: "include",
        });

        const data = (await response.json()) as SignupResponse;

        if (!response.ok) {
          if (response.status === 429) {
            setErrors({
              submit:
                data.error ||
                `Too many signup attempts. Please try again ${data.nextRetryIn || "later"}.`,
            });
          } else if (response.status === 409) {
            setErrors({
              submit: data.error || "Email address already registered. Please sign in.",
            });
          } else {
            setErrors({
              submit: data.error || "Unable to create account. Please try again.",
            });
          }
          setLoading(false);
          return;
        }

        if (!data.success || !data.user) {
          setErrors({
            submit: data.error || "Account creation failed. Please try again.",
          });
          setLoading(false);
          return;
        }

        // Success
        setSuccessMessage(
          `Welcome to Admire Boutique, ${data.user.name}! Redirecting...`
        );

        // Dispatch auth update event
        window.dispatchEvent(new Event("admire-auth-updated"));
        window.dispatchEvent(new Event("storage"));

        setTimeout(() => {
          router.push("/account");
          router.refresh();
        }, 500);
      } catch (error) {
        console.error("[SIGNUP] Request failed:", error);
        setErrors({
          submit:
            "Connection error. Please check your internet and try again.",
        });
        setLoading(false);
      }
    },
    [form, validateForm, router]
  );

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-10">
      <div className="overflow-hidden rounded-[32px] border border-[#7D1D1D]/20 bg-[#fffaf6] shadow-[0_22px_60px_rgba(216,30,143,0.08)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left section */}
          <div className="bg-[linear-gradient(135deg,_#f8efe7,_#f3e5d8_40%,_#efe0d0)] p-6 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7D1D1D]/30 bg-white/80 text-[#7D1D1D]">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#8a6f5f]">
                  New account
                </p>
                <h1 className="font-serif text-4xl md:text-5xl text-[#201614]">
                  Create account
                </h1>
              </div>
            </div>
            <p className="max-w-md text-base leading-7 text-[#5a4b45]">
              Save your addresses, track orders, manage deliveries, and enjoy a premium boutique shopping experience.
            </p>

            <div className="mt-8 rounded-[24px] border border-white/70 bg-white/50 p-4 text-sm text-[#483d39] backdrop-blur-sm">
              <p className="font-semibold mb-2">🔐 Password requirements</p>
              <ul className="space-y-1 text-xs">
                <li>✓ At least 8 characters</li>
                <li>✓ One uppercase letter</li>
                <li>✓ One lowercase letter</li>
                <li>✓ One number</li>
                <li>✓ One special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          {/* Right section - Form */}
          <div className="p-6 md:p-8 lg:p-10 max-h-screen overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Error message */}
              {errors.submit && (
                <div className="rounded-[16px] border-2 border-[#ff6b6b] bg-[#fff0f0] p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-[#ff6b6b] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#ff6b6b]">
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Success message */}
              {successMessage && (
                <div className="rounded-[16px] border-2 border-[#6f2fbf] bg-[#f0f0ff] p-4 flex gap-3">
                  <CheckCircle className="h-5 w-5 text-[#6f2fbf] flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-[#6f2fbf]">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Name field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                  Full name
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                    errors.name
                      ? "border-[#ff6b6b] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-[#fff5f0]"
                  }`}
                >
                  <UserRound
                    className={`h-4 w-4 ${
                      errors.name ? "text-[#ff6b6b]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="Your full name"
                    disabled={loading}
                    aria-invalid={!!errors.name}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-[#ff6b6b] font-medium">{errors.name}</p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                  Email
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                    errors.email
                      ? "border-[#ff6b6b] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-[#fff5f0]"
                  }`}
                >
                  <Mail
                    className={`h-4 w-4 ${
                      errors.email ? "text-[#ff6b6b]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="you@example.com"
                    disabled={loading}
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#ff6b6b] font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                  Phone (optional)
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                    errors.phone
                      ? "border-[#ff6b6b] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-[#fff5f0]"
                  }`}
                >
                  <Phone
                    className={`h-4 w-4 ${
                      errors.phone ? "text-[#ff6b6b]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="+91 98765 43210"
                    disabled={loading}
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-[#ff6b6b] font-medium">{errors.phone}</p>
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
                      : "border-[#7D1D1D]/20 bg-[#fff5f0]"
                  }`}
                >
                  <LockKeyhole
                    className={`h-4 w-4 ${
                      errors.password ? "text-[#ff6b6b]" : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="Create a password"
                    disabled={loading}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#7D1D1D] hover:text-[#a81566] transition p-1"
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
                  <p className="text-xs text-[#ff6b6b] font-medium">{errors.password}</p>
                )}
              </div>

              {/* Confirm password field */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[#7a655d] font-semibold">
                  Confirm password
                </label>
                <div
                  className={`flex items-center gap-3 rounded-2xl border-2 transition-all px-4 py-3 ${
                    errors.confirmPassword
                      ? "border-[#ff6b6b] bg-[#fff0f0]"
                      : "border-[#7D1D1D]/20 bg-[#fff5f0]"
                  }`}
                >
                  <LockKeyhole
                    className={`h-4 w-4 ${
                      errors.confirmPassword
                        ? "text-[#ff6b6b]"
                        : "text-[#7D1D1D]"
                    }`}
                  />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm({ ...form, confirmPassword: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-[#2d2421] outline-none placeholder-[#999]"
                    placeholder="Confirm password"
                    disabled={loading}
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#7D1D1D] hover:text-[#a81566] transition p-1"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#ff6b6b] font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms agreement */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeToTerms}
                    onChange={(e) =>
                      setForm({ ...form, agreeToTerms: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-2 border-[#7D1D1D] accent-[#7D1D1D] mt-1 cursor-pointer"
                    disabled={loading}
                    aria-invalid={!!errors.agreeToTerms}
                  />
                  <span className="text-xs text-[#5a4b45]">
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-[#7D1D1D] hover:text-[#a81566] font-semibold"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-[#7D1D1D] hover:text-[#a81566] font-semibold"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-xs text-[#ff6b6b] font-medium">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7D1D1D] px-5 py-3.5 md:py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 border border-[#7D1D1D]/40 min-h-[48px] md:min-h-[44px] mt-2"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#7D1D1D]/10 text-center text-sm text-[#665a55]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#7D1D1D] hover:text-[#a81566] transition"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
