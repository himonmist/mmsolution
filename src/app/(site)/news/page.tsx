import type { Metadata } from "next";
import { PageHero } from "@/components/site/PageHero";
import { NewsSection } from "@/components/home/Sections";
import { getPosts } from "@/lib/queries";

export const metadata: Metadata = { title: "News & Insights", description: "Technology guides, networking insights, product announcements and company updates.", alternates: { canonical: "/news" } };

export default async function NewsPage() {
  const posts = await getPosts();
  return (
    <>
      <PageHero eyebrow="News & insights" title="Guides for smarter IT decisions." crumbs={[["News & Insights", "/news"]]} />
      {posts.length ? <NewsSection posts={posts} /> : <p className="container-x py-24 text-center text-slate">Articles will be published soon.</p>}
    </>
  );
}
