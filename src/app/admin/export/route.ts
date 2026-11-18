import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { exportInquiriesCsv } from "@/lib/services/inquiries";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  const sp = new URL(req.url).searchParams;
  try {
    const csv = await exportInquiriesCsv(user, { status: sp.get("status") ?? undefined, type: sp.get("type") ?? undefined, q: sp.get("q") ?? undefined });
    return new Response("﻿" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="inquiries-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
