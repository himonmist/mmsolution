import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import { PageHero } from "@/components/site/PageHero";
import { RichText } from "@/components/site/RichText";
import { JsonLd } from "@/components/site/JsonLd";
import { FacebookIcon, LinkedinIcon } from "@/components/ui/icons";
import { absUrl } from "@/lib/seo";

type Params = Promise<{ slug: string }>;
const get = cache((slug: string) => prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } }));

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await get((await params).slug);
  return p ? { title: p.seoTitle ?? p.title, description: p.seoDescription ?? p.excerpt ?? undefined, alternates: { canonical: `/news/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.excerpt ?? undefined, images: p.coverImage ? [p.coverImage] : undefined, publishedTime: p.publishedAt?.toISOString() } } : { title: "Not found" };
}

export default async function PostPage({ params }: { params: Params }) {
  const p = await get((await params).slug);
  if (!p) notFound();
  const url = absUrl(`/news/${p.slug}`);
  return (
    <>
      <PageHero eyebrow={p.category} title={p.title} body={p.excerpt} crumbs={[["News & Insights", "/news"], [p.title, `/news/${p.slug}`]]} />
      <article className="bg-white py-14">
        <div className="container-x max-w-3xl">
          {p.coverImage && <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-3xl bg-mist"><Image src={p.coverImage} alt="" fill priority sizes="768px" className="object-cover" /></div>}
          {p.publishedAt && <time className="text-sm text-slate" dateTime={p.publishedAt.toISOString()}>{p.publishedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>}
          <RichText html={p.body} className="mt-4 text-lg" />
          <div className="mt-10 flex items-center gap-2 border-t border-line pt-6 text-sm text-slate">
            Share:
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="grid h-9 w-9 place-items-center rounded-full bg-mist text-navy"><FacebookIcon className="h-4 w-4" /></a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" className="grid h-9 w-9 place-items-center rounded-full bg-mist text-navy"><LinkedinIcon className="h-4 w-4" /></a>
            <Link href="/news" className="ml-auto font-semibold text-brand-blue">← All articles</Link>
          </div>
        </div>
      </article>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Article", headline: p.title, image: p.coverImage ? [absUrl(p.coverImage)] : undefined, datePublished: p.publishedAt?.toISOString(), dateModified: p.updatedAt.toISOString(), mainEntityOfPage: url, publisher: { "@type": "Organization", name: "MM Business Solution", logo: { "@type": "ImageObject", url: absUrl("/brand/logo.png") } } }} />
    </>
  );
}
