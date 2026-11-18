import { readFile, stat } from "node:fs/promises";
import { resolveUploadPath } from "@/lib/services/media";

const TYPES: Record<string, string> = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", avif: "image/avif", gif: "image/gif" };

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const file = resolveUploadPath((await ctx.params).path);
  if (!file) return new Response("Not found", { status: 404 });
  try {
    const st = await stat(file);
    if (!st.isFile()) return new Response("Not found", { status: 404 });
    const ext = file.split(".").pop()!.toLowerCase();
    return new Response(new Uint8Array(await readFile(file)), {
      headers: {
        "Content-Type": TYPES[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
