import type { Metadata } from "next";
import { CmsPage, getCmsPage } from "@/components/site/CmsPage";

type Params = Promise<{ slug: string }>;
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const p = await getCmsPage(slug);
  return p ? { title: p.seoTitle ?? p.title, description: p.seoDescription ?? undefined, alternates: { canonical: `/p/${slug}` } } : { title: "Not found" };
}
export default async function Page({ params }: { params: Params }) { return <CmsPage slug={(await params).slug} />; }
