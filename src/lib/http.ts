import { NextResponse } from "next/server";
import { requestOriginOk } from "@/lib/security/origin";

export function clientIpFrom(req: Request) {
  return req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/** Parse a bounded JSON body from a same-origin request. */
export async function readJson(req: Request, maxBytes = 32_000): Promise<{ ok: true; body: unknown } | { ok: false; res: NextResponse }> {
  if (!requestOriginOk(req)) return { ok: false, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return { ok: false, res: NextResponse.json({ error: "Unsupported media type" }, { status: 415 }) };
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > maxBytes) return { ok: false, res: NextResponse.json({ error: "Payload too large" }, { status: 413 }) };
  const text = await req.text();
  if (text.length > maxBytes) return { ok: false, res: NextResponse.json({ error: "Payload too large" }, { status: 413 }) };
  try { return { ok: true, body: JSON.parse(text) }; } catch { return { ok: false, res: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }; }
}
