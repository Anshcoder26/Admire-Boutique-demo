import { decodePhotoDataUrl } from "@/lib/product-images";
import {
  REVIEW_BODY_MAX,
  REVIEW_BODY_MIN,
  REVIEW_MAX_PHOTO_BYTES,
  REVIEW_MAX_PHOTOS,
  REVIEW_REMOVAL_REASONS,
  REVIEW_REPLY_MAX,
  REVIEW_TITLE_MAX,
  REVIEW_TITLE_MIN,
} from "@/lib/review-policy";

// The limits live in review-policy.ts (browser-safe) so the form and server share them.
export * from "@/lib/review-policy";

export function isRemovalReason(value: unknown): value is (typeof REVIEW_REMOVAL_REASONS)[number] {
  return typeof value === "string" && (REVIEW_REMOVAL_REASONS as readonly string[]).includes(value);
}

/** Clean the boutique's reply. Empty means "remove the reply"; too long is an error. */
export function cleanReviewReply(value: unknown): { ok: true; value: string | null } | { ok: false; error: string } {
  const reply = cleanBody(value);
  if (!reply) return { ok: true, value: null };
  if (reply.length > REVIEW_REPLY_MAX) return { ok: false, error: `Reply can be at most ${REVIEW_REPLY_MAX} characters.` };
  return { ok: true, value: reply };
}

export type ReviewInput = {
  rating: number;
  title: string;
  body: string;
  photos: string[];
};

// Drop control characters (keep newlines in the body) and collapse surrounding space.
const cleanLine = (value: unknown) => String(value ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
const cleanBody = (value: unknown) =>
  String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Check a submitted review. Returns the cleaned review or a message to show the customer. */
export function validateReviewInput(raw: unknown): { ok: true; value: ReviewInput } | { ok: false; error: string } {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "Please choose a star rating from 1 to 5." };
  }

  const title = cleanLine(input.title);
  if (title.length < REVIEW_TITLE_MIN) return { ok: false, error: "Please add a short title." };
  if (title.length > REVIEW_TITLE_MAX) return { ok: false, error: `Title can be at most ${REVIEW_TITLE_MAX} characters.` };

  const body = cleanBody(input.body);
  if (body.length < REVIEW_BODY_MIN) return { ok: false, error: `Please write at least ${REVIEW_BODY_MIN} characters.` };
  if (body.length > REVIEW_BODY_MAX) return { ok: false, error: `Review can be at most ${REVIEW_BODY_MAX} characters.` };

  const rawPhotos = input.photos === undefined ? [] : input.photos;
  if (!Array.isArray(rawPhotos)) return { ok: false, error: "Photos could not be read." };
  if (rawPhotos.length > REVIEW_MAX_PHOTOS) return { ok: false, error: `You can add up to ${REVIEW_MAX_PHOTOS} photos.` };
  for (const photo of rawPhotos) {
    const decoded = typeof photo === "string" ? decodePhotoDataUrl(photo) : null;
    if (!decoded) return { ok: false, error: "Only JPG, PNG or WebP photos can be added." };
    if (decoded.body.length > REVIEW_MAX_PHOTO_BYTES) return { ok: false, error: "Each photo must be under 1.5 MB." };
  }

  return { ok: true, value: { rating, title, body, photos: rawPhotos as string[] } };
}

/** Public name for a review: first name and last initial ("Megha Sharma" -> "Megha S."). */
export function reviewerDisplayName(fullName: string): string {
  const parts = cleanLine(fullName).split(" ").filter(Boolean);
  if (parts.length === 0) return "Customer";
  const first = parts[0].slice(0, 30);
  return parts.length > 1 ? `${first} ${parts[parts.length - 1][0].toUpperCase()}.` : first;
}

export function reviewPhotoUrl(reviewId: string, index: number): string {
  return `/api/reviews/${encodeURIComponent(reviewId)}/photos/${index}`;
}
