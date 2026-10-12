// Browser-only: shrink a photo before upload so requests stay under the
// server's body limit and the catalog stays light. Uses the built-in canvas.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.82;

export async function compressImageFile(file: File): Promise<string> {
  // createImageBitmap applies the photo's EXIF orientation, so sideways phone shots come out upright.
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    // JPEG has no transparency, so fill white first instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
