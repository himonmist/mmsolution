import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHero } from "./PageHero";
import { RichText } from "./RichText";

export async function getCmsPage(slug: string) {
  return prisma.page.findFirst({ where: { slug, status: "PUBLISHED" }, include: { sections: { orderBy: { sortOrder: "asc" } } } });
}

export async function CmsPage({ slug, base = "/p/" }: { slug: string; base?: string }) {
  const page = await getCmsPage(slug);
  if (!page) notFound();
  const href = base === "/" ? `/${slug}` : `${base}${slug}`;
  return (
    <>
      <PageHero title={page.title} crumbs={[[page.title, href]]} />
      <section className="container-x max-w-3xl py-14">
        <RichText html={page.body} />
        {page.sections.map((s) => <div key={s.id} className="mt-10">{s.heading && <h2 className="display mb-3 text-2xl text-ink">{s.heading}</h2>}<RichText html={s.body} /></div>)}
        <p className="mt-10 text-sm text-slate">Last updated {page.updatedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </section>
    </>
  );
}
