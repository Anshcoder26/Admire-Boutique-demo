// Review limits and rules shared by the server and the browser (no Node imports here),
// so the form's limits can never drift from what the server accepts.

export const REVIEW_MAX_PHOTOS = 3;
export const REVIEW_MAX_PHOTO_BYTES = 1_500_000;
export const REVIEW_TITLE_MIN = 2;
export const REVIEW_TITLE_MAX = 80;
export const REVIEW_BODY_MIN = 10;
export const REVIEW_BODY_MAX = 1000;
export const REVIEW_REPLY_MAX = 1000;

/**
 * The only reasons a review may be taken down. A low rating or criticism is
 * never one of them; the policy below is shown to customers under the form.
 */
export const REVIEW_REMOVAL_REASONS = [
  "Abusive or offensive language",
  "Personal details (phone, address, etc.)",
  "Spam or advertising",
  "Photo unrelated or inappropriate",
  "Not about our products or service",
] as const;

export const REVIEW_POLICY =
  "We publish all genuine reviews, good or bad. We only remove reviews with abusive language, personal details, spam, or unrelated photos.";
