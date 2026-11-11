"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, CheckCircle2, Loader, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { compressImageFile } from "@/lib/image-compress";
import {
  REVIEW_BODY_MAX as BODY_MAX,
  REVIEW_BODY_MIN as BODY_MIN,
  REVIEW_MAX_PHOTOS as MAX_PHOTOS,
  REVIEW_POLICY,
  REVIEW_TITLE_MAX as TITLE_MAX,
  REVIEW_TITLE_MIN as TITLE_MIN,
} from "@/lib/review-policy";

const inputClass =
  "w-full rounded-md border border-[var(--ink)]/15 bg-white px-4 py-2.5 text-sm text-[var(--ink)] outline-none focus:border-[#7D1D1D]";

/** Write a review. Without `productId` it is a review of the boutique as a whole. */
export function ReviewForm({
  productId,
  productName,
  onPosted,
}: {
  productId?: string;
  productName?: string;
  onPosted?: () => void;
}) {
  const { user, userType, isLoading } = useAuth();
  const pathname = usePathname();
  const fileInput = useRef<HTMLInputElement>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "photos" | "submit">("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  if (isLoading) return null;

  if (!user || userType !== "customer") {
    return (
      <div className="rounded-lg border border-dashed border-[#7D1D1D]/30 bg-[#fff8f5] p-5 text-sm text-[var(--ink)]/75">
        Bought from us? <Link href={`/login?redirect=${encodeURIComponent(pathname || "/review")}`} className="font-semibold text-[#7D1D1D] underline">Sign in</Link> to write a review.
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-[#1d6a3d]/25 bg-[#edf7ef] p-5 text-sm text-[#1d6a3d]">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> {done}
      </div>
    );
  }

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(files).filter((file) => file.type.startsWith("image/")).slice(0, room);
    if (files.length > room) setError(`You can add up to ${MAX_PHOTOS} photos.`);
    setBusy("photos");
    try {
      const shrunk = await Promise.all(chosen.map((file) => compressImageFile(file, 1200)));
      setPhotos((prev) => [...prev, ...shrunk].slice(0, MAX_PHOTOS));
    } catch {
      setError("That photo couldn't be added. Please try a JPG or PNG.");
    } finally {
      setBusy("");
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!rating) return setError("Please choose a star rating.");
    setBusy("submit");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, rating, title, body, photos }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setError(data.error || "Your review couldn't be sent. Please try again.");
        return;
      }
      setDone(data.message || "Thank you! Your review is now live.");
      onPosted?.();
    } catch {
      setError("Your review couldn't be sent. Please check your connection and try again.");
    } finally {
      setBusy("");
    }
  };

  const shown = hover || rating;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-[var(--ink)]/10 bg-white p-5 md:p-6">
      <div>
        <p className="mb-1 text-sm font-semibold text-[var(--ink)]">
          {productName ? `Your rating for ${productName}` : "Your rating"}
        </p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)} role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={rating === star}
              aria-label={`${star} star${star > 1 ? "s" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              className={`text-3xl leading-none transition ${star <= shown ? "text-[#D4AF37]" : "text-[var(--ink)]/20"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        minLength={TITLE_MIN}
        maxLength={TITLE_MAX}
        required
        placeholder="Title, e.g. Lovely fabric and fit"
        aria-label="Review title"
        className={inputClass}
      />
      <div>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={BODY_MIN}
          maxLength={BODY_MAX}
          required
          rows={4}
          placeholder="Tell other shoppers about the fabric, fit, colour and delivery"
          aria-label="Your review"
          className={inputClass}
        />
        <p className="mt-1 text-right text-xs text-[var(--ink)]/50">{body.length}/{BODY_MAX}</p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2">
          {photos.map((src, index) => (
            <div key={index} className="relative h-20 w-20 overflow-hidden rounded-md border border-[var(--ink)]/10">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a photo being uploaded */}
              <img src={src} alt={`Your photo ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove photo ${index + 1}`}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={busy === "photos"}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-[var(--ink)]/25 text-xs text-[var(--ink)]/60 hover:border-[#7D1D1D] hover:text-[#7D1D1D]"
            >
              {busy === "photos" ? <Loader className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
              Add photo
            </button>
          ) : null}
        </div>
        <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(e.target.files)} />
        <p className="mt-1 text-xs text-[var(--ink)]/50">Optional, up to {MAX_PHOTOS} photos.</p>
      </div>

      {error ? <p role="alert" className="text-sm text-[#b3261e]">{error}</p> : null}

      <button
        type="submit"
        disabled={busy !== ""}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-[#7D1D1D] px-6 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#641414] disabled:opacity-60"
      >
        {busy === "submit" ? <Loader className="h-4 w-4 animate-spin" /> : null} Submit review
      </button>
      <p className="text-xs text-[var(--ink)]/50">{REVIEW_POLICY}</p>
    </form>
  );
}
