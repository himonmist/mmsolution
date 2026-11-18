import { NextResponse } from "next/server";
import { submitInquiry } from "@/lib/services/inquiries";
import { clientIpFrom, readJson } from "@/lib/http";

export async function POST(req: Request) {
  const r = await readJson(req);
  if (!r.ok) return r.res;
  const result = await submitInquiry(r.body, { ip: clientIpFrom(req) });
  if (!result.ok) return NextResponse.json({ error: result.error, fieldErrors: result.fieldErrors }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
