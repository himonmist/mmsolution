import sharp from "sharp";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { sniffImageType, MAX_UPLOAD_BYTES } from "@/lib/security/upload";

export const uploadRoot = () => path.resolve(process.env.UPLOAD_DIR ?? "./storage/uploads");

type UploadResult =
  | { ok: true; url: string; filename: string; mimeType: "image/webp"; sizeBytes: number; width: number; height: number }
  | { ok: false; error: string };

/**
 * Validate by magic bytes, fully decode and re-encode with sharp. Re-encoding destroys
 * polyglot payloads and strips EXIF/GPS metadata. Original filenames are never used on disk.
 */
export async function processImageUpload(buf: Buffer, originalName: string): Promise<UploadResult> {
  if (!buf?.length) return { ok: false, error: "Empty file." };
  if (buf.length > MAX_UPLOAD_BYTES) return { ok: false, error: "File is larger than 8 MB." };
  if (!sniffImageType(buf)) return { ok: false, error: "Only JPEG, PNG, WebP, GIF or AVIF images are allowed." };
  try {
    const img = sharp(buf, { limitInputPixels: 40_000_000, failOn: "error" }).rotate();
    const meta = await img.metadata();
    if (!meta.width || !meta.height) return { ok: false, error: "Unreadable image." };
    const out = await img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const year = String(new Date().getFullYear());
    const name = randomBytes(16).toString("hex").slice(0, 24) + ".webp";
    const display = path.basename(originalName || "image").replace(/[^\w.\- ]/g, "").slice(0, 120) || "image";
    let url = `/uploads/${year}/${name}`;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      // Serverless hosting (Vercel): persist to Vercel Blob object storage.
      const { put } = await import("@vercel/blob");
      const blob = await put(`uploads/${year}/${name}`, out.data, { access: "public", contentType: "image/webp", addRandomSuffix: false });
      url = blob.url;
    } else {
      const dir = path.join(uploadRoot(), year);
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, name), out.data, { mode: 0o644 });
    }
    return { ok: true, url, filename: display, mimeType: "image/webp", sizeBytes: out.info.size, width: out.info.width, height: out.info.height };
  } catch {
    return { ok: false, error: "The image appears to be corrupt." };
  }
}

/** Map URL segments to a file inside the upload root, or null if unsafe. */
export function resolveUploadPath(segments: string[]): string | null {
  if (segments.length !== 2) return null;
  const [year, file] = segments;
  if (!/^\d{4}$/.test(year) || !/^[a-z0-9-]{3,64}\.(webp|png|jpe?g|avif|gif)$/.test(file)) return null;
  const root = uploadRoot();
  const full = path.resolve(root, year, file);
  return full.startsWith(root + path.sep) ? full : null;
}
