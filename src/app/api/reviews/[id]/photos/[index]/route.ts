import { authenticateAdmin } from "@/lib/admin-auth";
import { getReviewPhoto } from "@/lib/db";
import { decodePhotoDataUrl } from "@/lib/product-images";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(request: Request, { params }: { params: Promise<{ id: string; index: string }> }) {
  const { id, index } = await params;
  if (!/^\d{1,2}$/.test(index)) return notFound();

  const stored = await getReviewPhoto(id, Number(index));
  const photo = stored ? decodePhotoDataUrl(stored.photo) : null;
  if (!stored || !photo) return notFound();

  // Photos of removed reviews are only shown to the owner.
  if (stored.status !== "approved" && !(await authenticateAdmin(request))) return notFound();

  return new Response(new Uint8Array(photo.body), {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Length": String(photo.body.length),
      "X-Content-Type-Options": "nosniff",
      // Never cached by shared caches (CDN), and only briefly by the browser, so removing a
      // review takes its photos down for new visitors at once and for everyone within 5 minutes.
      "Cache-Control": stored.status === "approved" ? "private, max-age=300" : "private, no-store",
    },
  });
}
