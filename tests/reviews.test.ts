import { test } from "node:test";
import assert from "node:assert/strict";
import {
  REVIEW_MAX_PHOTOS,
  REVIEW_REMOVAL_REASONS,
  cleanReviewReply,
  isRemovalReason,
  reviewerDisplayName,
  validateReviewInput,
} from "../src/lib/reviews";

test("a review can only be removed for a listed reason, never for a bad rating", () => {
  assert.equal(isRemovalReason(REVIEW_REMOVAL_REASONS[0]), true);
  for (const reason of ["Negative review", "Low rating", "", undefined, 3]) {
    assert.equal(isRemovalReason(reason), false, String(reason));
  }
});

test("owner reply is cleaned, empty clears it, too long is refused", () => {
  assert.deepEqual(cleanReviewReply("  Thank you, Megha!  "), { ok: true, value: "Thank you, Megha!" });
  assert.deepEqual(cleanReviewReply("   "), { ok: true, value: null });
  assert.deepEqual(cleanReviewReply(undefined), { ok: true, value: null });
  assert.equal(cleanReviewReply("x".repeat(1001)).ok, false);
});

const tinyJpeg = `data:image/jpeg;base64,${Buffer.from("fake-jpeg-bytes").toString("base64")}`;
const good = { rating: 5, title: "Lovely fabric", body: "The fabric is soft and the fit was perfect.", photos: [] };

test("accepts a normal review and trims it", () => {
  const result = validateReviewInput({ ...good, title: "  Lovely   fabric ", photos: [tinyJpeg] });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.title, "Lovely fabric");
    assert.equal(result.value.photos.length, 1);
  }
});

test("rating must be a whole number from 1 to 5", () => {
  for (const rating of [0, 6, 4.5, "five", undefined]) {
    assert.equal(validateReviewInput({ ...good, rating }).ok, false, String(rating));
  }
});

test("title and body lengths are checked", () => {
  assert.equal(validateReviewInput({ ...good, title: "" }).ok, false);
  assert.equal(validateReviewInput({ ...good, title: "x".repeat(81) }).ok, false);
  assert.equal(validateReviewInput({ ...good, body: "too short" }).ok, false);
  assert.equal(validateReviewInput({ ...good, body: "x".repeat(1001) }).ok, false);
});

test("photos: limited count, real images only, size capped", () => {
  assert.equal(validateReviewInput({ ...good, photos: Array(REVIEW_MAX_PHOTOS + 1).fill(tinyJpeg) }).ok, false);
  assert.equal(validateReviewInput({ ...good, photos: ["data:text/html;base64,PHNjcmlwdD4="] }).ok, false);
  assert.equal(validateReviewInput({ ...good, photos: ["https://example.com/x.jpg"] }).ok, false);
  assert.equal(validateReviewInput({ ...good, photos: "not-a-list" }).ok, false);
  const huge = `data:image/jpeg;base64,${Buffer.alloc(1_600_000).toString("base64")}`;
  assert.equal(validateReviewInput({ ...good, photos: [huge] }).ok, false);
});

test("control characters are stripped from text", () => {
  const result = validateReviewInput({ ...good, title: "Nice\u0000 suit", body: "Great\u0007 quality\n\n\n\nfabric overall" });
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.title, "Nice suit");
    assert.equal(result.value.body, "Great  quality\n\nfabric overall");
  }
});

test("reviewer names show first name and last initial only", () => {
  assert.equal(reviewerDisplayName("Megha Sharma"), "Megha S.");
  assert.equal(reviewerDisplayName("  Nisha  "), "Nisha");
  assert.equal(reviewerDisplayName("Aditi Rao Patel"), "Aditi P.");
  assert.equal(reviewerDisplayName(""), "Customer");
});
