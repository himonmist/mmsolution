import { NextResponse } from "next/server";
import { siteSearch } from "@/lib/queries";
import { limiters } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { clientIpFrom } from "@/lib/http";

export async function GET(req: Request) {
  if (!limiters.search.hit(hashIp(clientIpFrom(req))).allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const data = await siteSearch(q);
  return NextResponse.json(data, { headers: { "Cache-Control": "private, max-age=30" } });
}
