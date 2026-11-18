import { describe, it, expect, afterAll } from "vitest";
import sharp from "sharp";
import { rm } from "node:fs/promises";
import { processImageUpload, resolveUploadPath } from "@/lib/services/media";

afterAll(() => rm(process.env.UPLOAD_DIR!, { recursive: true, force: true }));

describe("image uploads", () => {
  it("re-encodes valid images to webp, strips metadata and uses a random name", async () => {
    const png = await sharp({ create: { width: 64, height: 32, channels: 3, background: "#ED1018" } })
      .withMetadata({ exif: { IFD0: { Copyright: "secret-gps" } } }).png().toBuffer();
    const r = await processImageUpload(png, "../../evil name.png");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.url).toMatch(/^\/uploads\/\d{4}\/[a-z0-9]{20,}\.webp$/);
      expect(r.mimeType).toBe("image/webp");
      expect(r.width).toBe(64);
    }
  });
  it("rejects disguised non-images and oversize files", async () => {
    const r1 = await processImageUpload(Buffer.from("<svg onload=alert(1)>"), "x.png");
    expect(r1.ok).toBe(false);
    const r2 = await processImageUpload(Buffer.alloc(9 * 1024 * 1024, 0xff), "big.jpg");
    expect(r2.ok).toBe(false);
  });
  it("rejects truncated / corrupt image bodies", async () => {
    const r = await processImageUpload(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]), "x.jpg");
    expect(r.ok).toBe(false);
  });
  it("prevents path traversal when serving", () => {
    expect(resolveUploadPath(["2026", "abc.webp"])).not.toBeNull();
    expect(resolveUploadPath(["..", "..", "etc", "passwd"])).toBeNull();
    expect(resolveUploadPath(["2026", "..%2f.env"])).toBeNull();
    expect(resolveUploadPath(["2026", "x.php"])).toBeNull();
  });
});
