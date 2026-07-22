import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

function extensionFor(file: File): string {
  const type = (file.type || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("gif")) return "gif";
  if (type.includes("heic") || type.includes("heif")) return "heic";

  const name = file.name?.toLowerCase() ?? "";
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".webp")) return "webp";
  if (name.endsWith(".gif")) return "gif";
  if (name.endsWith(".heic") || name.endsWith(".heif")) return "heic";
  return "jpg";
}

function isAllowedImage(file: File): boolean {
  if (file.type && ALLOWED.has(file.type.toLowerCase())) return true;
  // Some mobile browsers send an empty MIME type
  const name = file.name?.toLowerCase() ?? "";
  return /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name) || !file.type;
}

export async function saveImageFile(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("Please choose an image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 10MB. Try a smaller photo.");
  }
  if (!isAllowedImage(file)) {
    throw new Error("Use a JPEG, PNG, WebP, or GIF photo.");
  }

  const ext = extensionFor(file);
  const filename = `${randomUUID()}.${ext}`;
  const contentType = file.type || `image/${ext === "jpg" ? "jpeg" : ext}`;

  // Production (Vercel): store in Blob when token is configured
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`houses/${filename}`, file, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  // Local / self-hosted: write under public/uploads
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
