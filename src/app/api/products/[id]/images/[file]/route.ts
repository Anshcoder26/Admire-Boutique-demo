import { getProductPhoto } from "@/lib/db";
import { decodePhotoDataUrl, parsePhotoFile, photoVersion } from "@/lib/product-images";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

export async function GET(_: Request, { params }: { params: Promise<{ id: string; file: string }> }) {
  const { id, file } = await params;
  const parsed = parsePhotoFile(file);
  if (!parsed) return notFound();

  const stored = await getProductPhoto(id, parsed.index);
  const photo = stored ? decodePhotoDataUrl(stored) : null;
  if (!stored || !photo) return notFound();

  // The link carries a fingerprint of the photo, so a matching link never changes
  // and browsers can keep it for a year. A stale link still works but isn't cached long.
  const isCurrent = parsed.version === photoVersion(stored);

  return new Response(new Uint8Array(photo.body), {
    headers: {
      "Content-Type": photo.contentType,
      "Content-Length": String(photo.body.length),
      "Cache-Control": isCurrent ? "public, max-age=31536000, immutable" : "public, max-age=300",
    },
  });
}
