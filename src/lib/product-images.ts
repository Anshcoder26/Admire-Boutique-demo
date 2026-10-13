import { createHash } from "node:crypto";

/**
 * Product photos uploaded from the owner dashboard are stored in the database as
 * base64 data URLs. Sending those inside pages made every page several MB, so the
 * storefront gets short photo links instead and the photo bytes are served by
 * /api/products/[id]/images/[file].
 */

/** Marker the storefront list query puts in place of a stored photo: "inline:<md5>". */
export const INLINE_PHOTO_PREFIX = "inline:";

const VERSION_LENGTH = 12;

const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

export function photoVersion(dataUrl: string): string {
  return createHash("md5").update(dataUrl).digest("hex").slice(0, VERSION_LENGTH);
}

export function productPhotoUrl(productId: string, index: number, version: string): string {
  return `/api/products/${encodeURIComponent(productId)}/images/${index}-${version.slice(0, VERSION_LENGTH)}`;
}

/** Replace stored photos (data URLs or inline markers) with photo links; keep normal URLs. */
export function toPublicImages(productId: string, images: string[]): string[] {
  return images.map((image, index) => {
    if (image.startsWith(INLINE_PHOTO_PREFIX)) {
      return productPhotoUrl(productId, index, image.slice(INLINE_PHOTO_PREFIX.length));
    }
    if (image.startsWith("data:")) {
      return productPhotoUrl(productId, index, photoVersion(image));
    }
    return image;
  });
}

/** Parse the "[index]-[version]" part of a photo link. */
export function parsePhotoFile(file: string): { index: number; version?: string } | null {
  const match = /^(\d{1,3})(?:-([a-f0-9]{1,32}))?$/.exec(file);
  if (!match) return null;
  return { index: Number(match[1]), version: match[2] };
}

/** Decode a base64 photo data URL; only real image types are allowed. */
export function decodePhotoDataUrl(dataUrl: string): { contentType: string; body: Buffer } | null {
  const match = /^data:([a-z]+\/[a-z0-9.+-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) return null;
  const contentType = match[1].toLowerCase();
  if (!ALLOWED_PHOTO_TYPES.has(contentType)) return null;
  const body = Buffer.from(match[2], "base64");
  if (body.length === 0) return null;
  return { contentType, body };
}
