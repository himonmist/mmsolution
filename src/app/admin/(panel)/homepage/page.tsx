import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getSettings } from "@/lib/settings";
import { PageHeader } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
export const metadata = { title: "Homepage" };

export default async function HomepageAdmin() {
  await requireUser("homepage.write");
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Homepage" desc="Hero, introduction and statistics. Featured products, categories, services, brands and testimonials are managed in their own sections." />
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        {[["/admin/products", "Featured products (tick “Featured”)"], ["/admin/categories", "Product categories"], ["/admin/services", "Service highlights"], ["/admin/brands", "Brand logos"], ["/admin/testimonials", "Testimonials"], ["/admin/banners", "Banners"]].map(([h, l]) => <Link key={h} href={h} className="rounded-full bg-white px-3 py-1.5 font-semibold text-navy ring-1 ring-line hover:ring-brand-blue">{l} →</Link>)}
      </div>
      <div className="space-y-6">
        <SettingsForm section="hero" title="Hero section" initial={s.hero} fields={[{ key: "eyebrow", label: "Eyebrow / tagline" }, { key: "heading", label: "Headline" }, { key: "description", label: "Supporting text", type: "textarea" }, { key: "primaryCta", label: "Primary button", type: "link" }, { key: "secondaryCta", label: "Secondary button", type: "link" }]} />
        <SettingsForm section="intro" title="Company introduction" initial={s.intro} fields={[{ key: "heading", label: "Heading" }, { key: "body", label: "Text", type: "textarea" }, { key: "pillars", label: "Key pillars", type: "pillars" }]} />
        <SettingsForm section="stats" title="Statistics" initial={s.stats} fields={[
          { key: "showLiveCounts", label: "Show live catalogue counts (categories, products, brands, services)", type: "checkbox" },
          { key: "custom", label: "Company figures", type: "stats", help: "Only enter verified figures (e.g. years in business, completed projects). Nothing is shown if left empty." }]} />
      </div>
    </>
  );
}
