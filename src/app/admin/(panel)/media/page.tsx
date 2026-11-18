import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/ui";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
export const metadata = { title: "Media library" };
export default async function MediaPage() {
  await requireUser("media.write");
  const items = await prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return <><PageHeader title="Media library" desc="Upload and reuse images across products, services, projects and pages." /><MediaLibrary items={items} /></>;
}
