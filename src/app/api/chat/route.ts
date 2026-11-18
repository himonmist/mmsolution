import { NextResponse } from "next/server";
import { z } from "zod";
import { chatReply } from "@/lib/services/chatbot";
import { limiters } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";
import { clientIpFrom, readJson } from "@/lib/http";

const schema = z.object({ message: z.string().max(300) });

export async function POST(req: Request) {
  const r = await readJson(req, 2_000);
  if (!r.ok) return r.res;
  if (!limiters.chat.hit(hashIp(clientIpFrom(req))).allowed) return NextResponse.json({ error: "Too many messages, please slow down." }, { status: 429 });
  const parsed = schema.safeParse(r.body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid message" }, { status: 422 });
  return NextResponse.json(await chatReply(parsed.data.message));
}
