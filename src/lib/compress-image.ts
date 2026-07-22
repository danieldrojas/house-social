/**
 * Client-side: resize/compress images so uploads stay under Server Action limits
 * and load quickly for friends.
 */
export async function compressImageFile(
  file: File,
  options: { maxEdge?: number; quality?: number; maxBytes?: number } = {},
): Promise<File> {
  const maxEdge = options.maxEdge ?? 1600;
  const quality = options.quality ?? 0.82;
  const maxBytes = options.maxBytes ?? 2.5 * 1024 * 1024;

  if (!file.type.startsWith("image/") && file.type !== "") {
    return file;
  }
  // Skip non-raster formats browsers may not canvas-draw
  if (/heic|heif|svg/i.test(file.type) || /\.heic$/i.test(file.name)) {
    return file;
  }

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", q),
  );

  while (blob && blob.size > maxBytes && q > 0.45) {
    q -= 0.1;
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", q),
    );
  }

  if (!blob) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
