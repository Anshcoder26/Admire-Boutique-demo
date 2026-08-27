import bcryptjs from "bcryptjs";
import crypto from "node:crypto";

const HASH_ROUNDS = 12;
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const REFRESH_TOKEN_EXPIRY_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

/**
 * Hash password with bcrypt using 12 rounds
 * Production standard: prevents rainbow tables and brute force attacks
 */
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, HASH_ROUNDS);
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Generate secure session token (32 bytes = 64 hex chars)
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate secure refresh token for long-term sessions
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate CSRF token for form protection
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate password strength
 * Production requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*)");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Rate limiter configuration
 * Production: prevents brute force attacks
 */
export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
}

export const AUTH_RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  signup: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
  passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
};

/**
 * Password reset token (6 digits for email, 32 bytes for secure generation)
 */
export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate OTP for email verification (6 digits)
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Validate OTP (6 digits)
 */
export function validateOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Session token expiry time (30 days from now)
 */
export function getSessionExpiryTime(): Date {
  return new Date(Date.now() + SESSION_EXPIRY_MS);
}

/**
 * Refresh token expiry time (90 days from now)
 */
export function getRefreshTokenExpiryTime(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
}

/**
 * Check if session token has expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"']/g, "").trim();
}

/**
 * Create secure cookie options for HTTP-only token storage
 */
export function getSecureCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax" as const,
    maxAge: SESSION_EXPIRY_MS / 1000, // Convert to seconds
    path: "/",
  };
}
