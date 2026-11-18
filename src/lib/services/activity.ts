import { prisma } from "@/lib/db";

export async function logActivity(userId: string | null, action: string, entityType?: string, entityId?: string, summary?: string) {
  await prisma.activityLog.create({ data: { userId, action, entityType, entityId, summary: summary?.slice(0, 300) } });
}
