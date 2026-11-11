"use client";

import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Stars } from "@/components/reviews/review-card";
import { REVIEW_POLICY, REVIEW_REMOVAL_REASONS, REVIEW_REPLY_MAX } from "@/lib/review-policy";

type View = "live" | "removed";

type AdminReview = {
  id: string;
  customerName: string;
  productName: string | null;
  rating: number;
  title: string;
  body: string;
  photos: string[];
  verifiedBuyer: boolean;
  removedReason: string | null;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
};

const smallButton = "rounded-md px-4 py-2 text-xs font-semibold disabled:opacity-50";

/**
 * Owner's view of reviews. Reviews go live without approval; the owner can reply
 * in public, or remove one only for a listed reason (and restore it later).
 */
export function AdminReviews() {
  const [view, setView] = useState<View>("live");
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeReason, setRemoveReason] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);

  // Loading/error are reset by the view buttons, so the effect only sets state after the fetch.
  useEffect(() => {
    let active = true;
    fetch(`/api/admin/reviews?status=${view}`, { credentials: "include" })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as { reviews?: AdminReview[] };
        if (!res.ok) throw new Error();
        if (active) setReviews(data.reviews ?? []);
      })
      .catch(() => active && setError("Reviews couldn't be loaded. Please refresh."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [view]);

  const post = async (id: string, payload: Record<string, unknown>) => {
    setBusyId(id);
    setError("");
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, ...payload }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error || "That didn't work. Please try again.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work. Please try again.");
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const saveReply = async (review: AdminReview, text: string) => {
    if (!(await post(review.id, { action: "reply", reply: text }))) return;
    const reply = text.trim() || null;
    setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, reply, replyAt: reply ? new Date().toISOString() : null } : r)));
    setReplyDrafts((prev) => {
      const next = { ...prev };
      delete next[review.id];
      return next;
    });
    setSavedId(review.id);
  };

  const removeOrRestore = async (id: string, action: "remove" | "restore") => {
    if (!(await post(id, action === "remove" ? { action, reason: removeReason } : { action }))) return;
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setRemovingId(null);
    setRemoveReason("");
  };

  return (
    <div className="space-y-4">
      <p className="rounded-md bg-[var(--panel-alt)] p-3 text-xs text-[var(--ink)]/70">
        Reviews go live as soon as a buyer posts them. {REVIEW_POLICY} Reply to a bad review instead of removing it.
      </p>

      <div className="flex flex-wrap gap-2">
        {(["live", "removed"] as const).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={view === key}
            onClick={() => {
              if (key === view) return;
              setLoading(true);
              setError("");
              setRemovingId(null);
              setView(key);
            }}
            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
              view === key ? "border-[#7D1D1D] bg-[#7D1D1D] text-white" : "border-[var(--ink)]/15 bg-white text-[var(--ink)]/70"
            }`}
          >
            {key === "live" ? "Live on site" : "Removed"}
          </button>
        ))}
      </div>

      {error ? <p role="alert" className="text-sm text-[#b3261e]">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-[var(--ink)]/60">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--ink)]/15 p-4 text-sm text-[var(--ink)]/60">
          {view === "live" ? "No reviews yet." : "No reviews have been removed."}
        </p>
      ) : (
        reviews.map((review) => {
          const draft = replyDrafts[review.id] ?? review.reply ?? "";
          const replyChanged = draft.trim() !== (review.reply ?? "");
          return (
            <article key={review.id} className="rounded-lg border border-[var(--ink)]/10 bg-white p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Stars rating={review.rating} className="text-base" />
                <span className="text-xs text-[var(--ink)]/50">{new Date(review.createdAt).toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-2 font-semibold text-[var(--ink)]">{review.title}</p>
              <p className="mt-1 whitespace-pre-line text-[var(--ink)]/75">{review.body}</p>
              {review.photos.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.photos.map((src, index) => (
                    <a key={src} href={src} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-md border border-[var(--ink)]/10">
                      {/* eslint-disable-next-line @next/next/no-img-element -- owner-only preview from our own API */}
                      <img src={src} alt={`Review photo ${index + 1}`} className="h-24 w-24 object-cover" />
                    </a>
                  ))}
                </div>
              ) : null}
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--ink)]/60">
                <span className="font-semibold text-[var(--ink)]">{review.customerName}</span>
                {review.verifiedBuyer ? (
                  <span className="inline-flex items-center gap-1 text-[#1d6a3d]"><BadgeCheck className="h-3.5 w-3.5" /> Verified buyer</span>
                ) : null}
                <span>{review.productName ? `Product: ${review.productName}` : "Review of the boutique"}</span>
              </p>

              {view === "removed" ? (
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-[#ffe6e6] px-3 py-1.5 text-xs font-semibold text-[#8a1f1f]">Removed: {review.removedReason}</span>
                  <button type="button" disabled={busyId === review.id} onClick={() => removeOrRestore(review.id, "restore")} className={`${smallButton} border border-[var(--ink)]/15 text-[var(--ink)]/80`}>
                    Restore to site
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-4">
                    <label htmlFor={`reply-${review.id}`} className="text-xs font-semibold text-[#7D1D1D]">
                      Public reply from Admire Boutique
                    </label>
                    <textarea
                      id={`reply-${review.id}`}
                      value={draft}
                      maxLength={REVIEW_REPLY_MAX}
                      rows={2}
                      onChange={(e) => {
                        setSavedId(null);
                        setReplyDrafts((prev) => ({ ...prev, [review.id]: e.target.value }));
                      }}
                      placeholder="Thank the customer, or explain how you'll make it right"
                      className="mt-1 w-full rounded-md border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none focus:border-[#7D1D1D]"
                    />
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={busyId === review.id || !replyChanged}
                        onClick={() => saveReply(review, draft)}
                        className={`${smallButton} bg-[#7D1D1D] text-white`}
                      >
                        {review.reply && !draft.trim() ? "Delete reply" : review.reply ? "Update reply" : "Post reply"}
                      </button>
                      {savedId === review.id ? <span className="text-xs text-[#1d6a3d]">Saved. It shows under the review.</span> : null}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-[var(--ink)]/10 pt-3">
                    {removingId === review.id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={removeReason}
                          onChange={(e) => setRemoveReason(e.target.value)}
                          aria-label="Reason for removing"
                          className="rounded-md border border-[var(--ink)]/15 bg-white px-3 py-2 text-xs"
                        >
                          <option value="">Choose a reason…</option>
                          {REVIEW_REMOVAL_REASONS.map((reason) => (
                            <option key={reason} value={reason}>{reason}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!removeReason || busyId === review.id}
                          onClick={() => removeOrRestore(review.id, "remove")}
                          className={`${smallButton} bg-[#b3261e] text-white`}
                        >
                          Remove from site
                        </button>
                        <button type="button" onClick={() => setRemovingId(null)} className={`${smallButton} border border-[var(--ink)]/15 text-[var(--ink)]/70`}>
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRemovingId(review.id);
                          setRemoveReason("");
                        }}
                        className="text-xs font-semibold text-[#b3261e] underline underline-offset-2"
                      >
                        Remove this review…
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
